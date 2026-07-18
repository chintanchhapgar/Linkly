import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateApiKey(): string {
  const random = crypto.randomBytes(32).toString('hex');
  return `lk_live_${random}`;
}

export async function hashApiKey(key: string): Promise<string> {
  return bcrypt.hash(key, 10);
}

export async function compareApiKey(key: string, hash: string): Promise<boolean> {
  return bcrypt.compare(key, hash);
}