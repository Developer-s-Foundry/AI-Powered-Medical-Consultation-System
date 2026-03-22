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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const payment_entity_1 = require("../entities/payment.entity");
const provider_entity_1 = require("../entities/provider.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
const webhook_events_entity_1 = require("../entities/webhook.events.entity");
const database_1 = __importDefault(require("../../config/database"));
const error_1 = require("../../utils/error");
class PaymentRepository {
    constructor() {
        this.paymentRepository = database_1.default.getRepository(payment_entity_1.Payment);
        this.providerRepository = database_1.default.getRepository(provider_entity_1.Provider);
        this.transactionRepository = database_1.default.getRepository(transaction_entity_1.Transaction);
        this.webhookEventRepository = database_1.default.getRepository(webhook_events_entity_1.WebhookEvent);
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
    createPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = yield this.providerRepository.save({ provider_name: paymentData.provider_name, is_active: true });
            const payment = this.paymentRepository.create(paymentData);
            const reference_id = `PAY-${payment.id}-${Date.now()}`;
            const idempotency_key = `idempotency-${paymentData.patient_id}-${payment.id}-${Date.now()}`;
            payment.idempotency_key = idempotency_key;
            payment.payment_reference_id = reference_id;
            payment.provider = provider;
            return yield this.paymentRepository.save(payment);
        });
    }
    getPaymentById(paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentRepository.findOne({ where: { id: paymentId }, relations: ["provider"] });
            if (!payment) {
                throw new error_1.AppError("Payment not found", 404);
            }
            return payment;
        });
    }
    getPaymentByReferenceId(paymentReferenceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentRepository.findOne({ where: { id: paymentReferenceId } });
            if (!payment) {
                throw new error_1.AppError("Payment not found", 404);
            }
            return payment;
        });
    }
    verifyPayment(paymentReferenceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentRepository.findOne({ where: { id: paymentReferenceId } });
            if (!payment) {
                throw new error_1.AppError("Payment not found", 404);
            }
            return payment;
        });
    }
    updatePayment(paymentId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentRepository.findOne({ where: { id: paymentId } });
            if (!payment) {
                throw new error_1.AppError("Payment not found", 404);
            }
            Object.assign(payment, updateData);
            yield this.paymentRepository.save(payment);
            return payment;
        });
    }
    createTransaction(transactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { payment_reference_id, amount, status, response_payload } = transactionData;
            if (!payment_reference_id) {
                throw new error_1.AppError('payment_reference_id not provided', 404);
            }
            const payment = yield this.getPaymentByReferenceId(payment_reference_id);
            return yield this.transactionRepository.save(Object.assign(Object.assign({}, transactionData), { payment }));
        });
    }
    createWebhookEvent(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const webhook = yield this.webhookEventRepository.save(eventData);
            return webhook;
        });
    }
}
exports.PaymentRepository = PaymentRepository;
