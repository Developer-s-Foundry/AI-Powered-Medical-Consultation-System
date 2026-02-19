import { Queue, QueueEvents } from 'bullmq';
import logger from '../utils/logger';

export interface SmsJobData {
  deliveryLogId: string;
  notificationId: string;
  recipientPhone?: string;
  templateType?: string;
  templateData?: Record<string, any>;
  language?: string;
  // For retry scenarios
  message?: string;
}

const smsQueue = new Queue<SmsJobData>('sms-notifications', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: {
      count: 1000,
      age: 24 * 3600
    },
    removeOnFail: {
      count: 5000
    }
  }
});

// Queue event listeners
smsQueue.on('error', (error) => {
  logger.error('SMS queue error:', error);
});

smsQueue.on('waiting', (jobId) => {
  logger.debug(`SMS job waiting: ${jobId}`);
});

// events that provide lifecycle information about jobs are emitted by QueueEvents
const smsQueueEvents = new QueueEvents('sms-notifications', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  }
});

smsQueueEvents.on('active', ({ jobId }) => {
  logger.info(`SMS job active: ${jobId}`);
});

smsQueueEvents.on('completed', ({ jobId }) => {
  logger.info(`SMS job completed: ${jobId}`);
});

smsQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`SMS job failed: ${jobId}`, failedReason);
});

smsQueueEvents.on('stalled', ({ jobId }) => {
  logger.warn(`SMS job stalled: ${jobId}`);
});

logger.info("SMS queue initialized");

export default smsQueue;