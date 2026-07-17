import { Router } from 'express';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const router = Router();

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    console.log(`🔗 Redirect request for code: ${code}`);

    // Skip reserved routes
    const reserved = ['api', 'health', 'favicon.ico'];
    if (reserved.includes(code)) {
      return res.status(404).send('Not found');
    }

    let originalUrl: string | null = null;
    let linkId: string | null = null;

    // Try to get BOTH url and id from cache
    const cachedData = await redis.get(`link:${code}`);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        originalUrl = parsed.url;
        linkId = parsed.id;
        console.log(`⚡ Cache hit for ${code}`);
      } catch {
        // Old cache format, ignore
        originalUrl = null;
      }
    }

    // Cache miss or invalid cache - hit database
    if (!originalUrl || !linkId) {
      console.log(`📀 Cache miss - checking database for ${code}`);
      
      const link = await prisma.link.findUnique({
        where: { shortCode: code },
      });

      if (!link) {
        console.log(`❌ Link not found: ${code}`);
        return res.status(404).send('Link not found');
      }

      if (!link.isActive) {
        return res.status(410).send('Link is disabled');
      }

      if (link.expiresAt && link.expiresAt < new Date()) {
        return res.status(410).send('Link expired');
      }

      originalUrl = link.originalUrl;
      linkId = link.id;

      // Cache both url and id together
      await redis.setex(
        `link:${code}`,
        3600,
        JSON.stringify({ url: originalUrl, id: linkId })
      );
    }

    // Track click (now linkId is guaranteed to exist)
    if (linkId) {
      await trackClick(linkId, req);
      console.log(`✅ Click tracked for linkId: ${linkId}`);
    }

    // Redirect
    console.log(`➡️ Redirecting to: ${originalUrl}`);
    return res.redirect(302, originalUrl);
  } catch (error) {
    console.error('❌ Redirect error:', error);
    return res.status(500).send('Error');
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

    console.log(`📊 Tracking: IP=${cleanIp}, Country=${geo?.country || 'Unknown'}`);

    // Create click event
    await prisma.clickEvent.create({
      data: {
        linkId,
        ipHash,
        country: geo?.country || 'Unknown',
        city: geo?.city || 'Unknown',
        device: ua.getDevice().type || 'desktop',
        browser: ua.getBrowser().name || 'Unknown',
        os: ua.getOS().name || 'Unknown',
        referrer: req.headers.referer || null,
        userAgent: userAgent,
      },
    });

    // Increment counter
    await prisma.link.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
    });

    console.log(`✅ Click saved to database`);
  } catch (error) {
    console.error('❌ Track click error:', error);
  }
}

export default router;