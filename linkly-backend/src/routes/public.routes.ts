import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { authenticateApiKey, ApiKeyRequest } from '../middleware/apiKey.middleware';
import { PLAN_LIMITS } from '../lib/plans';

const router = Router();

const shortenSchema = z.object({
  url: z.string().url(),
  customCode: z.string().min(3).max(20).optional(),
  title: z.string().optional(),
  expiresAt: z.string().optional(),
});

// POST /api/public/shorten - Create short link
router.post('/shorten', authenticateApiKey, async (req: ApiKeyRequest, res, next) => {
  try {
    const data = shortenSchema.parse(req.body);

    // Check plan limits
    const user = await prisma.user.findUnique({
      where: { id: req.apiUserId },
      select: { plan: true },
    });

    const planInfo = PLAN_LIMITS[user!.plan as keyof typeof PLAN_LIMITS];
    
    if (planInfo.maxLinks !== -1) {
      const linkCount = await prisma.link.count({
        where: { userId: req.apiUserId },
      });

      if (linkCount >= planInfo.maxLinks) {
        return res.status(403).json({
          error: `Plan limit reached. Upgrade to create more links.`,
          plan: user!.plan,
          limit: planInfo.maxLinks,
        });
      }
    }

    const shortCode = data.customCode || nanoid(7);

    // Check if code exists
    const existing = await prisma.link.findUnique({ where: { shortCode } });
    if (existing) {
      return res.status(400).json({ error: 'Short code already taken' });
    }

    const link = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: data.url,
        title: data.title,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        userId: req.apiUserId!,
      },
    });

    // Cache
    await redis.setex(
      `link:${shortCode}`,
      3600,
      JSON.stringify({
        url: link.originalUrl,
        id: link.id,
        isActive: link.isActive,
        expiresAt: link.expiresAt?.toISOString() || null,
        hasPassword: false,
      })
    );

    res.json({
      id: link.id,
      shortCode: link.shortCode,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      originalUrl: link.originalUrl,
      title: link.title,
      createdAt: link.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/links - List all user's links (via API)
router.get('/links', authenticateApiKey, async (req: ApiKeyRequest, res, next) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId: req.apiUserId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        title: true,
        clicks: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json(
      links.map((link) => ({
        ...link,
        shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
      }))
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/public/links/:code - Get single link
router.get('/links/:code', authenticateApiKey, async (req: ApiKeyRequest, res, next) => {
  try {
    const link = await prisma.link.findUnique({
      where: { shortCode: req.params.code as string },
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
        title: true,
        clicks: true,
        isActive: true,
        userId: true,
        createdAt: true,
      },
    });

    if (!link) return res.status(404).json({ error: 'Not found' });
    if (link.userId !== req.apiUserId) return res.status(403).json({ error: 'Forbidden' });

    const { userId, ...linkData } = link;
    res.json({
      ...linkData,
      shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/public/links/:code - Delete link
router.delete('/links/:code', authenticateApiKey, async (req: ApiKeyRequest, res, next) => {
  try {
    const link = await prisma.link.findUnique({
      where: { shortCode: req.params.code as string },
    });

    if (!link) return res.status(404).json({ error: 'Not found' });
    if (link.userId !== req.apiUserId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.link.delete({ where: { id: link.id } });
    await redis.del(`link:${link.shortCode}`);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/me - Get current user info
router.get('/me', authenticateApiKey, async (req: ApiKeyRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.apiUserId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        _count: { select: { links: true } },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const planInfo = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS];

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      linksUsed: user._count.links,
      linksLimit: planInfo.maxLinks,
    });
  } catch (error) {
    next(error);
  }
});

export default router;