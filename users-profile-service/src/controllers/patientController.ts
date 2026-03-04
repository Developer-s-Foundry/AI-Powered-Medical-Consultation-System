import { Request, Response } from "express";
import patientService from "../services/PatientService";
import { ResponseFormatter } from "../utils/response";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { getUserId } from "../utils/auth";
import logger from "../utils/logger";

export class PatientController {
  /**
   * Create patient profile
   * POST /api/patients/profile
   */
  createProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    // Check if profile already exists
    const exists = await patientService.profileExists(userId);
    if (exists) {
      throw new AppError("Patient profile already exists", 400);
    }

    const profileData = {
      userId,
      ...req.body,
    };

    const profile = await patientService.createProfile(profileData);

    logger.info(`Patient profile created via API: userId=${userId}`);

    res.status(201).json(
      ResponseFormatter.success(
        {
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          address: profile.address,
          medicalHistory: profile.medicalHistory,
          currentMedications: profile.currentMedications,
          createdAt: profile.createdAt,
        },
        "Patient profile created successfully",
      ),
    );
  });

  /**
   * Get patient profile
   * GET /api/patients/profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const profile = await patientService.getProfile(userId);

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    res.json(
      ResponseFormatter.success({
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        address: profile.address,
        medicalHistory: profile.medicalHistory,
        currentMedications: profile.currentMedications,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }),
    );
  });

  /**
   * Get patient profile by ID (admin/doctor access)
   * GET /api/patients/profile/:userId
   */
  getProfileById = asyncHandler(async (req: Request, res: Response) => {
    const userIdRaw = req.params.userId;

    if (!userIdRaw) {
      throw new AppError("User ID is required", 400);
    }

    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;

    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    const profile = await patientService.getProfile(userId);

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    res.json(
      ResponseFormatter.success({
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        address: profile.address,
        medicalHistory: profile.medicalHistory,
        currentMedications: profile.currentMedications,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }),
    );
  });

  /**
   * Update patient profile
   * PUT /api/patients/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const updates = req.body;

    const profile = await patientService.updateProfile(userId, updates);

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    logger.info(`Patient profile updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        {
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          address: profile.address,
          updatedAt: profile.updatedAt,
        },
        "Patient profile updated successfully",
      ),
    );
  });

  /**
   * Update medical history
   * PUT /api/patients/medical-history
   */
  updateMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const medicalHistory = req.body;

    const profile = await patientService.updateMedicalHistory(
      userId,
      medicalHistory,
    );

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    logger.info(`Medical history updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { medicalHistory: profile.medicalHistory },
        "Medical history updated successfully",
      ),
    );
  });

  /**
   * Add existing condition
   * POST /api/patients/medical-history/conditions
   */
  addCondition = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const { condition, diagnosedYear, isOngoing } = req.body;

    if (!condition || !diagnosedYear) {
      throw new AppError("Condition and diagnosedYear are required", 400);
    }

    const profile = await patientService.addExistingCondition(userId, {
      condition,
      diagnosedYear: new Date(diagnosedYear),
      isOngoing: isOngoing !== false,
    });

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    logger.info(`Condition added via API: userId=${userId}`);

    res
      .status(201)
      .json(
        ResponseFormatter.success(
          { medicalHistory: profile.medicalHistory },
          "Condition added successfully",
        ),
      );
  });

  /**
   * Update current medications
   * PUT /api/patients/medications
   */
  updateMedications = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const { medications } = req.body;

    if (!Array.isArray(medications)) {
      throw new AppError("Medications must be an array", 400);
    }

    const profile = await patientService.updateCurrentMedications(
      userId,
      medications,
    );

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    logger.info(`Medications updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { currentMedications: profile.currentMedications },
        "Medications updated successfully",
      ),
    );
  });

  /**
   * Add medication
   * POST /api/patients/medications
   */
  addMedication = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const { name, dosage, frequency } = req.body;

    if (!name || !dosage || !frequency) {
      throw new AppError("Name, dosage, and frequency are required", 400);
    }

    const profile = await patientService.addMedication(userId, {
      name,
      dosage,
      frequency,
    });

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    logger.info(`Medication added via API: userId=${userId}`);

    res
      .status(201)
      .json(
        ResponseFormatter.success(
          { currentMedications: profile.currentMedications },
          "Medication added successfully",
        ),
      );
  });

  /**
   * Remove medication
   * DELETE /api/patients/medications/:medicationName
   */
  removeMedication = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const medicationNameRaw = req.params.medicationName;

    if (!medicationNameRaw) {
      throw new AppError("Medication name is required", 400);
    }

    const medicationName = Array.isArray(medicationNameRaw)
      ? medicationNameRaw[0]
      : medicationNameRaw;

    const profile = await patientService.removeMedication(
      userId,
      medicationName,
    );

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    logger.info(
      `Medication removed via API: userId=${userId}, medication=${medicationName}`,
    );

    res.json(
      ResponseFormatter.success(
        { currentMedications: profile.currentMedications },
        "Medication removed successfully",
      ),
    );
  });

  /**
   * Update address
   * PUT /api/patients/address
   */
  updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const address = req.body;

    const profile = await patientService.updateAddress(userId, address);

    if (!profile) {
      throw new AppError("Patient profile not found", 404);
    }

    logger.info(`Address updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { address: profile.address },
        "Address updated successfully",
      ),
    );
  });

  /**
   * Delete patient profile
   * DELETE /api/patients/profile
   */
  deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const deleted = await patientService.deleteProfile(userId);

    if (!deleted) {
      throw new AppError("Patient profile not found", 404);
    }

    logger.info(`Patient profile deleted via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(null, "Patient profile deleted successfully"),
    );
  });

  /**
   * Search patients (admin only)
   * GET /api/patients/search?q=searchTerm
   */
  searchPatients = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q) {
      throw new AppError("Search query is required", 400);
    }

    const patients = await patientService.searchPatients(q as string);

    res.json(
      ResponseFormatter.success(
        patients.map((p) => ({
          userId: p.userId,
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone,
          gender: p.gender,
        })),
      ),
    );
  });
}

export default new PatientController();
