import { Router } from "express";
import doctorController from "../controllers/doctorController";
import { authenticate } from "../middleware/auth";
import { validateRequest, schemas } from "../middleware/validator";

const router = Router();

/**
 * Public Routes (no authentication required)
 */

// Get doctor profile by ID (public)
router.get("/profile/:userId", doctorController.getProfileById);

// Search doctors (public)
router.get("/search", doctorController.searchDoctors);

// Get doctors by specialty (public)
router.get("/specialty/:specialty", doctorController.getDoctorsBySpecialty);

// Get doctors available on specific day (public)
router.get("/available/:day", doctorController.getDoctorsAvailableOnDay);

/**
 * Protected Routes (authentication required)
 */

// All routes below require authentication
router.use(authenticate);

// Create doctor profile
router.post(
  "/profile",
  validateRequest(schemas.createDoctorProfile),
  doctorController.createProfile,
);

// Get own profile
router.get("/profile", doctorController.getProfile);

// Update profile
router.put(
  "/profile",
  validateRequest(schemas.updateDoctorProfile),
  doctorController.updateProfile,
);

// Delete profile
router.delete("/profile", doctorController.deleteProfile);

/**
 * Schedule Routes
 */

// Update consultation schedule
router.put(
  "/schedule",
  validateRequest(schemas.updateSchedule),
  doctorController.updateSchedule,
);

// Update available days
router.put(
  "/schedule/days",
  validateRequest(schemas.updateAvailableDays),
  doctorController.updateAvailableDays,
);

// Update specific day availability
router.put(
  "/schedule/days/:day",
  validateRequest(schemas.updateDayAvailability),
  doctorController.updateDayAvailability,
);

/**
 * Payment Routes
 */

// Update payment details
router.put(
  "/payment",
  validateRequest(schemas.updatePaymentDetails),
  doctorController.updatePaymentDetails,
);

// Update Stripe account
router.put(
  "/payment/stripe",
  validateRequest(schemas.updateStripeAccount),
  doctorController.updateStripeAccount,
);

// Update consultation fees
router.put(
  "/payment/fees",
  validateRequest(schemas.updateConsultationFees),
  doctorController.updateConsultationFees,
);

/**
 * Address Route
 */

// Update address
router.put(
  "/address",
  validateRequest(schemas.updateAddress),
  doctorController.updateAddress,
);

export default router;
