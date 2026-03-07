// ─── Shared ───────────────────────────────────────────────────────────────────

export type Role = "patient" | "doctor" | "pharmacy";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isNewUser: boolean;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  coordinates?: { lat: number; lng: number };
};

// ─── Patient ──────────────────────────────────────────────────────────────────

export type PatientProfile = {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: Address;
  isVerified?: boolean;
  role?: Role;
  [key: string]: unknown;
};

// ─── Doctor ───────────────────────────────────────────────────────────────────

export type DoctorProfile = {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  specialty?: string;
  licenseNumber?: string;
  yearsOfExperience?: string;
  hospitalName?: string;
  consultationFee?: number;
  address?: Address;
  isVerified?: boolean;
  role?: Role;
  [key: string]: unknown;
};

// ─── Pharmacy ─────────────────────────────────────────────────────────────────

export type DaySlot = {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
};

export type OperationDays = Record<string, DaySlot>;

export type PharmacyProfile = {
  id?: string;
  pharmacyName?: string;
  phone?: string;
  lincenseNumber?: string;
  operationDays?: OperationDays;
  address?: Address;
  isVerified?: boolean;
  role?: Role;
  [key: string]: unknown;
};

export type NearbyPharmacy = {
  id: string;
  lat: number;
  lng: number;
  pharmacyName?: string;
  address?: string;
  phone?: string;
  operationDays?: string;
  drugs?: string[];
  rating?: number;
  deliveryAvailable?: boolean;
  isVerified?: boolean;
  distance?: number;
};

// ─── Union ────────────────────────────────────────────────────────────────────

export type Profile = PatientProfile | DoctorProfile | PharmacyProfile;
