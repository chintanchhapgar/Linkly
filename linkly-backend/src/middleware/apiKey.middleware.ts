import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { compareApiKey } from '../lib/apiKey';

export interface ApiKeyRequest extends Request {
  apiUserId?: string;
}

export async function authenticateApiKey(
  req: ApiKeyRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const keys = await prisma.apiKey.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    for (const keyRecord of keys) {
      const valid = await compareApiKey(apiKey, keyRecord.keyHash);
      if (valid) {
        req.apiUserId = keyRecord.userId;

        await prisma.apiKey.update({
          where: { id: keyRecord.id },
          data: {
            lastUsed: new Date(),
            usageCount: { increment: 1 },
          },
        });

        return next();
      }
    }

    return res.status(401).json({ error: 'Invalid API key' });
  } catch (error) {
    next(error);
  }
}