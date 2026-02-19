import Redis from "ioredis";
import logger from "../utils/logger";

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisConnection.on("connect", () => {
  logger.info(" Redis connected");
});

redisConnection.on("error", (err) => {
  logger.error(" Redis connection error:", err);
});

redisConnection.on("close", () => {
  logger.warn(" Redis connection closed");
});

export default redisConnection;
