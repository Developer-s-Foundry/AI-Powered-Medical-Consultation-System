import { Request, Response } from "express";
import drugService from "../services/DrugService";
import { ResponseFormatter } from "../utils/response";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { getUserId } from "../utils/auth";
import logger from "../utils/logger";

export class DrugController {
  /**
   * Create drug (Pharmacy only)
   * POST /api/drugs/create
   */
  createDrug = asyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = getUserId(req);

    // Verify user is a pharmacy
    if (req.user?.role !== "pharmacy") {
      throw new AppError("Only pharmacies can create drugs", 403);
    }

    const drugData = {
      pharmacyId,
      ...req.body,
    };

    const drug = await drugService.createDrug(drugData);

    logger.info(`Drug created: ${drug.id} by pharmacy: ${pharmacyId}`);

    res.status(201).json(
      ResponseFormatter.success(
        {
          id: drug.id,
          pharmacyId: drug.pharmacyId,
          medicineName: drug.medicineName,
          dosage: drug.dosage,
          manufacturer: drug.manufacturer,
          quantity: drug.quantity,
          price: drug.price,
          expiryDate: drug.expiryDate,
          description: drug.description,
          requiresPrescription: drug.requiresPrescription,
          createdAt: drug.createdAt,
        },
        "Drug created successfully",
      ),
    );
  });

  /**
   * Search drugs (Public)
   * GET /api/drugs/search
   */
  searchDrugs = asyncHandler(async (req: Request, res: Response) => {
    const {
      medicineName,
      manufacturer,
      minPrice,
      maxPrice,
      pharmacyId,
      requiresPrescription,
    } = req.query;

    const filters: any = {};

    if (medicineName) filters.medicineName = medicineName as string;
    if (manufacturer) filters.manufacturer = manufacturer as string;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
    if (pharmacyId) filters.pharmacyId = pharmacyId as string;
    if (requiresPrescription !== undefined) {
      filters.requiresPrescription = requiresPrescription === "true";
    }

    const drugs = await drugService.searchDrugs(filters);

    res.json(
      ResponseFormatter.success({
        count: drugs.length,
        drugs: drugs.map((drug) => ({
          id: drug.id,
          pharmacyId: drug.pharmacyId,
          medicineName: drug.medicineName,
          dosage: drug.dosage,
          manufacturer: drug.manufacturer,
          quantity: drug.quantity,
          price: drug.price,
          expiryDate: drug.expiryDate,
          description: drug.description,
          requiresPrescription: drug.requiresPrescription,
        })),
      }),
    );
  });

  /**
   * Get drug by ID
   * GET /api/drugs/:id
   */
  getDrugById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const drug = await drugService.getDrugById(id);

    if (!drug) {
      throw new AppError("Drug not found", 404);
    }

    res.json(
      ResponseFormatter.success({
        id: drug.id,
        pharmacyId: drug.pharmacyId,
        medicineName: drug.medicineName,
        dosage: drug.dosage,
        manufacturer: drug.manufacturer,
        quantity: drug.quantity,
        price: drug.price,
        expiryDate: drug.expiryDate,
        description: drug.description,
        requiresPrescription: drug.requiresPrescription,
        createdAt: drug.createdAt,
        updatedAt: drug.updatedAt,
      }),
    );
  });

  /**
   * Update drug (Pharmacy only)
   * PUT /api/drugs/:id
   */
  updateDrug = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const pharmacyId = getUserId(req);

    // Verify ownership
    const existingDrug = await drugService.getDrugById(id);
    if (!existingDrug) {
      throw new AppError("Drug not found", 404);
    }

    if (existingDrug.pharmacyId !== pharmacyId) {
      throw new AppError("You can only update your own drugs", 403);
    }

    const drug = await drugService.updateDrug(id, req.body);

    logger.info(`Drug updated: ${id}`);

    res.json(
      ResponseFormatter.success(
        {
          id: drug!.id,
          medicineName: drug!.medicineName,
          quantity: drug!.quantity,
          price: drug!.price,
          updatedAt: drug!.updatedAt,
        },
        "Drug updated successfully",
      ),
    );
  });

  /**
   * Delete drug (Pharmacy only)
   * DELETE /api/drugs/:id
   */
  deleteDrug = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const pharmacyId = getUserId(req);

    // Verify ownership
    const existingDrug = await drugService.getDrugById(id);
    if (!existingDrug) {
      throw new AppError("Drug not found", 404);
    }

    if (existingDrug.pharmacyId !== pharmacyId) {
      throw new AppError("You can only delete your own drugs", 403);
    }

    await drugService.deleteDrug(id);

    logger.info(`Drug deleted: ${id}`);

    res.json(ResponseFormatter.success(null, "Drug deleted successfully"));
  });

  /**
   * Get pharmacy drugs
   * GET /api/drugs/pharmacy/:pharmacyId
   */
  getPharmacyDrugs = asyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;

    const drugs = await drugService.getDrugsByPharmacy(pharmacyId);

    res.json(
      ResponseFormatter.success({
        pharmacyId,
        count: drugs.length,
        drugs,
      }),
    );
  });
}

export default new DrugController();
