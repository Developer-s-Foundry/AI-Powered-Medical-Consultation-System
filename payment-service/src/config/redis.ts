// src/config/redis.config.ts
import { ConnectionOptions } from 'bullmq';

export const redisConfig: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB) || 0,
  maxRetriesPerRequest: 20, // required by BullMQ
  enableReadyCheck: false,    // required by BullMQ
};