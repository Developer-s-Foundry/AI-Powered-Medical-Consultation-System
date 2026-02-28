export enum PrescriptionStatus {
  ACTIVE = "active",
  FULFILLED = "fulfilled",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export interface PrescriptionAttributes {
  id?: string;
  doctorId: string;
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  instructions?: string;
  notes?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrescriptionItemAttributes {
  id?: string;
  prescriptionId: string;
  drugId: string;
  dosage: string;
  duration: string;
  quantityPrescribed: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePrescriptionInput {
  doctorId: string;
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  instructions?: string;
  notes?: string;
  items: Array<{
    drugId: string;
    dosage: string;
    duration: string;
    quantityPrescribed: number;
  }>;
}
