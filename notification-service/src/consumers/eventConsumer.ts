import { Channel } from "amqplib";
import rabbitmqConnection from "../config/rabbitmq";
import notificationService from "../services/NotificationService";
import {
  EventType,
  HealthBridgeEvent,
  UserRegisteredEvent,
  PasswordResetRequestedEvent,
  AppointmentCreatedEvent,
  AppointmentConfirmedEvent,
  AppointmentCancelledEvent,
  PrescriptionCreatedEvent,
  PrescriptionPharmacyMatchedEvent,
  PaymentSuccessEvent,
  PaymentFailedEvent,
} from "../@types/event.types";
import {
  RecipientType,
  NotificationType,
  ReferenceType,
} from "../@types/notification.types";
import { TemplateType } from "../@types/template.types";
import logger from "../utils/logger";

class EventConsumer {
  private channel: Channel | null = null;
  private queueName = "notification-service-queue";

  /**
   * Start consuming events
   */
  async start(): Promise<void> {
    try {
      // Connect to RabbitMQ
      await rabbitmqConnection.connect();
      this.channel = rabbitmqConnection.getChannel();
      const exchange = rabbitmqConnection.getExchange();

      // Assert queue
      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });

      // Bind queue to exchange with routing patterns
      const routingKeys = [
        "user.*",
        "appointment.*",
        "prescription.*",
        "payment.*",
      ];

      for (const routingKey of routingKeys) {
        await this.channel.bindQueue(this.queueName, exchange, routingKey);
        logger.info(`Queue bound to: ${routingKey}`);
      }

      // Set prefetch to 10 (process 10 messages at a time)
      await this.channel.prefetch(10);

      // Start consuming
      await this.channel.consume(
        this.queueName,
        async (msg) => {
          if (!msg) return;

          try {
            const event: HealthBridgeEvent = JSON.parse(msg.content.toString());
            logger.info(`Received event: ${event.eventType}`);

            // Process event
            await this.handleEvent(event);

            // Acknowledge message
            this.channel?.ack(msg);
          } catch (error) {
            logger.error("Error processing event:", error);

            // Reject message and requeue (will retry)
            this.channel?.nack(msg, false, true);
          }
        },
        { noAck: false },
      );

