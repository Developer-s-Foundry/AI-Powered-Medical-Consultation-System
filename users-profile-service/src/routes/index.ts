import { Router } from "express";
import patientRoutes from "./patientRoutes";
import doctorRoutes from "./doctorRoutes";
import pharmacyRoutes from "./pharmacyRoutes";
import healthRoutes from "./healthRoutes";

const router = Router();

// Health check routes
router.use("/health", healthRoutes);

// Profile routes
router.use("/patients", patientRoutes);
router.use("/doctors", doctorRoutes);
router.use("/pharmacies", pharmacyRoutes);

// API info route
router.get("/", (_req, res) => {
  res.json({
    service: "User Profile Service",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      patients: "/api/patients",
      doctors: "/api/doctors",
      pharmacies: "/api/pharmacies",
    },
  });
});

export default router;
