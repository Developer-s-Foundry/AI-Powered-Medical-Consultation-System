"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
const payment_service_1 = require("../model/service/payment.service");
class PaymentWorker {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
        this.paymentService = new payment_service_1.PaymentService();
    }
    newWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentWorker = new bullmq_1.Worker('payment', (job) => __awaiter(this, void 0, void 0, function* () {
                this.logger.info(`Processing job ${job.id}`, job.data);
                switch (job.name) {
                    case 'process-payment':
                        yield this.paymentService.handlePaymentProcess(job.data);
                        break;
                    default:
                        throw new Error(`Unknown job type: ${job.name}`);
                }
            }), {
                connection: redis_1.redisConfig,
                concurrency: 5, // process 5 jobs simultaneously
            });
            paymentWorker.on('completed', (job) => {
                console.log(`Job ${job.id} completed`);
            });
            paymentWorker.on('failed', (job, err) => {
                console.error(`Job ${job === null || job === void 0 ? void 0 : job.id} failed:`, err.message);
            });
        });
    }
}
exports.PaymentWorker = PaymentWorker;
