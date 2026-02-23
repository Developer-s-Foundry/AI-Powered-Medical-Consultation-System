import { IPaymentRepository } from "../../types/repository.types";
import { Payment } from "../entities/payment.entity";
import { Provider } from "../entities/provider.entity";
import { Transaction } from "../entities/transaction.entity";
import { WebhookEvent } from "../entities/webhook.events.entity";
import { config } from "../../config/env.config";
import AppDataSource from "../../config/database";
import { PaymentType } from "../../types/entity.types";
import { AppError } from "../../utils/error";


export class PaymentRepository implements IPaymentRepository {

    private paymentRepository = AppDataSource.getRepository(Payment);
    private providerRepository = AppDataSource.getRepository(Provider);
    private transactionRepository = AppDataSource.getRepository(Transaction);
    private webhookEventRepository = AppDataSource.getRepository(WebhookEvent);


    async createPayment(paymentData: PaymentType): Promise<Payment> {
        const provider = await this.providerRepository.save({ provider_name: paymentData.provider_name, is_active: true });
        const payment = this.paymentRepository.create(paymentData);
        const reference_id = `PAY-${payment.id}-${Date.now()}`;
        const idempotency_key = `idempotency-${paymentData.user_id}-${payment.id}-${Date.now()}`;
        payment.idempotency_key = idempotency_key;
        payment.payment_reference_id = reference_id;
        payment.provider = provider;
        await this.paymentRepository.save(payment);

        // make a post request to the payment provider's API to initiate the payment process
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`
            },
            body: JSON.stringify({
                email: paymentData.email,
                amount: paymentData.amount * 100 // Paystack expects amount in kobo
            })
        });
        if (!response.ok) {
            throw new AppError(`Failed to initialize payment: ${response.statusText}`, response.status);
        }
        const result = await response.json();
        return result.access_code; // Return the access code for the payment initialization
    }

    async getPaymentById(paymentId: string): Promise<Payment> {
       const payment = await this.paymentRepository.findOne({ where: { id: paymentId }, relations: ["provider"] });
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
        // Implementation for creating a transaction record in the database
        throw new Error("Method not implemented.");
    }

    async getTransactionById(transactionId: string): Promise<Transaction | null> {
        // Implementation for retrieving a transaction record by its ID from the database
        throw new Error("Method not implemented.");
    }

    async updateTransaction(transactionId: string, updateData: Partial<Transaction>): Promise<Transaction> {
        // Implementation for updating a transaction record in the database
        throw new Error("Method not implemented.");
    }

    async createWebhookEvent(eventData: Partial<WebhookEvent>): Promise<WebhookEvent> {
        // Implementation for creating a webhook event record in the database
        throw new Error("Method not implemented.");
    }

    async getWebhookEventById(eventId: string): Promise<WebhookEvent | null> {
        // Implementation for retrieving a webhook event record by its ID from the database
        throw new Error("Method not implemented.");
    }

    async updateWebhookEvent(eventId: string, updateData: Partial<WebhookEvent>): Promise<WebhookEvent> {
        // Implementation for updating a webhook event record in the database
        throw new Error("Method not implemented.");
    }

    async createProvider(providerData: Partial<Provider>): Promise<Provider> {
        // Implementation for creating a provider record in the database
        throw new Error("Method not implemented.");
    }

    async getProviderById(providerId: string): Promise<Provider | null> {
        // Implementation for retrieving a provider record by its ID from the database
        throw new Error("Method not implemented.");
    }

    async updateProvider(providerId: string, updateData: Partial<Provider>): Promise<Provider> {
        // Implementation for updating a provider record in the database
        throw new Error("Method not implemented.");
    }
    
}