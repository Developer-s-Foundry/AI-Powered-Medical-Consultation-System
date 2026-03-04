export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor" | "pharmacy";
  isNewUser: boolean;
};

export type Profile = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  userId?: string;
  address?: { street: string; city: string; state?: string; country?: string };
  // doctor fields
  specialty?: string;
  hospitalName?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  // pharmacy fields
  pharmacyName?: string;
  isVerified?: boolean;
  operatingDays?: string;
};
