import amqp, { ChannelModel, Channel } from "amqplib";
import logger from "../utils/logger";
import config from "./index";

class RabbitMQConnection {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private exchange: string;
  private url: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;

  constructor() {
    this.url = config.rabbitmq.url;
    this.exchange = config.rabbitmq.exchange;
  }

  async connect(): Promise<void> {
    if (this.isConnecting) {
      logger.warn("RabbitMQ connection already in progress");
      return;
    }

    if (this.connection && this.channel) {
      logger.info("RabbitMQ already connected");
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(this.url);
      logger.info("RabbitMQ connection established");

      this.channel = await this.connection.createChannel();
      logger.info("RabbitMQ channel created");

      await this.channel.assertExchange(this.exchange, "topic", {
        durable: true,
      });
      logger.info(`RabbitMQ exchange '${this.exchange}' asserted`);

      this.connection.on("error", (err) => {
        logger.error("RabbitMQ connection error:", err);
        this.handleDisconnect();
      });

      this.connection.on("close", () => {
        logger.warn("RabbitMQ connection closed");
        this.handleDisconnect();
      });

      this.channel.on("error", (err) => {
        logger.error("RabbitMQ channel error:", err);
      });

      this.channel.on("close", () => {
        logger.warn("RabbitMQ channel closed");
      });

      this.isConnecting = false;
    } catch (error) {
      this.isConnecting = false;
      logger.error("Failed to connect to RabbitMQ:", error);
      this.scheduleReconnect();
      throw error;
    }
  }

  private handleDisconnect(): void {
    this.connection = null;
    this.channel = null;
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    logger.info("Scheduling RabbitMQ reconnection in 5 seconds...");

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      try {
        await this.connect();
      } catch (error) {
        logger.error("Reconnection failed:", error);
      }
    }, 5000);
  }

  getChannel(): Channel {
    if (!this.channel) throw new Error("RabbitMQ channel not initialized");
    return this.channel;
  }

  getExchange(): string {
    return this.exchange;
  }

  async close(): Promise<void> {
    try {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      if (this.channel) {
        await this.channel.close();
        this.channel = null;
        logger.info("RabbitMQ channel closed");
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
        logger.info("RabbitMQ connection closed");
      }
    } catch (error) {
      logger.error("Error closing RabbitMQ connection:", error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }
}

export default new RabbitMQConnection();
