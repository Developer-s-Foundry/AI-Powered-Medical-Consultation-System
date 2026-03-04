import Redis from "ioredis";
import logger from "../utils/logger";
import config from "./index";

const redisConnection = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisConnection.on("connect", () => {
  logger.info(" Redis connected");
});

redisConnection.on("error", (error) => {
  logger.error(" Redis connection error:", error);
});

redisConnection.on("close", () => {
  logger.warn("Redis connection closed");
});

export default redisConnection;
