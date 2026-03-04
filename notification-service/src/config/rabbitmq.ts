import amqp, { Channel, ChannelModel } from "amqplib";
import logger from "../utils/logger";

class RabbitMQConnection {
  // amqplib.connect() actually resolves to a ChannelModel (see @types/amqplib)
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  private readonly exchange: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.url = process.env.RABBITMQ_URL || "amqp://localhost:5675";
    this.exchange = process.env.RABBITMQ_EXCHANGE || "health-bridge-events";
  }

  async connect(): Promise<void> {
    try {
      // connect returns a ChannelModel; it contains a reference to the underlying connection
      this.connection = (await amqp.connect(this.url)) as ChannelModel;
      this.channel = await this.connection.createChannel();

      if (this.channel) {
        await this.channel.assertExchange(this.exchange, "topic", {
          durable: true,
        });
      }

      logger.info(" RabbitMQ connected");

      // Handle connection events
      if (this.connection) {
        // ChannelModel is an EventEmitter; these events fire when the underlying connection closes/errors
        this.connection.on("error", (err) => {
          logger.error(" RabbitMQ connection error:", err);
          this.reconnect();
        });

        this.connection.on("close", () => {
          logger.warn(" RabbitMQ connection closed");
          this.reconnect();
        });
      }
    } catch (error) {
      logger.error(" RabbitMQ connection failed:", error);
      this.reconnect();
    }
  }

  private reconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      logger.info("🔄 Attempting to reconnect to RabbitMQ...");
      this.connect();
    }, 5000);
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    return this.channel;
  }

  getExchange(): string {
    return this.exchange;
  }

  async close(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.channel) {
      await this.channel.close();
    }

    if (this.connection) {
      // ChannelModel exposes close() which terminates the connection
      await this.connection.close();
    }

    logger.info("RabbitMQ connection closed");
  }
}

export default new RabbitMQConnection();