      logger.info("Event consumer started");
    } catch (error) {
      logger.error("Failed to start event consumer:", error);
      throw error;
    }
  }

  /**
   * Handle incoming event
   */
  private async handleEvent(event: HealthBridgeEvent): Promise<void> {
    switch (event.eventType) {
      case EventType.USER_REGISTERED:
        await this.handleUserRegistered(event as UserRegisteredEvent);
        break;

      case EventType.PASSWORD_RESET_REQUESTED:
        await this.handlePasswordResetRequested(
          event as PasswordResetRequestedEvent,
        );
        break;

      case EventType.APPOINTMENT_CREATED:
        await this.handleAppointmentCreated(event as AppointmentCreatedEvent);
        break;

      case EventType.APPOINTMENT_CONFIRMED:
        await this.handleAppointmentConfirmed(
          event as AppointmentConfirmedEvent,
        );
        break;

      case EventType.APPOINTMENT_CANCELLED:
        await this.handleAppointmentCancelled(
          event as AppointmentCancelledEvent,
        );
        break;

      case EventType.PRESCRIPTION_CREATED:
        await this.handlePrescriptionCreated(event as PrescriptionCreatedEvent);
        break;

      case EventType.PRESCRIPTION_PHARMACY_MATCHED:
        await this.handlePrescriptionPharmacyMatched(
          event as PrescriptionPharmacyMatchedEvent,
        );
        break;

      case EventType.PAYMENT_SUCCESS:
        await this.handlePaymentSuccess(event as PaymentSuccessEvent);
        break;

      case EventType.PAYMENT_FAILED:
        await this.handlePaymentFailed(event as PaymentFailedEvent);
        break;

      default:
        logger.warn(
          `Unknown event type: ${(event as HealthBridgeEvent).eventType}`,
        );
    }
  }

  /**
   * Handle user registered event
   */
  private async handleUserRegistered(
    event: UserRegisteredEvent,
  ): Promise<void> {
    const { userId, email, name, role, verificationToken } = event.payload;

    await notificationService.createNotification({
      recipientId: userId,
      recipientType: this.mapRoleToRecipientType(role),
      recipientEmail: email,
      type: NotificationType.EMAIL_VERIFICATION,
      referenceType: ReferenceType.USER,
      referenceId: userId,
      templateType: TemplateType.EMAIL_VERIFICATION,
      templateData: {
        name,
        verificationUrl: `${process.env.CLIENT_URL}/verify/${verificationToken}`,
      },
      sendEmail: true,
      sendSms: false,
    });

    logger.info(`Email verification sent to: ${email}`);
  }

  /**
   * Handle password reset requested event
   */
  private async handlePasswordResetRequested(
    event: PasswordResetRequestedEvent,
  ): Promise<void> {
    const { userId, email, name, resetToken } = event.payload;

    await notificationService.createNotification({
      recipientId: userId,
      recipientType: RecipientType.PATIENT, // Assuming patient, adjust if needed
      recipientEmail: email,
      type: NotificationType.PASSWORD_RESET,
      referenceType: ReferenceType.USER,
      referenceId: userId,
      templateType: TemplateType.PASSWORD_RESET,
      templateData: {
        name,
        resetUrl: `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
      },
      sendEmail: true,
      sendSms: false,
    });

    logger.info(`Password reset email sent to: ${email}`);
  }

  /**
   * Handle appointment created event
   */
  private async handleAppointmentCreated(
    event: AppointmentCreatedEvent,
  ): Promise<void> {
    const {
      appointmentId,
      doctorId,
      doctorName,
      doctorEmail,
      patientName,
      appointmentDate,
      appointmentTime,
      reason,
    } = event.payload;

    // Notify doctor about new appointment request
    await notificationService.createNotification({
      recipientId: doctorId,
      recipientType: RecipientType.DOCTOR,
      recipientEmail: doctorEmail,
      type: NotificationType.APPOINTMENT_REQUEST,
      referenceType: ReferenceType.APPOINTMENT,
      referenceId: appointmentId,
      templateType: TemplateType.APPOINTMENT_REQUEST,
      templateData: {
        doctorName,
        patientName,
        appointmentDate,
        appointmentTime,
        reason,
        confirmUrl: `${process.env.CLIENT_URL}/appointments/${appointmentId}/confirm`,
        declineUrl: `${process.env.CLIENT_URL}/appointments/${appointmentId}/decline`,
      },
      sendEmail: true,
      sendSms: false,
    });

    logger.info(
      `Appointment request notification sent to doctor: ${doctorEmail}`,
    );
  }

  /**
   * Handle appointment confirmed event
   */
  private async handleAppointmentConfirmed(
    event: AppointmentConfirmedEvent,
  ): Promise<void> {
    const {
      appointmentId,
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      doctorSpecialty,
      appointmentDate,
      appointmentTime,
      clinicAddress,
    } = event.payload;

    // Notify patient about confirmed appointment
    await notificationService.createNotification({
      recipientId: patientId,
      recipientType: RecipientType.PATIENT,
      recipientEmail: patientEmail,
      recipientPhone: patientPhone,
      type: NotificationType.APPOINTMENT_CONFIRMED,
      referenceType: ReferenceType.APPOINTMENT,
      referenceId: appointmentId,
      templateType: TemplateType.APPOINTMENT_CONFIRMED,
      templateData: {
        patientName,
        doctorName,
        doctorSpecialty,
        appointmentDate,
        appointmentTime,
        clinicAddress,
        appointmentUrl: `${process.env.CLIENT_URL}/appointments/${appointmentId}`,
      },
      sendEmail: true,
      sendSms: true,
    });

    logger.info(`Appointment confirmation sent to patient: ${patientEmail}`);
  }

  /**
   * Handle appointment cancelled event
   */
  private async handleAppointmentCancelled(
    event: AppointmentCancelledEvent,
  ): Promise<void> {
    const {
      appointmentId,
      patientId,
      patientEmail,
      patientPhone,
      doctorId,
      doctorEmail,
      appointmentDate,
      appointmentTime,
      cancellationReason,
      cancelledBy,
    } = event.payload;

    if (cancelledBy === "doctor") {
      // Notify patient
      await notificationService.createNotification({
        recipientId: patientId,
        recipientType: RecipientType.PATIENT,
        recipientEmail: patientEmail,
        recipientPhone: patientPhone,
        type: NotificationType.APPOINTMENT_CANCELLED,
        referenceType: ReferenceType.APPOINTMENT,
        referenceId: appointmentId,
        templateType: TemplateType.APPOINTMENT_CANCELLED,
        templateData: {
          appointmentDate,
          appointmentTime,
          cancellationReason,
          cancelledBy: "doctor",
        },
        sendEmail: true,
        sendSms: true,
      });
    } else {
      // Notify doctor
      await notificationService.createNotification({
        recipientId: doctorId,
        recipientType: RecipientType.DOCTOR,
        recipientEmail: doctorEmail,
        type: NotificationType.APPOINTMENT_CANCELLED,
        referenceType: ReferenceType.APPOINTMENT,
        referenceId: appointmentId,
        templateType: TemplateType.APPOINTMENT_CANCELLED,
        templateData: {
          appointmentDate,
          appointmentTime,
          cancellationReason,
          cancelledBy: "patient",
        },
        sendEmail: true,
        sendSms: false,
      });
    }

    logger.info(`Appointment cancellation notification sent`);
  }

  /**
   * Handle prescription created event
   */
  private async handlePrescriptionCreated(
    event: PrescriptionCreatedEvent,
  ): Promise<void> {
    const {
      prescriptionId,
      patientId,
      patientEmail,
      patientPhone,
      doctorName,
      diagnosis,
      medications,
      prescriptionUrl,
    } = event.payload;

    await notificationService.createNotification({
      recipientId: patientId,
      recipientType: RecipientType.PATIENT,
      recipientEmail: patientEmail,
      recipientPhone: patientPhone,
      type: NotificationType.PRESCRIPTION_READY,
      referenceType: ReferenceType.PRESCRIPTION,
      referenceId: prescriptionId,
      templateType: TemplateType.PRESCRIPTION_READY,
      templateData: {
        patientName: "", // Add if available
        doctorName,
        diagnosis,
        medications: medications
          .map(
            (m) => `${m.name} ${m.dosage} - ${m.frequency} for ${m.duration}`,
          )
          .join(", "),
        prescriptionUrl,
      },
      sendEmail: true,
      sendSms: true,
    });

    logger.info(`Prescription notification sent to patient: ${patientEmail}`);
  }

  /**
   * Handle prescription pharmacy matched event
   */
  private async handlePrescriptionPharmacyMatched(
    event: PrescriptionPharmacyMatchedEvent,
  ): Promise<void> {
    const {
      prescriptionId,
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      pharmacies,
    } = event.payload;

    await notificationService.createNotification({
      recipientId: patientId,
      recipientType: RecipientType.PATIENT,
      recipientEmail: patientEmail,
      recipientPhone: patientPhone,
      type: NotificationType.PHARMACY_MATCHED,
      referenceType: ReferenceType.PRESCRIPTION,
      referenceId: prescriptionId,
      templateType: TemplateType.PHARMACY_MATCHED,
      templateData: {
        patientName,
        pharmacies,
        pharmacyCount: pharmacies.length,
        closestPharmacy: pharmacies[0]?.name,
        distance: pharmacies[0]?.distance,
      },
      sendEmail: true,
      sendSms: true,
    });

    logger.info(
      `Pharmacy matched notification sent to patient: ${patientEmail}`,
    );
  }

  /**
   * Handle payment success event
   */
  private async handlePaymentSuccess(
    event: PaymentSuccessEvent,
  ): Promise<void> {
    const {
      transactionId,
      patientId,
      patientEmail,
      patientPhone,
      amount,
      currency,
      transactionReference,
      paymentDate,
    } = event.payload;

    await notificationService.createNotification({
      recipientId: patientId,
      recipientType: RecipientType.PATIENT,
      recipientEmail: patientEmail,
      recipientPhone: patientPhone,
      type: NotificationType.PAYMENT_SUCCESS,
      referenceType: ReferenceType.TRANSACTION,
      referenceId: transactionId,
      templateType: TemplateType.PAYMENT_SUCCESS,
      templateData: {
        patientName: "", // Add if available
        amount,
        currency,
        reference: transactionReference,
        paymentDate,
      },
      sendEmail: true,
      sendSms: true,
    });

    logger.info(
      `Payment success notification sent to patient: ${patientEmail}`,
    );
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(event: PaymentFailedEvent): Promise<void> {
    const { transactionId, patientId, patientEmail, amount, reason } =
      event.payload;

    await notificationService.createNotification({
      recipientId: patientId,
      recipientType: RecipientType.PATIENT,
      recipientEmail: patientEmail,
      type: NotificationType.PAYMENT_FAILED,
      referenceType: ReferenceType.TRANSACTION,
      referenceId: transactionId,
      templateType: TemplateType.PAYMENT_FAILED,
      templateData: {
        patientName: "", // Add if available
        amount,
        reason,
      },
      sendEmail: true,
      sendSms: false,
    });

    logger.info(`Payment failed notification sent to patient: ${patientEmail}`);
  }

  /**
   * Map role to recipient type
   */
  private mapRoleToRecipientType(role: string): RecipientType {
    switch (role.toLowerCase()) {
      case "patient":
        return RecipientType.PATIENT;
      case "doctor":
        return RecipientType.DOCTOR;
      case "pharmacy":
        return RecipientType.PHARMACY;
      case "lab":
        return RecipientType.LAB;
      case "wellness_center":
        return RecipientType.WELLNESS_CENTER;
      default:
        return RecipientType.PATIENT;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down event consumer...");
    await rabbitmqConnection.close();
    logger.info("Event consumer shut down");
  }
}

export default new EventConsumer();
