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

export interface OperationDays {
  availableDays: AvailableDays;
}

export interface PharmacyProfileAttributes {
  userId: string;
  pharmacyName: string;
  phone: string;
  lincenseNumber: string; // Keep the typo as per your schema
  address?: Address;
  operationDays?: OperationDays;
  createdAt?: Date;
  updatedAt?: Date;
}
