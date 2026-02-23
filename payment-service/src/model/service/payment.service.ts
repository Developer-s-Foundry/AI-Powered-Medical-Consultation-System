import { PaymentRepository } from "../repository/payment.repository";
import { Payment } from "../entities/payment.entity";
import { PaymentType } from "../../types/entity.types";


export class PaymentService {

    private paymentRepository: PaymentRepository;

    constructor() {
        this.paymentRepository = new PaymentRepository();
    }

    async createPayment(paymentData: PaymentType) {
        return await this.paymentRepository.createPayment(paymentData);
    }

    async getPaymentById(paymentId: string) {
        return await this.paymentRepository.getPaymentById(paymentId);
    }

    async updatePayment(paymentId: string, updateData: Partial<Payment>) {
        return await this.paymentRepository.updatePayment(paymentId, updateData);
    }
}