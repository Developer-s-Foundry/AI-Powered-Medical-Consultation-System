import rabbitmqConnection from "../config/rabbitmq";
import logger from "../utils/logger";

export class EventPublisher {
  /**
   * Publish profile created event
   */
  async publishProfileCreated(data: {
    userId: string;
    profileType: string;
    data: any;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "profile.created",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "user-profile-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        `profile.created.${data.profileType}`,
        Buffer.from(JSON.stringify(event)),
      );

      logger.info(`Event published: profile.created.${data.profileType}`);
    } catch (error) {
      logger.error("Error publishing profile created event:", error);
    }
  }

  /**
   * Publish profile updated event
   */
  async publishProfileUpdated(data: {
    userId: string;
    profileType: string;
    updates: any;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "profile.updated",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "user-profile-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        `profile.updated.${data.profileType}`,
        Buffer.from(JSON.stringify(event)),
      );

      logger.info(`Event published: profile.updated.${data.profileType}`);
    } catch (error) {
      logger.error("Error publishing profile updated event:", error);
    }
  }

  /**
   * Publish profile deleted event
   */
  async publishProfileDeleted(data: {
    userId: string;
    profileType: string;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "profile.deleted",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "user-profile-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        `profile.deleted.${data.profileType}`,
        Buffer.from(JSON.stringify(event)),
      );

      logger.info(`Event published: profile.deleted.${data.profileType}`);
    } catch (error) {
      logger.error("Error publishing profile deleted event:", error);
    }
  }

  /**
   * Publish schedule updated event (for doctors)
   */
  async publishScheduleUpdated(data: {
    userId: string;
    schedule: any;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "doctor.schedule.updated",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "user-profile-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        "doctor.schedule.updated",
        Buffer.from(JSON.stringify(event)),
      );

      logger.info("Event published: doctor.schedule.updated");
    } catch (error) {
      logger.error("Error publishing schedule updated event:", error);
    }
  }

  /**
   * Publish doctor bank details updated event
   */
  async publishDoctorBankUpdated(data: {
    userId: string;
    bankDetails: {
      businessName: string;
      bankCode: string;
      accountNumber: string;
      accountName?: string;
      isVerified: boolean;
    };
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "doctor.bank.updated",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "user-profile-service",
          version: "1.0",
        },
        payload: {
          userId: data.userId,
          bankDetails: data.bankDetails,
        },
      };

      channel.publish(
        exchange,
        "doctor.bank.updated",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      logger.info(` Event published: doctor.bank.updated for ${data.userId}`);
    } catch (error) {
      logger.error("Error publishing doctor.bank.updated event:", error);
    }
  }

  /**
   * Publish doctor bank verified event
   */
  async publishDoctorBankVerified(data: {
    userId: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "doctor.bank.verified",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "user-profile-service",
          version: "1.0",
        },
        payload: {
          userId: data.userId,
          accountNumber: data.accountNumber,
          accountName: data.accountName,
          bankCode: data.bankCode,
        },
      };

      channel.publish(
        exchange,
        "doctor.bank.verified",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      logger.info(` Event published: doctor.bank.verified for ${data.userId}`);
    } catch (error) {
      logger.error("Error publishing doctor.bank.verified event:", error);
    }
  }
}

export default new EventPublisher();
