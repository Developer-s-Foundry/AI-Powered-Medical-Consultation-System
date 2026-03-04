import { Router } from "express";
import prescriptionController from "../controllers/prescriptionController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * POST /api/pharm/prescription/create
 * Create prescription (Doctor only)
 */
router.post(
  "/pharm/prescription/create",
  authenticate,
  prescriptionController.createPrescription,
);

/**
 * GET /api/prescription/view
 * View prescriptions (Patient sees theirs, Doctor sees what they created)
 */
router.get(
  "/prescription/view",
  authenticate,
  prescriptionController.viewPrescriptions,
);

/**
 * GET /api/prescription/:id
 * Get prescription by ID
 */
router.get(
  "/prescription/:id",
  authenticate,
  prescriptionController.getPrescriptionById,
);

/**
 * PATCH /api/prescription/:id/status
 * Update prescription status (Doctor only)
 */
router.patch(
  "/prescription/:id/status",
  authenticate,
  prescriptionController.updateStatus,
);

export default router;
