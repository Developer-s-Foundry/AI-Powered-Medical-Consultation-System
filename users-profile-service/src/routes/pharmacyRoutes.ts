import { Router } from "express";
import pharmacyController from "../controllers/pharmacyController";
import { authenticate } from "../middleware/auth";
import { validateRequest, schemas } from "../middleware/validator";

const router = Router();

/**
 * Public Routes (no authentication required)
 */

// Get pharmacy profile by ID (public)
router.get("/profile/:userId", pharmacyController.getProfileById);

// Search pharmacies (public)
router.get("/search", pharmacyController.searchPharmacies);

// Get pharmacies by location (public)
router.get("/nearby", pharmacyController.getPharmaciesByLocation);

// Get pharmacies open on specific day (public)
router.get("/open/:day", pharmacyController.getPharmaciesOpenOnDay);

/**
 * Protected Routes (authentication required)
 */

// All routes below require authentication
router.use(authenticate);

// Create pharmacy profile
router.post(
  "/profile",
  validateRequest(schemas.createPharmacyProfile),
  pharmacyController.createProfile,
);

// Get own profile
router.get("/profile", pharmacyController.getProfile);

// Update profile
router.put(
  "/profile",
  validateRequest(schemas.updatePharmacyProfile),
  pharmacyController.updateProfile,
);

// Delete profile
router.delete("/profile", pharmacyController.deleteProfile);

/**
 * Operation Days Routes
 */

// Update operation days
router.put(
  "/operation-days",
  validateRequest(schemas.updateOperationDays),
  pharmacyController.updateOperationDays,
);

// Update specific day operation
router.put(
  "/operation-days/:day",
  validateRequest(schemas.updateDayOperation),
  pharmacyController.updateDayOperation,
);

/**
 * Address Route
 */

// Update address
router.put(
  "/address",
  validateRequest(schemas.updateAddress),
  pharmacyController.updateAddress,
);

export default router;
