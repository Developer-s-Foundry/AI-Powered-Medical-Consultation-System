

export enum EventTypes {
    email_verification = 'email_verification',
    password_reset = 'password_reset',
}

export enum RecipientType {
    patient= 'patient',
    doctor = 'doctor'
}

export interface EventData {
    eventType:EventTypes
    recipientId: string;
    recipientType: RecipientType;
    referenceType: string;
    referenceId: string;
    email: string;
    verificationToken?: string;
    resetToken?: string;
}