import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errorHandler";

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      throw new AppError(errorMessage, 400);
    }

    req.body = value;
    next();
  };
};

// Common schemas
const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  coordinates: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }).required(),
});

const daySlotSchema = Joi.object({
  isAvailable: Joi.boolean().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
});

const availableDaysSchema = Joi.object({
  monday: daySlotSchema,
  tuesday: daySlotSchema,
  wednesday: daySlotSchema,
  thursday: daySlotSchema,
  friday: daySlotSchema,
  saturday: daySlotSchema,
  sunday: daySlotSchema,
});

// Patient schemas
export const schemas = {
  // Patient
  createPatientProfile: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string(),
    dateOfBirth: Joi.date(),
    gender: Joi.string().valid("male", "female", "other"),
    address: addressSchema,
    medicalHistory: Joi.object(),
    currentMedications: Joi.array(),
  }),

  updatePatientProfile: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.string(),
    dateOfBirth: Joi.date(),
    gender: Joi.string().valid("male", "female", "other"),
  }),

  updateMedicalHistory: Joi.object({
    bloodGroup: Joi.string(),
    genotype: Joi.string(),
    height: Joi.number(),
    weight: Joi.number(),
    existingConditions: Joi.array().items(
      Joi.object({
        condition: Joi.string().required(),
        diagnosedYear: Joi.date().required(),
        isOngoing: Joi.boolean().required(),
      }),
    ),
  }),

  addCondition: Joi.object({
    condition: Joi.string().required(),
    diagnosedYear: Joi.date().required(),
    isOngoing: Joi.boolean().default(true),
  }),

  updateMedications: Joi.object({
    medications: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          dosage: Joi.string().required(),
          frequency: Joi.string().required(),
        }),
      )
      .required(),
  }),

  addMedication: Joi.object({
    name: Joi.string().required(),
    dosage: Joi.string().required(),
    frequency: Joi.string().required(),
  }),

  // Doctor
  createDoctorProfile: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string(),
    gender: Joi.string().valid("male", "female", "other"),
    specialty: Joi.string().required(),
    hospitalName: Joi.string(),
    address: addressSchema,
    consultationSchedule: Joi.object(),
    paymentDetails: Joi.object(),
  }),

  updateDoctorProfile: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.string(),
    gender: Joi.string().valid("male", "female", "other"),
    specialty: Joi.string(),
    hospitalName: Joi.string(),
  }),

  updateSchedule: Joi.object({
    availableDays: availableDaysSchema,
    slotDurationMinutes: Joi.number(),
    maxPatientsPerDay: Joi.number(),
    consultationTypes: Joi.object({
      inPerson: Joi.boolean(),
    }),
  }),

  updateAvailableDays: Joi.object({
    availableDays: availableDaysSchema.required(),
  }),

  updateDayAvailability: Joi.object({
    isAvailable: Joi.boolean().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
  }),

  updatePaymentDetails: Joi.object({
    consultationFees: Joi.object(),
    stripe: Joi.object(),
  }),

  updateStripeAccount: Joi.object({
    accountId: Joi.string(),
    accountStatus: Joi.string(),
    payoutsEnabled: Joi.boolean(),
    chargesEnabled: Joi.boolean(),
    onboardingLink: Joi.string().allow(null),
    currency: Joi.string(),
  }),

  updateConsultationFees: Joi.object({
    consultationFees: Joi.object().required(),
  }),

  // Pharmacy
  createPharmacyProfile: Joi.object({
    pharmacyName: Joi.string().required(),
    phone: Joi.string(),
    lincenseNumber: Joi.string(),
    address: addressSchema,
    operationDays: Joi.object(),
  }),

  updatePharmacyProfile: Joi.object({
    pharmacyName: Joi.string(),
    phone: Joi.string(),
    lincenseNumber: Joi.string(),
  }),

  updateOperationDays: Joi.object({
    operationDays: Joi.object({
      availableDays: availableDaysSchema,
    }).required(),
  }),

  updateDayOperation: Joi.object({
    isAvailable: Joi.boolean().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
  }),

  // Common
  updateAddress: addressSchema,
};
