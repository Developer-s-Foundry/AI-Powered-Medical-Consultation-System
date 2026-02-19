import rabbitmqConnection from "./config/rabbitmq";
import { EventType, AppointmentConfirmedEvent } from "./@types/event.types";
import logger from "./utils/logger";

async function publishTestEvent() {
  try {
    logger.info("Publishing test event...");

    // Connect to RabbitMQ
    await rabbitmqConnection.connect();
    const channel = rabbitmqConnection.getChannel();
    const exchange = rabbitmqConnection.getExchange();

    // Create test event
    const event: AppointmentConfirmedEvent = {
      eventType: EventType.APPOINTMENT_CONFIRMED,
      timestamp: new Date().toISOString(),
      metadata: {
        serviceId: "test-service",
        version: "1.0",
      },
      payload: {
        appointmentId: "550e8400-e29b-41d4-a716-446655440001",
        patientId: "550e8400-e29b-41d4-a716-446655440002",
        patientName: "John Smith",
        patientEmail: "john@example.com",
        patientPhone: "+2348012345678",
        doctorId: "550e8400-e29b-41d4-a716-446655440003",
        doctorName: "Dr. Jane Doe",
        doctorSpecialty: "Cardiologist",
        appointmentDate: "February 25, 2025",
        appointmentTime: "10:00 AM",
        clinicAddress: "123 Medical Center, Lagos",
        reason: "Regular checkup",
      },
    };

    // Publish event
    channel.publish(
      exchange,
      "appointment.confirmed",
      Buffer.from(JSON.stringify(event)),
    );

    logger.info("Test event published successfully");
    logger.info("Event type:", event.eventType);
    logger.info("Patient:", event.payload.patientEmail);

    // Wait then close
    setTimeout(async () => {
      await rabbitmqConnection.close();
      process.exit(0);
    }, 2000);
  } catch (error) {
    logger.error("Test failed:", error);
    process.exit(1);
  }
}

publishTestEvent();
