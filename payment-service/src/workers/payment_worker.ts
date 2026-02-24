import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { Logger } from '../config/logger';
import { PaymentService } from '../model/service/payment.service';


export class PaymentWorker {
    private logger = Logger.getInstance()
    private paymentService = new PaymentService()

    async newWorker () {
       const paymentWorker = new Worker(
            'payment',
            async (job: Job) => {
                this.logger.info(`Processing job ${job.id}`, job.data);

                switch (job.name) {
                case 'process-payment':
                    await this.paymentService.handlePaymentProcess(job.data);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.name}`);
                }
            },
            {
                connection: redisConfig,
                concurrency: 5, // process 5 jobs simultaneously
            }
        );

        paymentWorker.on('completed', (job) => {
        console.log(`Job ${job.id} completed`);
        });

        paymentWorker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} failed:`, err.message);
        });
    }
}

