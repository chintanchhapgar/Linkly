import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            links: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get total clicks
    const linksData = await prisma.link.aggregate({
      where: { userId: req.userId },
      _sum: { clicks: true },
    });

    res.json({
      ...user,
      totalLinks: user._count.links,
      totalClicks: linksData._sum.clicks || 0,
    });
  } catch (error) {
    next(error);
  }
});

// Update profile (name)
router.put('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/me/password', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashed },
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete user (cascade will delete all links & clicks)
    await prisma.user.delete({
      where: { id: req.userId },
    });

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;