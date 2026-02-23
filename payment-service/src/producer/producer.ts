import { RabbitMQConfig } from "../config/rabbitmq";
import { config } from "../config/env.config";
import { EventData, EventTypes } from "../types/event.types";


class Producer {
    private rabbitMQConfig: RabbitMQConfig;

    constructor(rabbitMQConfig: RabbitMQConfig) {
        this.rabbitMQConfig = rabbitMQConfig;
    }

    public async sendToQueue(eventType: EventTypes, data: EventData): Promise<void> {
        try {
            const exchange = config.EXCHANGE;
            const routingKey = config.ROUTINGKEY;
            const channel = await this.rabbitMQConfig.getChannel();
            await  channel.assertExchange(exchange, 'direct', {
                durable: true
                });
            const eventData = await this.notificationDataConstructor(eventType, data);
            channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(eventData)), {
                persistent: true
            });
            console.log(`Message sent to exchange ${exchange} with routing key ${routingKey}`);
        } catch (error) {
            console.error('Failed to send message to queue:', error);
        }
    }

    private async notificationDataConstructor (eventType: EventTypes, data: EventData): Promise<EventData> {
            switch (eventType) {
                case 'email_verification':
                    return {
                        eventType,
                        recipientId: data.recipientId,
                        email: data.email,
                        verificationToken: data.verificationToken,
                        recipientType: data.recipientType,
                        referenceType: data.referenceType,
                        referenceId: data.referenceId
                    };
                case 'password_reset':
                    return {
                        eventType,
                        recipientId: data.recipientId,
                        email: data.email,
                        resetToken: data.resetToken,
                        recipientType: data.recipientType,
                        referenceType: data.referenceType,
                        referenceId: data.referenceId
                    };
                default:
                    throw new Error(`Unsupported event type: ${eventType}`);
            }
        }
        }

export default Producer;