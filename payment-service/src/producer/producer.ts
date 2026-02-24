
import { RabbitMQConfig } from "../config/rabbitmq";
import { config } from "../config/env.config";
import {PaymentSuccessEvent, PaymentFailedEvent, EventType, AppointmentCreatedEvent } from "../types/event.types";


class Producer {
    private rabbitMQConfig: RabbitMQConfig;

    constructor(rabbitMQConfig: RabbitMQConfig) {
        this.rabbitMQConfig = rabbitMQConfig;
    }

    public async sendToQueue(eventType: EventType, eventData: any): Promise<void> {
        try {
            const exchange = config.EXCHANGE;
            const routingKey = config.ROUTINGKEY;
            const channel = await this.rabbitMQConfig.getChannel();
            await  channel.assertExchange(exchange, 'direct', {
                durable: true
                });
            const data = await this.notificationDataConstructor(eventType, eventData);
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
                persistent: true
            });
            console.log(`Message sent to exchange ${exchange} with routing key ${routingKey}`);
        } catch (error) {
            console.error('Failed to send message to queue:', error);
        }
    }

    private async notificationDataConstructor (eventType: EventType, eventData: any ): Promise<PaymentFailedEvent |PaymentSuccessEvent | AppointmentCreatedEvent> {
            switch (eventType) {
                case EventType.PAYMENT_SUCCESS:
                    return {
                        eventType: EventType.PAYMENT_SUCCESS,
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
                    }
                case EventType.PAYMENT_FAILED:
                    return {
                         eventType: EventType.PAYMENT_FAILED,
                        payload: {
                            transactionId: eventData.transactionId,
                            bookingId: eventData.bookingId,
                            patientId: eventData.patientId,
                            patientEmail: eventData.patientEmail,
                            amount: eventData.amount,
                            reason: eventData.reason
                        }
                        }
                case EventType.CREATE_APPOINTMENT:
                    return {
                        eventType: EventType.CREATE_APPOINTMENT,
                         payload: {
                            bookingId: eventData.bookingId,
                            patientId: eventData.patientId
                        }
                    }
                default:
                    throw new Error(`Unsupported event type: ${eventType}`);
            }
        }
        }

export default Producer;