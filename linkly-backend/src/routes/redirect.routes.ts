import { Router } from 'express';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { io } from '../index';  // ← Import io

const router = Router();

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    console.log(`🔗 Redirect: ${code}`);

    const reserved = ['api', 'health', 'favicon.ico'];
    if (reserved.includes(code)) {
      return res.status(404).send('Not found');
    }

    let originalUrl: string | null = null;
    let linkId: string | null = null;
    let isActive: boolean = true;
    let expiresAt: Date | null = null;
    let hasPassword: boolean = false;

    const cachedData = await redis.get(`link:${code}`);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        originalUrl = parsed.url;
        linkId = parsed.id;
        isActive = parsed.isActive !== false;
        expiresAt = parsed.expiresAt ? new Date(parsed.expiresAt) : null;
        hasPassword = parsed.hasPassword === true;
      } catch {
        originalUrl = null;
      }
    }

    if (!originalUrl || !linkId) {
      const link = await prisma.link.findUnique({
        where: { shortCode: code },
      });

      if (!link) {
        return res.status(404).send(renderErrorPage('Link not found', 'This short link does not exist.'));
      }

      originalUrl = link.originalUrl;
      linkId = link.id;
      isActive = link.isActive;
      expiresAt = link.expiresAt;
      hasPassword = !!link.password;

      await redis.setex(
        `link:${code}`,
        3600,
        JSON.stringify({
          url: originalUrl,
          id: linkId,
          isActive,
          expiresAt: expiresAt?.toISOString() || null,
          hasPassword,
        })
      );
    }

    if (!isActive) {
      return res.status(410).send(renderErrorPage('Link Disabled', 'This link has been disabled by the owner.'));
    }

    if (expiresAt && expiresAt < new Date()) {
      return res.status(410).send(renderErrorPage('Link Expired', 'This link has expired.'));
    }

    if (hasPassword) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/protected/${code}`);
    }

    if (linkId) {
      trackClick(linkId, req).catch(console.error);
    }

    return res.redirect(302, originalUrl);
  } catch (error) {
    console.error('❌ Redirect error:', error);
    return res.status(500).send(renderErrorPage('Error', 'Something went wrong.'));
  }
});

async function trackClick(linkId: string, req: any) {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ua = new UAParser(userAgent);

    const ip = (
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1'
    ) as string;

    const cleanIp = ip.split(',')[0].trim().replace('::ffff:', '');
    const geo = geoip.lookup(cleanIp);
    const ipHash = crypto.createHash('sha256').update(cleanIp).digest('hex');

    const clickData = {
      linkId,
      ipHash,
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      device: ua.getDevice().type || 'desktop',
      browser: ua.getBrowser().name || 'Unknown',
      os: ua.getOS().name || 'Unknown',
      referrer: req.headers.referer || null,
      userAgent: userAgent,
    };

    // Save to DB
    await prisma.clickEvent.create({ data: clickData });

    const updated = await prisma.link.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
      include: { user: true },
    });

    console.log(`✅ Click tracked for ${linkId}, total: ${updated.clicks}`);

    // 🔥 Emit real-time events
    const eventData = {
      linkId,
      shortCode: updated.shortCode,
      totalClicks: updated.clicks,
      country: clickData.country,
      city: clickData.city,
      device: clickData.device,
      browser: clickData.browser,
      timestamp: new Date().toISOString(),
    };

    // Emit to user's room (updates dashboard)
    io.to(`user-${updated.userId}`).emit('new-click', eventData);
    console.log(`📡 Emitted to user-${updated.userId}`);

    // Emit to link's room (updates analytics page)
    io.to(`link-${linkId}`).emit('link-click', eventData);
    console.log(`📡 Emitted to link-${linkId}`);

  } catch (error) {
    console.error('❌ Track click error:', error);
  }
}

function renderErrorPage(title: string, message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Linkly</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0a0a0f;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-image: 
        linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .container {
      max-width: 500px;
      text-align: center;
      background: #12121a;
      border: 1px solid #27272f;
      border-radius: 16px;
      padding: 3rem 2rem;
    }
    .icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #a855f7 0%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: #a1a1aa; margin-bottom: 2rem; line-height: 1.6; }
    a {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #a855f7 0%, #06b6d4 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔗</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Go to Linkly</a>
  </div>
</body>
</html>`;
}

export default router;