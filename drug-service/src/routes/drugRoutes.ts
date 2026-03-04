import { Router } from "express";
import drugController from "../controllers/drugController";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * POST /api/drugs/create
 * Create drug (Pharmacy only)
 */
router.post("/create", authenticate, drugController.createDrug);

/**
 * GET /api/drugs/search
 * Search drugs (Public)
 */
router.get("/search", drugController.searchDrugs);

/**
 * GET /api/drugs/:id
 * Get drug by ID (Public)
 */
router.get("/:id", drugController.getDrugById);

/**
 * PUT /api/drugs/:id
 * Update drug (Pharmacy only)
 */
router.put("/:id", authenticate, drugController.updateDrug);

/**
 * DELETE /api/drugs/:id
 * Delete drug (Pharmacy only)
 */
router.delete("/:id", authenticate, drugController.deleteDrug);

/**
 * GET /api/drugs/pharmacy/:pharmacyId
 * Get pharmacy drugs (Public)
 */
router.get("/pharmacy/:pharmacyId", drugController.getPharmacyDrugs);

export default router;
