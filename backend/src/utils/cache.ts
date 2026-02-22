import { getRedisClient, CACHE_TTL_SECONDS } from '../config/db';

/**
 * Get a cached value. Returns null if key doesn't exist or Redis is unavailable.
 */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    // Redis unavailable — degrade gracefully
    return null;
  }
};

/**
 * Set a cached value with TTL. Silently fails if Redis is unavailable.
 */
export const cacheSet = async (key: string, value: unknown, ttl = CACHE_TTL_SECONDS): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Redis unavailable — degrade gracefully
  }
};

/**
 * Delete a cached key. Silently fails if Redis is unavailable.
 */
export const cacheDel = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch {
    // Redis unavailable — degrade gracefully
  }
};
