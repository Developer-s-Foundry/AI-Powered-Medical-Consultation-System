
export enum EventType {
    PAYMENT_SUCCESS = 'payment_success',
    PAYMENT_FAILED = 'payment_failed',
    CREATE_APPOINTMENT = 'create_appointment'
}

export enum RecipientType {
    patient= 'patient',
    doctor = 'doctor'
}

// Payment Events
export interface PaymentSuccessEvent {
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

export interface PaymentFailedEvent {
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

export interface AppointmentCreatedEvent {
  eventType: EventType.CREATE_APPOINTMENT;
  payload: {
    bookingId: string;
    patientId: string;
  };
}