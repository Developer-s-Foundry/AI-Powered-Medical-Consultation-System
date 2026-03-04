import { Router } from "express";
import patientController from "../controllers/patientController";
import { authenticate } from "../middleware/auth";
import { validateRequest, schemas } from "../middleware/validator";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Patient Profile Routes
 */

// Create patient profile
router.post(
  "/profile",
  validateRequest(schemas.createPatientProfile),
  patientController.createProfile,
);

// Get own profile
router.get("/profile", patientController.getProfile);

// Get patient profile by ID (admin/doctor only)
router.get("/profile/:userId", patientController.getProfileById);

// Update profile
router.put(
  "/profile",
  validateRequest(schemas.updatePatientProfile),
  patientController.updateProfile,
);

// Delete profile
router.delete("/profile", patientController.deleteProfile);

/**
 * Medical History Routes
 */

// Update medical history
router.put(
  "/medical-history",
  validateRequest(schemas.updateMedicalHistory),
  patientController.updateMedicalHistory,
);

// Add existing condition
router.post(
  "/medical-history/conditions",
  validateRequest(schemas.addCondition),
  patientController.addCondition,
);

/**
 * Medication Routes
 */

// Update current medications
router.put(
  "/medications",
  validateRequest(schemas.updateMedications),
  patientController.updateMedications,
);

// Add medication
router.post(
  "/medications",
  validateRequest(schemas.addMedication),
  patientController.addMedication,
);

// Remove medication
router.delete(
  "/medications/:medicationName",
  patientController.removeMedication,
);

/**
 * Address Route
 */

// Update address
router.put(
  "/address",
  validateRequest(schemas.updateAddress),
  patientController.updateAddress,
);

/**
 * Search Route (admin only)
 */

// Search patients
router.get("/search", patientController.searchPatients);

export default router;
