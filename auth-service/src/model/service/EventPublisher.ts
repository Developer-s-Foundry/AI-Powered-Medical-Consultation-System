import { RabbitMQConfig } from "../../config/rabbitmq";
import { Logger } from "../../config/logger";
import { config } from "../../config/env.config";

export class EventPublisher {
  private rabbitMQ: RabbitMQConfig;
  private logger: Logger;
  private exchange: string;

  constructor() {
    this.rabbitMQ = new RabbitMQConfig();
    this.logger = Logger.getInstance();
    this.exchange = config.EXCHANGE || "health-bridge-events";
  }

  /**
   * Initialize exchange
   */
  private async ensureExchange(): Promise<void> {
    try {
      const channel = await this.rabbitMQ.getChannel();
      await channel.assertExchange(this.exchange, "topic", {
        durable: true,
      });
    } catch (error) {
      this.logger.error("Failed to assert exchange:", error);
    }
  }

  /**
   * Publish user created event
   */
  public async publishUserCreated(user: {
    userId: string;
    email: string;
    role?: string;
  }): Promise<void> {
    try {
      await this.ensureExchange();
      const channel = await this.rabbitMQ.getChannel();

      const event = {
        eventType: "user.created",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "auth-service",
          version: "1.0",
          correlationId: `auth-${Date.now()}`,
        },
        payload: {
          userId: user.userId,
          email: user.email,
          role: user.role || "patient",
        },
      };

      channel.publish(
        this.exchange,
        "user.created",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      this.logger.info(` Event published: user.created for ${user.email}`);
    } catch (error) {
      this.logger.error(" Error publishing user.created event:", error);
      // Don't throw - we don't want registration to fail if event publishing fails
    }
  }

  /**
   * Publish email verified event
   */
  public async publishEmailVerified(user: {
    userId: string;
    email: string;
    role?: string;
  }): Promise<void> {
    try {
      await this.ensureExchange();
      const channel = await this.rabbitMQ.getChannel();

      const event = {
        eventType: "user.email.verified",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "auth-service",
          version: "1.0",
        },
        payload: {
          userId: user.userId,
          email: user.email,
          role: user.role || "patient",
        },
      };

      channel.publish(
        this.exchange,
        "user.email.verified",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      this.logger.info(
        ` Event published: user.email.verified for ${user.email}`,
      );
    } catch (error) {
      this.logger.error("Error publishing user.email.verified event:", error);
    }
  }

  /**
   * Publish user deleted event
   */
  public async publishUserDeleted(userId: string): Promise<void> {
    try {
      await this.ensureExchange();
      const channel = await this.rabbitMQ.getChannel();

      const event = {
        eventType: "user.deleted",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "auth-service",
          version: "1.0",
        },
        payload: {
          userId,
        },
      };

      channel.publish(
        this.exchange,
        "user.deleted",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      this.logger.info(` Event published: user.deleted for ${userId}`);
    } catch (error) {
      this.logger.error("Error publishing user.deleted event:", error);
    }
  }
}

export default EventPublisher;
