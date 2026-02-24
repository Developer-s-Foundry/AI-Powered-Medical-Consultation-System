import { Payment } from "../model/entities/payment.entity";
import { WebhookEvent } from "../model/entities/webhook.events.entity";
import { Transaction } from "../model/entities/transaction.entity";


export interface IPaymentRepository {

    createPayment(paymentData: Partial<Payment>):  Promise<Payment>

    getPaymentById(paymentId: string): Promise<Payment>

    updatePayment(paymentId: string, updateData: Partial<Payment>): Promise<Payment>

    createTransaction(transactionData: Partial<Transaction>): Promise<Transaction>

    getTransactionById(transactionId: string): Promise<Transaction | null>

    createWebhookEvent(eventData: Partial<WebhookEvent>): Promise<WebhookEvent>

    getWebhookEventById(eventId: string): Promise<WebhookEvent | null>
    
    getPaymentByReferenceId(paymentReferenceId: string):Promise<Payment>
        
}