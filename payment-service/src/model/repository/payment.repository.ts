import { Response } from 'express';
import { IPaymentRepository } from "../../types/repository.types";
import { Payment } from "../entities/payment.entity";
import { Provider } from "../entities/provider.entity";
import { Transaction } from "../entities/transaction.entity";
import { WebhookEvent } from "../entities/webhook.events.entity";
import { config } from "../../config/env.config";
import AppDataSource from "../../config/database";
import { DoctorsPaymentData, PaymentType } from "../../types/entity.types";
import { AppError } from "../../utils/error";


export class PaymentRepository implements IPaymentRepository {

    private paymentRepository = AppDataSource.getRepository(Payment);
    private providerRepository = AppDataSource.getRepository(Provider);
    private transactionRepository = AppDataSource.getRepository(Transaction);
    private webhookEventRepository = AppDataSource.getRepository(WebhookEvent);


    async createPayment(paymentData: PaymentType):  Promise<Payment> {
        const provider = await this.providerRepository.save({ provider_name: paymentData.provider_name, is_active: true });
        const payment = this.paymentRepository.create(paymentData);
        const reference_id = `PAY-${payment.id}-${Date.now()}`;
        const idempotency_key = `idempotency-${paymentData.user_id}-${payment.id}-${Date.now()}`;
        payment.idempotency_key = idempotency_key;
        payment.payment_reference_id = reference_id;
        payment.provider = provider;
        return await this.paymentRepository.save(payment);
    }
    

    async getPaymentById(paymentId: string): Promise<Payment> {
       const payment = await this.paymentRepository.findOne({ where: { id: paymentId }, relations: ["provider"] });
       if (!payment) {
        throw new AppError("Payment not found", 404);
       }
       return payment;
    }

    async getPaymentByReferenceId(paymentReferenceId: string):Promise<Payment> {
        const payment =  await this.paymentRepository.findOne({where: {id: paymentReferenceId}})
        if (!payment) {
        throw new AppError("Payment not found", 404);
       }
       return payment;
    }

    async updatePayment(paymentId: string, updateData: Partial<Payment>): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
        if (!payment) {
            throw new AppError("Payment not found", 404);
        }
        Object.assign(payment, updateData);
        await this.paymentRepository.save(payment);
        return payment;
    }

    async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
      const {payment_reference_id, amount, status, response_payload} = transactionData;
      if (!payment_reference_id) {
        throw new AppError('payment_reference_id not provided', 404)
      }
      const payment = await this.getPaymentByReferenceId(payment_reference_id)
      return await this.transactionRepository.save(
        {...transactionData, payment}
      )
    }

    async createWebhookEvent(eventData: Partial<WebhookEvent>): Promise<WebhookEvent> {
        const webhook = await this.webhookEventRepository.save(eventData)
        return webhook;
    }
    
    // async getTransactionById(transactionId: string): Promise<Transaction | null> {
    //     // Implementation for retrieving a transaction record by its ID from the database
    //     throw new Error("Method not implemented.");
    // }

    // async getWebhookEventById(eventId: string): Promise<WebhookEvent | null> {
    //     // Implementation for retrieving a webhook event record by its ID from the database
    //     throw new Error("Method not implemented.");
    // }

    // async updateWebhookEvent(eventId: string, updateData: Partial<WebhookEvent>): Promise<WebhookEvent> {
    //     // Implementation for updating a webhook event record in the database
    //     throw new Error("Method not implemented.");
    // }
    
}