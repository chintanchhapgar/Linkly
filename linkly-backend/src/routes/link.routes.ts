import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const createSchema = z.object({
  originalUrl: z.string().url(),
  customCode: z.string().optional(),
  title: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Create link
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const shortCode = data.customCode || nanoid(7);

    // Check if code exists
    const existing = await prisma.link.findUnique({ where: { shortCode } });
    if (existing) return res.status(400).json({ error: 'Code already taken' });

    const link = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: data.originalUrl,
        title: data.title,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        userId: req.userId!,
      },
    });

    // Cache in Redis
    await redis.setex(`link:${shortCode}`, 3600, data.originalUrl);

    res.json({
      ...link,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (error) {
    next(error);
  }
});

// Get all user links
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
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

// Delete link
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const link = await prisma.link.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!link) return res.status(404).json({ error: 'Not found' });

    await prisma.link.delete({ where: { id: link.id } });
    await redis.del(`link:${link.shortCode}`);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;