import { Address } from "./profile.types";

export interface ExistingCondition {
  condition: string;
  diagnosedYear: Date;
  isOngoing: boolean;
}

export interface MedicalHistory {
  bloodGroup: string;
  genotype: string;
  height: number;
  weight: number;
  existingConditions: ExistingCondition[];
}

export interface CurrentMedication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface PatientProfileAttributes {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
  address?: Address;
  medicalHistory?: MedicalHistory;
  currentMedications?: CurrentMedication[];
  createdAt?: Date;
  updatedAt?: Date;
}
