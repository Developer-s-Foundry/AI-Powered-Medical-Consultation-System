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
Object.defineProperty(exports, "__esModule", { value: true });
const env_config_1 = require("../config/env.config");
const event_types_1 = require("../types/event.types");
class Producer {
    constructor(rabbitMQConfig) {
        this.rabbitMQConfig = rabbitMQConfig;
    }
    sendToQueue(eventType, eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const exchange = env_config_1.config.EXCHANGE;
                const routingKey = env_config_1.config.ROUTINGKEY;
                const channel = yield this.rabbitMQConfig.getChannel();
                yield channel.assertExchange(exchange, 'direct', {
                    durable: true
                });
                const data = yield this.notificationDataConstructor(eventType, eventData);
                channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
                    persistent: true
                });
                console.log(`Message sent to exchange ${exchange} with routing key ${routingKey}`);
            }
            catch (error) {
                console.error('Failed to send message to queue:', error);
            }
        });
    }
    notificationDataConstructor(eventType, eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (eventType) {
                case event_types_1.EventType.PAYMENT_SUCCESS:
                    return {
                        eventType: event_types_1.EventType.PAYMENT_SUCCESS,
                        payload: {
                            transactionId: eventData.transactionId,
                            bookingId: eventData.bookingId,
                            patientId: eventData.patientId,
                            patientEmail: eventData.patientEmail,
                            amount: eventData.amount,
                            currency: eventData.currency,
                            transactionReference: eventData.transactionReference,
                            paymentDate: eventData.Date
                        }
                    };
                case event_types_1.EventType.PAYMENT_FAILED:
                    return {
                        eventType: event_types_1.EventType.PAYMENT_FAILED,
                        payload: {
                            transactionId: eventData.transactionId,
                            bookingId: eventData.bookingId,
                            patientId: eventData.patientId,
                            patientEmail: eventData.patientEmail,
                            amount: eventData.amount,
                            reason: eventData.reason
                        }
                    };
                case event_types_1.EventType.CREATE_APPOINTMENT:
                    return {
                        eventType: event_types_1.EventType.CREATE_APPOINTMENT,
                        payload: {
                            bookingId: eventData.bookingId,
                            patientId: eventData.patientId
                        }
                    };
                default:
                    throw new Error(`Unsupported event type: ${eventType}`);
            }
        });
    }
}
exports.default = Producer;
