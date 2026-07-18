import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';

console.log('🔧 Connecting to Redis:', redisUrl.slice(0, 20) + '...');

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: false,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});