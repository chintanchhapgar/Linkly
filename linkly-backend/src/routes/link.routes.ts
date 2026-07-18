import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { PLAN_LIMITS } from '../lib/plans';

const router = Router();

const createSchema = z.object({
  originalUrl: z.string().url(),
  customCode: z.string().optional(),
  title: z.string().optional(),
  expiresAt: z.string().optional().nullable(),
  password: z.string().min(1).optional().nullable(),
});

const updateSchema = z.object({
  originalUrl: z.string().url().optional(),
  title: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  password: z.string().optional().nullable(),
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date;
}

// Helper: Track click event
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

    await prisma.link.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
    });

    console.log(`✅ Click tracked for protected link: ${linkId}`);
  } catch (error) {
    console.error('❌ Track click error:', error);
  }
}

// Update the create link endpoint:
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.parse(req.body);

    // ✨ Check plan limits
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { plan: true },
    });

    const planInfo = PLAN_LIMITS[user!.plan as keyof typeof PLAN_LIMITS];
    
    if (planInfo.maxLinks !== -1) {
      const linkCount = await prisma.link.count({
        where: { userId: req.userId },
      });

      if (linkCount >= planInfo.maxLinks) {
        return res.status(403).json({
          error: `You've reached the ${planInfo.name} plan limit of ${planInfo.maxLinks} links. Upgrade to create more.`,
          upgrade: true,
        });
      }
    }

    const shortCode = data.customCode || nanoid(7);

    const existing = await prisma.link.findUnique({ where: { shortCode } });
    if (existing) return res.status(400).json({ error: 'Code already taken' });

    const hashedPassword = data.password 
      ? await bcrypt.hash(data.password, 10) 
      : null;

    const link = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: data.originalUrl,
        title: data.title,
        expiresAt: parseDate(data.expiresAt),
        password: hashedPassword,
        userId: req.userId!,
      },
    });

    await redis.setex(
      `link:${shortCode}`,
      3600,
      JSON.stringify({
        url: link.originalUrl,
        id: link.id,
        isActive: link.isActive,
        expiresAt: link.expiresAt?.toISOString() || null,
        hasPassword: !!link.password,
      })
    );

    const { password, ...linkWithoutPassword } = link;
    res.json({
      ...linkWithoutPassword,
      hasPassword: !!link.password,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (error) {
    next(error);
  }
});

// Get all links (with search & filter)
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      search = '',
      status = 'all',
      sortBy = 'newest',
    } = req.query as Record<string, string>;

    const where: any = { userId: req.userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const now = new Date();
    if (status === 'active') {
      where.isActive = true;
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ];
    } else if (status === 'disabled') {
      where.isActive = false;
    } else if (status === 'expired') {
      where.expiresAt = { lt: now };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sortBy === 'clicks') orderBy = { clicks: 'desc' };
    else if (sortBy === 'alphabetical') orderBy = { title: 'asc' };

    const links = await prisma.link.findMany({
      where,
      orderBy,
    });

    res.json(
      links.map((link) => {
        const { password, ...linkWithoutPassword } = link;
        return {
          ...linkWithoutPassword,
          hasPassword: !!link.password,
          shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
        };
      })
    );
  } catch (error) {
    next(error);
  }
});

// Get single link
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const link = await prisma.link.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!link) return res.status(404).json({ error: 'Not found' });

    const { password, ...linkWithoutPassword } = link;
    res.json({
      ...linkWithoutPassword,
      hasPassword: !!link.password,
      shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
    });
  } catch (error) {
    next(error);
  }
});

// Update link
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateSchema.parse(req.body);

    const existing = await prisma.link.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const updateData: any = {};
    if (data.originalUrl !== undefined) updateData.originalUrl = data.originalUrl;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = parseDate(data.expiresAt);
    }
    
    if (data.password !== undefined) {
      if (data.password === null || data.password === '') {
        updateData.password = null;
      } else {
        updateData.password = await bcrypt.hash(data.password, 10);
      }
    }

    const updated = await prisma.link.update({
      where: { id: req.params.id as string },
      data: updateData,
    });

    await redis.setex(
      `link:${updated.shortCode}`,
      3600,
      JSON.stringify({
        url: updated.originalUrl,
        id: updated.id,
        isActive: updated.isActive,
        expiresAt: updated.expiresAt?.toISOString() || null,
        hasPassword: !!updated.password,
      })
    );

    const { password, ...linkWithoutPassword } = updated;
    res.json({
      ...linkWithoutPassword,
      hasPassword: !!updated.password,
      shortUrl: `${process.env.BASE_URL}/${updated.shortCode}`,
    });
  } catch (error) {
    next(error);
  }
});

// Delete link
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const link = await prisma.link.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!link) return res.status(404).json({ error: 'Not found' });

    await prisma.link.delete({ where: { id: link.id } });
    await redis.del(`link:${link.shortCode}`);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ✨ Verify password + Track click
router.post('/:code/verify-password', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link || !link.password) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Check expired
    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Link expired' });
    }

    // Check disabled
    if (!link.isActive) {
      return res.status(410).json({ error: 'Link is disabled' });
    }

    const valid = await bcrypt.compare(password, link.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // ✅ Track the click (fire and forget)
    trackClick(link.id, req).catch(console.error);

    res.json({
      success: true,
      originalUrl: link.originalUrl,
    });
  } catch (error) {
    next(error);
  }
});

export default router;