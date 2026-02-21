import { Request, Response } from "express";
import prescriptionService from "../services/PrescriptionService";
import { ResponseFormatter } from "../utils/response";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { getUserId } from "../utils/auth";
import logger from "../utils/logger";

export class PrescriptionController {
  /**
   * Create prescription (Doctor only)
   * POST /api/pharm/prescription/create
   */
  createPrescription = asyncHandler(async (req: Request, res: Response) => {
    const doctorId = getUserId(req);

    // Verify user is a doctor
    if (req.user?.role !== "doctor") {
      throw new AppError("Only doctors can create prescriptions", 403);
    }

    const prescriptionData = {
      doctorId,
      ...req.body,
    };

    const prescription =
      await prescriptionService.createPrescription(prescriptionData);

    // Fetch with items
    const fullPrescription = await prescriptionService.getPrescriptionById(
      prescription.id,
    );

    logger.info(
      `Prescription created: ${prescription.id} by doctor: ${doctorId}`,
    );

    res.status(201).json(
      ResponseFormatter.success(
        {
          id: fullPrescription!.id,
          doctorId: fullPrescription!.doctorId,
          patientId: fullPrescription!.patientId,
          appointmentId: fullPrescription!.appointmentId,
          diagnosis: fullPrescription!.diagnosis,
          instructions: fullPrescription!.instructions,
          notes: fullPrescription!.notes,
          status: fullPrescription!.status,
          items: fullPrescription!.items,
          createdAt: fullPrescription!.createdAt,
        },
        "Prescription created successfully",
      ),
    );
  });

  /**
   * View prescriptions
   * GET /api/prescription/view
   */
  viewPrescriptions = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const role = req.user?.role;

    let prescriptions;

    if (role === "patient") {
      // Patients see their own prescriptions
      prescriptions =
        await prescriptionService.getPrescriptionsByPatient(userId);
    } else if (role === "doctor") {
      // Doctors see prescriptions they created
      prescriptions =
        await prescriptionService.getPrescriptionsByDoctor(userId);
    } else {
      throw new AppError("Invalid role for viewing prescriptions", 403);
    }

    res.json(
      ResponseFormatter.success({
        count: prescriptions.length,
        prescriptions,
      }),
    );
  });

  /**
   * Get prescription by ID
   * GET /api/prescription/:id
   */
  getPrescriptionById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const userId = getUserId(req);
    const role = req.user?.role;

    const prescription = await prescriptionService.getPrescriptionById(id);

    if (!prescription) {
      throw new AppError("Prescription not found", 404);
    }

    // Authorization check
    if (role === "patient" && prescription.patientId !== userId) {
      throw new AppError("You can only view your own prescriptions", 403);
    }

    if (role === "doctor" && prescription.doctorId !== userId) {
      throw new AppError("You can only view prescriptions you created", 403);
    }

    res.json(ResponseFormatter.success(prescription));
  });

  /**
   * Update prescription status
   * PATCH /api/prescription/:id/status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { status } = req.body;
    const doctorId = getUserId(req);

    // Verify ownership
    const existingPrescription =
      await prescriptionService.getPrescriptionById(id);
    if (!existingPrescription) {
      throw new AppError("Prescription not found", 404);
    }

    if (existingPrescription.doctorId !== doctorId) {
      throw new AppError("You can only update your own prescriptions", 403);
    }

    const prescription = await prescriptionService.updateStatus(id, status);

    logger.info(`Prescription status updated: ${id} -> ${status}`);

    res.json(
      ResponseFormatter.success(
        {
          id: prescription!.id,
          status: prescription!.status,
          updatedAt: prescription!.updatedAt,
        },
        "Prescription status updated successfully",
      ),
    );
  });
}

export default new PrescriptionController();
