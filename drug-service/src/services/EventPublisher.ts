import rabbitmqConnection from "../config/rabbitmq";
import logger from "../utils/logger";

export class EventPublisher {
  /**
   * Publish prescription created event
   */
  async publishPrescriptionCreated(data: {
    prescriptionId: string;
    doctorId: string;
    patientId: string;
    appointmentId: string;
    diagnosis: string;
    itemCount: number;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "prescription.created",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "drugs-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        "prescription.created",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      logger.info(
        `Event published: prescription.created for ${data.prescriptionId}`,
      );
    } catch (error) {
      logger.error("Error publishing prescription.created event:", error);
      // Don't throw - we don't want to fail the prescription creation if event publishing fails
    }
  }

  /**
   * Publish prescription updated event
   */
  async publishPrescriptionUpdated(data: {
    prescriptionId: string;
    status: string;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "prescription.updated",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "drugs-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        "prescription.updated",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      logger.info(
        `Event published: prescription.updated for ${data.prescriptionId}`,
      );
    } catch (error) {
      logger.error("Error publishing prescription.updated event:", error);
    }
  }

  /**
   * Publish prescription fulfilled event
   */
  async publishPrescriptionFulfilled(data: {
    prescriptionId: string;
    patientId: string;
    pharmacyId: string;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "prescription.fulfilled",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "drugs-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        "prescription.fulfilled",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      logger.info(
        `Event published: prescription.fulfilled for ${data.prescriptionId}`,
      );
    } catch (error) {
      logger.error("Error publishing prescription.fulfilled event:", error);
    }
  }

  /**
   * Publish drug created event
   */
  async publishDrugCreated(data: {
    drugId: string;
    pharmacyId: string;
    medicineName: string;
    price: number;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "drug.created",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "drugs-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        "drug.created",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      logger.info(`Event published: drug.created for ${data.medicineName}`);
    } catch (error) {
      logger.error("Error publishing drug.created event:", error);
    }
  }

  /**
   * Publish drug stock updated event
   */
  async publishDrugStockUpdated(data: {
    drugId: string;
    pharmacyId: string;
    medicineName: string;
    oldQuantity: number;
    newQuantity: number;
  }): Promise<void> {
    try {
      const channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      const event = {
        eventType: "drug.stock.updated",
        timestamp: new Date().toISOString(),
        metadata: {
          serviceId: "drugs-service",
          version: "1.0",
        },
        payload: data,
      };

      channel.publish(
        exchange,
        "drug.stock.updated",
        Buffer.from(JSON.stringify(event)),
        { persistent: true },
      );

      logger.info(
        `Event published: drug.stock.updated for ${data.medicineName}`,
      );
    } catch (error) {
      logger.error("Error publishing drug.stock.updated event:", error);
    }
  }
}

export default new EventPublisher();
