import { Queue } from "bullmq";
import { redisConfig } from '../config/redis';


export const paymentQueue = new Queue('payment', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 3,                  // retry 3 times on failure
    backoff: {
      type: 'exponential',
      delay: 1000,                // 1s, 2s, 4s...
    },
    removeOnComplete: true,       // clean up completed jobs
    removeOnFail: false,          // keep failed jobs for inspection
  },
});