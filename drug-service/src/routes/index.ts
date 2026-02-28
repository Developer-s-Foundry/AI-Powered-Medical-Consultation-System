import { Router } from "express";
import drugRoutes from "./drugRoutes";
import prescriptionRoutes from "./prescriptionRoutes";

const router = Router();

// Mount routes
router.use("/", prescriptionRoutes); // Handles /api/pharm/prescription/* and /api/prescription/*
router.use("/drugs", drugRoutes); // Handles /api/drugs/*

// API info
router.get("/", (_req, res) => {
  res.json({
    service: "Drugs Service",
    version: "1.0.0",
    endpoints: {
      createPrescription: "POST /api/pharm/prescription/create",
      viewPrescriptions: "GET /api/prescription/view",
      createDrug: "POST /api/drugs/create",
      searchDrugs: "GET /api/drugs/search",
    },
  });
});

export default router;
