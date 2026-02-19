import { Queue, QueueEvents } from "bullmq";
import redisConnection from "../config/redis";
import logger from "../utils/logger";

export interface EmailJobData {
  deliveryLogId: string;
  notificationId: string;
  recipientEmail?: string;
  templateType?: string;
  templateData?: Record<string, any>;
  language?: string;
  // For retry scenarios
  subject?: string;
  body?: string;
}

const emailQueue = new Queue<EmailJobData>("email-notifications", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // Start with 5 seconds, then 10s, 20s
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 24 * 3600, // Keep completed jobs for 24 hours
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs for debugging
    },
  },
});

// Queue event listeners
emailQueue.on("error", (error) => {
  logger.error("Email queue error:", error);
});

emailQueue.on("waiting", (jobId) => {
  logger.debug(`Email job waiting: ${jobId}`);
});

// the remaining lifecycle events are emitted via QueueEvents in bullmq
const emailQueueEvents = new QueueEvents("email-notifications", {
  connection: redisConnection as any,
});

emailQueueEvents.on("active", ({ jobId }) => {
  logger.info(`Email job active: ${jobId}`);
});

emailQueueEvents.on("completed", ({ jobId }) => {
  logger.info(`Email job completed: ${jobId}`);
});

emailQueueEvents.on("failed", ({ jobId, failedReason }) => {
  logger.error(`Email job failed: ${jobId}`, failedReason);
});

emailQueueEvents.on("stalled", ({ jobId }) => {
  logger.warn(`Email job stalled: ${jobId}`);
});

logger.info(" Email queue initialized");

export default emailQueue;
