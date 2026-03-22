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
exports.PaymentService = void 0;
const payment_repository_1 = require("../repository/payment.repository");
const error_1 = require("../../utils/error");
const env_config_1 = require("../../config/env.config");
const crypto_1 = __importDefault(require("crypto"));
const payment_queue_1 = require("../../queues/payment_queue");
const reusable_func_1 = require("../../utils/reusable.func");
const enum_types_1 = require("../../types/enum.types");
const producer_1 = __importDefault(require("../../producer/producer"));
const rabbitmq_1 = require("../../config/rabbitmq");
const event_types_1 = require("../../types/event.types");
class PaymentService {
    constructor() {
        this.paymentRepository = new payment_repository_1.PaymentRepository();
        this.producer = new producer_1.default(new rabbitmq_1.RabbitMQConfig());
    }
    createPayment(paymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentRepository.createPayment(paymentData);
            // fetch the Doctors payment data from the profile service
            const doctorPaymentData = yield this.getDoctorPaymentData(paymentData.doctor_id);
            // create subaccount
            const subaccount_code = yield this.createSubaccount(doctorPaymentData);
            // initiate payment process
            return yield this.initiatePayment(payment.payment_reference_id, paymentData.patient_email, paymentData.amount, subaccount_code);
        });
    }
    verifyPayment(paymentReferenceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const payment = yield this.paymentRepository.verifyPayment(paymentReferenceId);
            if (!payment) {
                throw new error_1.AppError("Payment not found", 404);
            }
            if (payment.status === 'completed') {
                return {
                    success: true
                };
            }
            return {
                success: false
            };
        });
    }
    createSubaccount(doctorPaymentData) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("https://api.paystack.co/subaccount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${env_config_1.config.PAYSTACK_SECRET_KEY}`
                },
                body: JSON.stringify({
                    business_name: doctorPaymentData.business_name,
                    bank_code: doctorPaymentData.bank_code,
                    account_number: doctorPaymentData.account_number,
                    percentage_charge: 80
                })
            });
            if (!response.ok) {
                throw new error_1.AppError(`Failed to create subaccount: ${response.statusText}`, response.status);
            }
            const result = yield response.json();
            return result.subaccount_code;
        });
    }
    getDoctorPaymentData(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`http://profile/doctors/${doctorId}/payment-data`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new error_1.AppError(`Failed to fetch doctor's payment data: ${response.statusText}`, response.status);
            }
            return yield response.json();
        });
    }
    initiatePayment(reference_id, email, amount, subaccount_code) {
        return __awaiter(this, void 0, void 0, function* () {
            // make a post request to the payment provider's API to initiate the payment process
            const response = yield fetch("https://api.paystack.co/transaction/initialize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${env_config_1.config.PAYSTACK_SECRET_KEY}`
                },
                body: JSON.stringify({
                    email,
                    amount: amount * 100, // Paystack expects amount in kobo
                    subaccount: subaccount_code,
                    reference: reference_id
                })
            });
            if (!response.ok) {
                throw new error_1.AppError(`Failed to initialize payment: ${response.statusText}`, response.status);
            }
            const result = yield response.json();
            return { access_code: result.access_code, reference: reference_id }; // Return the access code for the payment initialization
        });
    }
    getPaymentById(paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepository.getPaymentById(paymentId);
        });
    }
    getPaymentByReferenceId(paymentReferenceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepository.getPaymentByReferenceId(paymentReferenceId);
        });
    }
    updatePayment(paymentId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.paymentRepository.updatePayment(paymentId, updateData);
        });
    }
    handlePaystackWebhook(signature, webhookData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hash = crypto_1.default.createHmac('sha512', env_config_1.config.PAYSTACK_SECRET_KEY)
                .update(JSON.stringify(webhookData))
                .digest('hex');
            if (hash !== signature) {
                throw new error_1.AppError('invalid paystack signature', 401);
            }
            yield payment_queue_1.paymentQueue.add('process-payment', {
                webhookData
            });
            return new reusable_func_1.BaseResponse(200, 'success');
        });
    }
    handlePaymentProcess(webhookData) {
        return __awaiter(this, void 0, void 0, function* () {
            // create webhook
            yield this.paymentRepository.createWebhookEvent({
                payment_reference_id: webhookData.data.ReferenceType,
                payload: webhookData.data,
                processed: true
            });
            // create transaction
            const transaction = yield this.paymentRepository.createTransaction({
                payment_reference_id: webhookData.data.reference,
                amount: webhookData.data.amount,
                status: webhookData.data.status === 'success' ? enum_types_1.payment_status.COMPLETED : enum_types_1.payment_status.FAILED,
                response_payload: webhookData.data
            });
            const payment = yield this.paymentRepository.getPaymentByReferenceId(webhookData.data.reference);
            // if transaction is successful, update payment service
            if (webhookData.data.status === 'success') {
                yield this.paymentRepository.updatePayment(payment.id, { status: enum_types_1.payment_status.COMPLETED });
                // send payment success event to notification service and ai service(to create appointment)
                yield this.producer.sendToQueue(event_types_1.EventType.PAYMENT_SUCCESS, {
                    transactionId: transaction.id,
                    appointmentId: payment.appointment_id,
                    patientId: payment.patient_id,
                    patientEmail: payment.patient_email,
                    amount: payment.amount,
                    currency: payment.currency,
                    transactionReference: payment.payment_reference_id,
                    paymentDate: payment.createdAt
                });
                yield this.producer.sendToQueue(event_types_1.EventType.CREATE_APPOINTMENT, {
                    appointmentId: payment.appointment_id,
                    patientId: payment.patient_id,
                });
            }
            else {
                // send payment success event to notification service
                yield this.producer.sendToQueue(event_types_1.EventType.PAYMENT_FAILED, {
                    transactionId: transaction.id,
                    appointmentId: payment.appointment_id,
                    patientId: payment.patient_id,
                    patientEmail: payment.patient_email,
                    amount: payment.amount,
                    reason: 'failed to charge patient'
                });
            }
        });
    }
    getPatientProfileData(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`http://profile/doctors/${patientId}/payment-data`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new error_1.AppError(`Failed to fetch doctor's payment data: ${response.statusText}`, response.status);
            }
            const data = yield response.json();
            return {
                patientPhone: data.phone,
            };
        });
    }
}
exports.PaymentService = PaymentService;
