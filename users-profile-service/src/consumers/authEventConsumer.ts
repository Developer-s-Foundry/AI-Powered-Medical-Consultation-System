import { Channel } from "amqplib";
import rabbitmqConnection from "../config/rabbitmq";
import logger from "../utils/logger";

interface UserCreatedEvent {
  eventType: "user.created";
  timestamp: string;
  metadata: {
    serviceId: string;
    version: string;
  };
  payload: {
    userId: string;
    email: string;
    role: string;
  };
}

interface UserUpdatedEvent {
  eventType: "user.updated";
  timestamp: string;
  metadata: {
    serviceId: string;
    version: string;
  };
  payload: {
    userId: string;
    email: string;
    updates: any;
  };
}

interface UserDeletedEvent {
  eventType: "user.deleted";
  timestamp: string;
  metadata: {
    serviceId: string;
    version: string;
  };
  payload: {
    userId: string;
  };
}

type AuthEvent = UserCreatedEvent | UserUpdatedEvent | UserDeletedEvent;

class AuthEventConsumer {
  private channel: Channel | null = null;
  private queueName = "user-profile-auth-events-queue";

  async start(): Promise<void> {
    try {
      await rabbitmqConnection.connect();
      this.channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      // Assert queue
      await this.channel.assertQueue(this.queueName, { durable: true });

      // Bind to auth events
      await this.channel.bindQueue(this.queueName, exchange, "user.created");
      await this.channel.bindQueue(this.queueName, exchange, "user.updated");
      await this.channel.bindQueue(this.queueName, exchange, "user.deleted");

      logger.info(
        " Bound to auth events: user.created, user.updated, user.deleted",
      );

      // Set prefetch
      await this.channel.prefetch(10);

      // Start consuming
      await this.channel.consume(
        this.queueName,
        async (msg) => {
          if (!msg) return;

          try {
            const event: AuthEvent = JSON.parse(msg.content.toString());
            logger.info(` Received event: ${event.eventType}`);

            await this.handleEvent(event);
            this.channel?.ack(msg);
          } catch (error) {
            logger.error("Error processing auth event:", error);
            this.channel?.nack(msg, false, true); // Requeue
          }
        },
        { noAck: false },
      );

      logger.info(" Auth event consumer started");
    } catch (error) {
      logger.error("Failed to start auth event consumer:", error);
      throw error;
    }
  }

  private async handleEvent(event: AuthEvent): Promise<void> {
    switch (event.eventType) {
      case "user.created":
        await this.handleUserCreated(event);
        break;
      case "user.updated":
        await this.handleUserUpdated(event);
        break;
      case "user.deleted":
        await this.handleUserDeleted(event);
        break;
      default:
        logger.warn(`Unknown event type: ${(event as any).eventType}`);
    }
  }

  /**
   * Handle user created - prepare for profile creation
   */
  private async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    const { userId, email, role } = event.payload;

    logger.info(`User created in Auth service: ${email} (${role})`);
    logger.info(`User ID: ${userId} - Ready for profile creation`);

    // NOTE: We DON'T automatically create profiles here
    // Profiles are created when the user explicitly calls:
    // - POST /api/patients/profile
    // - POST /api/doctors/profile
    // - POST /api/pharmacies/profile

    // This event just logs that we're aware the user exists
  }

  /**
   * Handle user updated
   */
  private async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    const { userId, email, updates } = event.payload;

    logger.info(`User updated in Auth service: ${email}`);
    logger.info(`User ID: ${userId}`);
    logger.info("Updates:", updates);

    // If needed, you can update related profile data here
    // For now, we just log it
  }

  /**
   * Handle user deleted - cascade delete profiles
   */
  private async handleUserDeleted(event: UserDeletedEvent): Promise<void> {
    const { userId } = event.payload;

    logger.info(` User deleted in Auth service: ${userId}`);
    logger.info("Deleting associated profiles...");

    // Import models dynamically to avoid circular dependencies
    const { PatientProfile } = await import("../models/PatientProfile");
    const { DoctorProfile } = await import("../models/DoctorProfile");
    const { PharmacyProfile } = await import("../models/PharmacyProfile");

    // Delete all profiles associated with this user
    const deleteResults = await Promise.allSettled([
      PatientProfile.destroy({ where: { userId } }),
      DoctorProfile.destroy({ where: { userId } }),
      PharmacyProfile.destroy({ where: { userId } }),
    ]);

    let deletedCount = 0;
    deleteResults.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value > 0) {
        const profileType = ["Patient", "Doctor", "Pharmacy"][index];
        logger.info(` ${profileType} profile deleted for user: ${userId}`);
        deletedCount++;
      }
    });

    if (deletedCount === 0) {
      logger.info(`No profiles found for deleted user: ${userId}`);
    } else {
      logger.info(
        `Total ${deletedCount} profile(s) deleted for user: ${userId}`,
      );
    }
  }

  async shutdown(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        logger.info("Auth event consumer channel closed");
      }
      await rabbitmqConnection.close();
      logger.info("Auth event consumer shut down");
    } catch (error) {
      logger.error("Error shutting down auth event consumer:", error);
    }
  }
}

export default new AuthEventConsumer();
