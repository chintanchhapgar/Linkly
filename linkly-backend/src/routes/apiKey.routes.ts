import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { generateApiKey, hashApiKey } from '../lib/apiKey';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1).max(50),
});

// List all API keys for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        isActive: true,
        lastUsed: true,
        usageCount: true,
        createdAt: true,
        // Never return keyHash!
      },
    });

    res.json(keys);
  } catch (error) {
    next(error);
  }
});

// Create new API key
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name } = createSchema.parse(req.body);

    // Check limit (max 5 keys per user)
    const count = await prisma.apiKey.count({
      where: { userId: req.userId, isActive: true },
    });

    if (count >= 5) {
      return res.status(403).json({ 
        error: 'Maximum 5 active API keys allowed. Revoke old keys first.' 
      });
    }

    // Generate and hash key
    const rawKey = generateApiKey();
    const keyHash = await hashApiKey(rawKey);

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        userId: req.userId!,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    // ⚠️ Return raw key ONCE - user must save it
    res.json({
      ...apiKey,
      key: rawKey,
      message: 'Save this key! You won\'t be able to see it again.',
    });
  } catch (error) {
    next(error);
  }
});

// Revoke (delete) API key
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const key = await prisma.apiKey.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!key) return res.status(404).json({ error: 'Not found' });

    await prisma.apiKey.delete({ where: { id: key.id } });

    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    next(error);
  }
});

// Toggle active status
router.patch('/:id/toggle', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const key = await prisma.apiKey.findFirst({
      where: { id: req.params.id as string, userId: req.userId },
    });
    if (!key) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.apiKey.update({
      where: { id: key.id },
      data: { isActive: !key.isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
        lastUsed: true,
        usageCount: true,
        createdAt: true,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;