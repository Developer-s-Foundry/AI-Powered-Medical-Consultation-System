import { Payment } from "../model/entities/payment.entity";
import { WebhookEvent } from "../model/entities/webhook.events.entity";
import { Provider } from "../model/entities/provider.entity";
import { Transaction } from "../model/entities/transaction.entity";


export interface IPaymentRepository {

    createPayment(paymentData: Partial<Payment>): Promise<Payment>

    getPaymentById(paymentId: string): Promise<Payment | null>

    updatePayment(paymentId: string, updateData: Partial<Payment>): Promise<Payment>

    createTransaction(transactionData: Partial<Transaction>): Promise<Transaction>

    getTransactionById(transactionId: string): Promise<Transaction | null>

    updateTransaction(transactionId: string, updateData: Partial<Transaction>): Promise<Transaction>

    createWebhookEvent(eventData: Partial<WebhookEvent>): Promise<WebhookEvent>

    getWebhookEventById(eventId: string): Promise<WebhookEvent | null>

    updateWebhookEvent(eventId: string, updateData: Partial<WebhookEvent>): Promise<WebhookEvent>

    createProvider(providerData: Partial<Provider>): Promise<Provider>

    getProviderById(providerId: string): Promise<Provider | null>

    updateProvider(providerId: string, updateData: Partial<Provider>): Promise<Provider>
        
}