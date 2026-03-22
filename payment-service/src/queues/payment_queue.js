"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.paymentQueue = new bullmq_1.Queue('payment', {
    connection: redis_1.redisConfig,
    defaultJobOptions: {
        attempts: 3, // retry 3 times on failure
        backoff: {
            type: 'exponential',
            delay: 1000, // 1s, 2s, 4s...
        },
        removeOnComplete: true, // clean up completed jobs
        removeOnFail: false, // keep failed jobs for inspection
    },
});
