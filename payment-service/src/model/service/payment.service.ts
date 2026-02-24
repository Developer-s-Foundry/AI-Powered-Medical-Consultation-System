import { ReferenceType } from './../../../../notification-service/src/@types/notification.types';
import { WebhookEvent } from './../entities/webhook.events.entity';
import { PaymentRepository } from "../repository/payment.repository";
import { Payment } from "../entities/payment.entity";
import { PaymentType } from "../../types/entity.types";
import { AppError } from "../../utils/error";
import { DoctorsPaymentData } from "../../types/entity.types";
import { config } from "../../config/env.config";
import crypto from "crypto";
import { paymentQueue } from "../../queues/payment_queue";
import { BaseResponse } from "../../utils/reusable.func";
import { payment_status } from '../../types/enum.types';



export class PaymentService {

    private paymentRepository: PaymentRepository;

    constructor() {
        this.paymentRepository = new PaymentRepository();

    }

    async createPayment(paymentData: PaymentType) :Promise<{access_code: string}> {
        const payment = await this.paymentRepository.createPayment(paymentData)
        // fetch the Doctors payment data from the profile service
        const doctorPaymentData = await this.getDoctorPaymentData(paymentData.booking_id);

        // create subaccount
        const subaccount_code = await this.createSubaccount(doctorPaymentData);

    
        // initiate payment process
        return await this.initiatePayment(payment.payment_reference_id, paymentData.email,paymentData.amount, subaccount_code); 
      
    }
    private async createSubaccount(doctorPaymentData: DoctorsPaymentData): Promise<string> {
        const response = await fetch("https://api.paystack.co/subaccount", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`
            },
            body: JSON.stringify({
                business_name: doctorPaymentData.business_name,
                bank_code: doctorPaymentData.bank_code,
                account_number: doctorPaymentData.account_number,
                percentage_charge: 80
            })
        });
        if (!response.ok) {
            throw new AppError(`Failed to create subaccount: ${response.statusText}`, response.status);
        }
        const result = await response.json();
        return result.subaccount_code;
    }

    private async getDoctorPaymentData(doctorId: string): Promise<DoctorsPaymentData> {
        const response = await fetch(`http://profile/doctors/${doctorId}/payment-data`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new AppError(`Failed to fetch doctor's payment data: ${response.statusText}`, response.status);
        }
        return await response.json();
    }

    private async initiatePayment (reference_id: string, email: string, amount: number, subaccount_code: string) : Promise<{access_code: string}> {
         // make a post request to the payment provider's API to initiate the payment process
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`
            },
            body: JSON.stringify({
                email,
                amount: amount * 100, // Paystack expects amount in kobo
                subaccount: subaccount_code,
                reference: reference_id
            })
        });
        if (!response.ok) {
            throw new AppError(`Failed to initialize payment: ${response.statusText}`, response.status);
        }
        const result = await response.json();
        return {access_code: result.access_code}; // Return the access code for the payment initialization

    }

    async getPaymentById(paymentId: string) {
        return await this.paymentRepository.getPaymentById(paymentId);
    }

    async getPaymentByReferenceId(paymentReferenceId: string){
        return await this.paymentRepository.getPaymentById(paymentReferenceId);
    }

    async updatePayment(paymentId: string, updateData: Partial<Payment>) {
        return await this.paymentRepository.updatePayment(paymentId, updateData);
    }

    async handlePaystackWebhook(signature: string, webhookData: any) {

        const hash = crypto.createHmac('sha512', config.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(webhookData))
        .digest('hex');
        if (hash !== signature) {
            throw new AppError('invalid paystack signature', 401)
        }
        await paymentQueue.add('process-payment', {
            webhookData
        });
        return new BaseResponse(200, 'success')
    }

    async handlePaymentProcess(webhookData: any) {
        // create webhook
        await this.paymentRepository.createWebhookEvent({
            payment_reference_id: webhookData.data.ReferenceType,
            payload: webhookData.data,
            processed: true
        });
        // create transaction
        await this.paymentRepository.createTransaction({
            payment_reference_id: webhookData.data.reference,
            amount: webhookData.data.amount,
            status: webhookData.data.status === 'success' ? payment_status.COMPLETED : payment_status.FAILED,
            response_payload: webhookData.data
        });
        // if transaction is successful, update payment service
        if (webhookData.data.status === 'success') {
            const payment = await this.paymentRepository.getPaymentByReferenceId(webhookData.data.reference);
            await this.paymentRepository.updatePayment(payment.id, {status: payment_status.COMPLETED})
            // send payment success event to notification service and ai service(to create appointment)
            
        }else {
            // send payment success event to notification service
        }
      
        
    }
}


