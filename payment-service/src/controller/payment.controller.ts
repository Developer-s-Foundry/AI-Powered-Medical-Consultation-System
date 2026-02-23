import { PaymentService } from "../model/service/payment.service";
import { Controller, Get, Post, Route, Path, Body} from "tsoa";
import { PaymentType } from "../types/entity.types";
import { Payment } from "../model/entities/payment.entity";
import { AppError } from "../utils/error";



@Route("payments")
export class PaymentController extends Controller { 
    private paymentService: PaymentService;

    constructor() {
        super();
        this.paymentService = new PaymentService();
    }

    @Post('initiate')
    public async createPayment(
        @Body() paymentData: PaymentType
    ): Promise<void> {
        await this.paymentService.createPayment(paymentData);
    }

    @Get("{paymentId}")
    public async getPaymentById(
        @Path() paymentId: string
    ): Promise<Payment> {
        const payment = this.paymentService.getPaymentById(paymentId);
        if (!payment) {
            throw new AppError("Payment not found", 404); 
        }
        return payment;
    }

    @Post("/webhook/paystack")
    public async handlePaystackWebhook(
        @Body() webhookData: any
    ): Promise<void> {
        await this.paymentService.handlePaystackWebhook(webhookData);
    }
}
        









