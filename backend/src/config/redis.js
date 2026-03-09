// backend/src/config/redis.js
import { createClient } from 'redis';

export let redisClient;

export const connectRedis = async () => {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message);
    // Non-fatal — app runs without cache
  }
};

// Cache helper
export const cache = {
  get: async (key) => {
    const data = await redisClient?.get(key);
    return data ? JSON.parse(data) : null;
  },
  set: async (key, value, ttlSeconds = 300) => {
    await redisClient?.setEx(key, ttlSeconds, JSON.stringify(value));
  },
  del: async (key) => {
    await redisClient?.del(key);
  }
};