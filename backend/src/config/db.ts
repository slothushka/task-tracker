import mongoose from 'mongoose';
import Redis from 'ioredis';

// ── MongoDB ────────────────────────────────────────────────────────────────
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  await mongoose.connect(uri);
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.connection.close();
};

// ── Redis ──────────────────────────────────────────────────────────────────
let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      // Reconnect with exponential backoff
      retryStrategy: (times) => {
        if (times > 5) return null; // stop retrying after 5 attempts
        return Math.min(times * 100, 3000);
      },
      // Don't crash app if Redis is unavailable — degrade gracefully
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    redisClient.on('connect', () => console.log('✅ Redis connected'));
    redisClient.on('error', (err) => {
      // Log but don't crash — app works without cache
      console.warn(`⚠️  Redis error (caching disabled): ${err.message}`);
    });
  }
  return redisClient;
};

export const setRedisClient = (client: Redis): void => {
  redisClient = client;
};

// Cache TTL: 5 minutes
export const CACHE_TTL_SECONDS = 300;

// Key namespacing
export const tasksCacheKey = (userId: string): string => `tasks:${userId}`;
