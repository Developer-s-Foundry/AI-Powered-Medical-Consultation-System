import { Address } from "./profile.types";

export interface DaySlot {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface AvailableDays {
  monday: DaySlot;
  tuesday: DaySlot;
  wednesday: DaySlot;
  thursday: DaySlot;
  friday: DaySlot;
  saturday: DaySlot;
  sunday: DaySlot;
}

export interface ConsultationTypes {
  inPerson: boolean;
}

export interface ConsultationSchedule {
  availableDays: AvailableDays;
  slotDurationMinutes: number;
  maxPatientsPerDay: number;
  consultationTypes: ConsultationTypes;
}

export interface ConsultationFees {
  inPerson: boolean; // Could be a number instead?
}

export interface StripeDetails {
  accountId: string;
  accountStatus: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  onboardingLink: string | null;
  currency: string;
}

export interface PaymentDetails {
  consultationFees: ConsultationFees;
  stripe: StripeDetails;
}

export interface BankDetails {
  businessName: string;
  bankCode: string;
  accountNumber: string;
  accountName?: string;
  isVerified?: boolean;
  verifiedAt?: Date;
}

export interface DoctorProfileAttributes {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  specialty: string;
  hospitalName: string;
  address?: Address;
  consultationSchedule?: ConsultationSchedule;
  paymentDetails?: PaymentDetails;
  bankDetails?: BankDetails;
  createdAt?: Date;
  updatedAt?: Date;
}
