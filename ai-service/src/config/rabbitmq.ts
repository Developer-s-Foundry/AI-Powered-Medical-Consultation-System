import amqp  from 'amqplib';
import { Logger } from './logger';
import { config } from './env.config';

export class RabbitMQConfig {
    private connection: amqp.ChannelModel | null = null;
    private channel: amqp.Channel | null = null;
    private readonly url: string;
    private logger: Logger;
    
    constructor() {
        this.url = config.RABBITMQURL;
        this.logger = Logger.getInstance();
    }

    public async getConnection(): Promise<amqp.ChannelModel> {
        try {
             if (!this.connection) {
            this.connection = await (amqp.connect(this.url));
            }
            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error:', err);
                this.timeoutRetrial(() => this.getConnection(), 5, 2000)
                .catch(error => {
                    this.logger.error('Failed to reconnect to RabbitMQ after multiple attempts:', error);
                });
            });
            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed');
                 this.timeoutRetrial(() => this.getConnection(), 5, 2000)
                .catch(error => {
                    this.logger.error('Failed to reconnect to RabbitMQ after multiple attempts:', error);
                });
            });
        } catch (error) {
            this.logger.error('Failed to connect to RabbitMQ:', error);
        }
        return this.connection as amqp.ChannelModel;
    }

    public async timeoutRetrial<T>(fn: () => Promise<T>, 
    retries: number, delay: number): Promise<T> {
        let attempt = 0;
        let connection: T | null = null;

        while (attempt < retries) {
            try {
                connection = await fn();
                break
               
            } catch (error) {
                this.logger.error(`Attempt ${attempt + 1} failed:`, error);
                if (attempt === retries - 1) {
                    throw new Error('Max retries reached. Operation failed.');
                }
                // Wait for the specified delay before retrying then resolve the promise
                await new Promise(resolve => setTimeout(resolve, delay));
                attempt++;
            }
        }
        return connection as T;
    }

    public async getChannel(): Promise<amqp.Channel> {
        if (!this.channel) {
            const connection = await this.getConnection();
            this.channel = await connection.createChannel();
        }
        return this.channel;
    }

    // Close the connection and channel when the application is shutting down
    public async closeConnection(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }
}


