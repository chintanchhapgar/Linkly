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
  expiresAt: z.string().optional().nullable(),
});

const updateSchema = z.object({
  originalUrl: z.string().url().optional(),
  title: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

// Helper to safely parse date
function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date;
}

// Create link
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    console.log('📥 Create request:', req.body);
    const data = createSchema.parse(req.body);
    const shortCode = data.customCode || nanoid(7);

    const existing = await prisma.link.findUnique({ where: { shortCode } });
    if (existing) return res.status(400).json({ error: 'Code already taken' });

    const link = await prisma.link.create({
      data: {
        shortCode,
        originalUrl: data.originalUrl,
        title: data.title,
        expiresAt: parseDate(data.expiresAt),
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
      })
    );

    res.json({
      ...link,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (error: any) {
    console.error('❌ Create error:', error);
    next(error);
  }
});

// Get all user links with search & filter
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      search = '',
      status = 'all',
      sortBy = 'newest',
    } = req.query as Record<string, string>;

    // Build where clause
    const where: any = { userId: req.userId };

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
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

    // Sort options
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sortBy === 'clicks') orderBy = { clicks: 'desc' };
    else if (sortBy === 'alphabetical') orderBy = { title: 'asc' };

    const links = await prisma.link.findMany({
      where,
      orderBy,
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

// Get single link
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const link = await prisma.link.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!link) return res.status(404).json({ error: 'Not found' });

    res.json({
      ...link,
      shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
    });
  } catch (error) {
    next(error);
  }
});

// ✨ Update link
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    console.log('📥 Update request:', req.body);
    const data = updateSchema.parse(req.body);
    console.log('✅ Parsed data:', data);

    const existing = await prisma.link.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // Build update object
    const updateData: any = {};
    if (data.originalUrl !== undefined) updateData.originalUrl = data.originalUrl;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = parseDate(data.expiresAt);
    }

    console.log('💾 Updating with:', updateData);

    const updated = await prisma.link.update({
      where: { id: req.params.id },
      data: updateData,
    });

    console.log('✅ Updated link:', updated);

    // Update cache with FULL data
    await redis.setex(
      `link:${updated.shortCode}`,
      3600,
      JSON.stringify({
        url: updated.originalUrl,
        id: updated.id,
        isActive: updated.isActive,
        expiresAt: updated.expiresAt?.toISOString() || null,
      })
    );

    res.json({
      ...updated,
      shortUrl: `${process.env.BASE_URL}/${updated.shortCode}`,
    });
  } catch (error: any) {
    console.error('❌ Update error:', error);
    if (error.errors) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
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