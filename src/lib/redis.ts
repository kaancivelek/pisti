import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

const REDIS_URL = process.env.REDIS_URL;

const globalForRedis = globalThis as typeof globalThis & {
  redis?: RedisClient;
  redisConnectPromise?: Promise<RedisClient>;
};

export default async function getRedisClient(): Promise<RedisClient | null> {
  if (!REDIS_URL) {
    return null;
  }

  if (!globalForRedis.redis) {
    globalForRedis.redis = createClient({ url: REDIS_URL });
    globalForRedis.redis.on("error", (err) => {
      console.error("[REDIS]", err);
    });
  }

  if (!globalForRedis.redis.isOpen) {
    if (!globalForRedis.redisConnectPromise) {
      globalForRedis.redisConnectPromise = globalForRedis.redis.connect();
    }

    try {
      await globalForRedis.redisConnectPromise;
    } catch (error) {
      globalForRedis.redisConnectPromise = undefined;
      console.warn("[REDIS] connect failed", error);
      return null;
    }
  }

  return globalForRedis.redis;
}
