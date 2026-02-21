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

// Validation schemas
export const schemas = {
  // Drug schemas
  createDrug: Joi.object({
    medicineName: Joi.string().required().max(255),
    dosage: Joi.string().required().max(100),
    manufacturer: Joi.string().required().max(255),
    quantity: Joi.number().integer().min(0).required(),
    price: Joi.number().positive().required(),
    expiryDate: Joi.date().iso().required(),
    description: Joi.string().optional(),
    requiresPrescription: Joi.boolean().default(true),
  }),

  updateDrug: Joi.object({
    medicineName: Joi.string().max(255),
    dosage: Joi.string().max(100),
    manufacturer: Joi.string().max(255),
    quantity: Joi.number().integer().min(0),
    price: Joi.number().positive(),
    expiryDate: Joi.date().iso(),
    description: Joi.string(),
    requiresPrescription: Joi.boolean(),
  }),

  // Prescription schemas
  createPrescription: Joi.object({
    appointmentId: Joi.string().uuid().required(),
    patientId: Joi.string().uuid().required(),
    diagnosis: Joi.string().required(),
    instructions: Joi.string().optional(),
    notes: Joi.string().optional(),
    items: Joi.array()
      .items(
        Joi.object({
          drugId: Joi.string().uuid().required(),
          dosage: Joi.string().required().max(100),
          duration: Joi.string().required().max(100),
          quantityPrescribed: Joi.number().integer().min(1).required(),
        }),
      )
      .min(1)
      .required(),
  }),

  updatePrescriptionStatus: Joi.object({
    status: Joi.string()
      .valid("active", "fulfilled", "expired", "cancelled")
      .required(),
  }),
};
