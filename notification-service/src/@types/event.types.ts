export enum EventType {
  USER_REGISTERED = "user.registered",
  PASSWORD_RESET_REQUESTED = "password.reset.requested",
  APPOINTMENT_CREATED = "appointment.created",
  APPOINTMENT_CONFIRMED = "appointment.confirmed",
  APPOINTMENT_CANCELLED = "appointment.cancelled",
  APPOINTMENT_REMINDER = "appointment.reminder",
  PRESCRIPTION_CREATED = "prescription.created",
  PRESCRIPTION_PHARMACY_MATCHED = "prescription.pharmacy_matched",
  PAYMENT_SUCCESS = "payment.success",
  PAYMENT_FAILED = "payment.failed",
}

export interface BaseEvent {
  eventType: EventType;
  timestamp: string;
  metadata: {
    serviceId: string;
    version: string;
    correlationId?: string;
  };
}

// User Events
export interface UserRegisteredEvent extends BaseEvent {
  eventType: EventType.USER_REGISTERED;
  payload: {
    userId: string;
    email: string;
    name: string;
    role: string;
    verificationToken: string;
  };
}

export interface PasswordResetRequestedEvent extends BaseEvent {
  eventType: EventType.PASSWORD_RESET_REQUESTED;
  payload: {
    userId: string;
    email: string;
    name: string;
    resetToken: string;
  };
}

// Appointment Events
export interface AppointmentCreatedEvent extends BaseEvent {
  eventType: EventType.APPOINTMENT_CREATED;
  payload: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    doctorId: string;
    doctorName: string;
    doctorEmail: string;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
  };
}

export interface AppointmentConfirmedEvent extends BaseEvent {
  eventType: EventType.APPOINTMENT_CONFIRMED;
  payload: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    appointmentDate: string;
    appointmentTime: string;
    clinicAddress: string;
    reason: string;
  };
}

export interface AppointmentCancelledEvent extends BaseEvent {
  eventType: EventType.APPOINTMENT_CANCELLED;
  payload: {
    appointmentId: string;
    patientId: string;
    patientEmail: string;
    patientPhone?: string;
    doctorId: string;
    doctorEmail: string;
    appointmentDate: string;
    appointmentTime: string;
    cancellationReason: string;
    cancelledBy: "patient" | "doctor";
  };
}

// Prescription Events
export interface PrescriptionCreatedEvent extends BaseEvent {
  eventType: EventType.PRESCRIPTION_CREATED;
  payload: {
    prescriptionId: string;
    patientId: string;
    patientEmail: string;
    patientPhone?: string;
    doctorName: string;
    diagnosis: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    prescriptionUrl: string;
  };
}

export interface PrescriptionPharmacyMatchedEvent extends BaseEvent {
  eventType: EventType.PRESCRIPTION_PHARMACY_MATCHED;
  payload: {
    prescriptionId: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    pharmacies: Array<{
      id: string;
      name: string;
      address: string;
      distance: number;
      totalCost: number;
    }>;
  };
}

// Payment Events
export interface PaymentSuccessEvent extends BaseEvent {
  eventType: EventType.PAYMENT_SUCCESS;
  payload: {
    transactionId: string;
    bookingId: string;
    patientId: string;
    patientEmail: string;
    patientPhone?: string;
    amount: number;
    currency: string;
    transactionReference: string;
    paymentDate: string;
  };
}

export interface PaymentFailedEvent extends BaseEvent {
  eventType: EventType.PAYMENT_FAILED;
  payload: {
    transactionId: string;
    bookingId: string;
    patientId: string;
    patientEmail: string;
    amount: number;
    reason: string;
  };
}

// Union type of all events
export type HealthBridgeEvent =
  | UserRegisteredEvent
  | PasswordResetRequestedEvent
  | AppointmentCreatedEvent
  | AppointmentConfirmedEvent
  | AppointmentCancelledEvent
  | PrescriptionCreatedEvent
  | PrescriptionPharmacyMatchedEvent
  | PaymentSuccessEvent
  | PaymentFailedEvent;
