import { Request, Response } from "express";
import pharmacyService from "../services/PharmacyService";
import { ResponseFormatter } from "../utils/response";
import { asyncHandler, AppError } from "../utils/errorHandler";
import { getUserId } from "../utils/auth";
import logger from "../utils/logger";

export class PharmacyController {
  /**
   * Create pharmacy profile
   * POST /api/pharmacies/profile
   */
  createProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const exists = await pharmacyService.profileExists(userId);
    if (exists) {
      throw new AppError("Pharmacy profile already exists", 400);
    }

    const profileData = {
      userId,
      ...req.body,
    };

    const profile = await pharmacyService.createProfile(profileData);

    logger.info(`Pharmacy profile created via API: userId=${userId}`);

    res.status(201).json(
      ResponseFormatter.success(
        {
          userId: profile.userId,
          pharmacyName: profile.pharmacyName,
          phone: profile.phone,
          lincenseNumber: profile.lincenseNumber,
          address: profile.address,
          createdAt: profile.createdAt,
        },
        "Pharmacy profile created successfully",
      ),
    );
  });

  /**
   * Get pharmacy profile
   * GET /api/pharmacies/profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const profile = await pharmacyService.getProfile(userId);

    if (!profile) {
      throw new AppError("Pharmacy profile not found", 404);
    }

    res.json(
      ResponseFormatter.success({
        userId: profile.userId,
        pharmacyName: profile.pharmacyName,
        phone: profile.phone,
        lincenseNumber: profile.lincenseNumber,
        address: profile.address,
        operationDays: profile.operationDays,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }),
    );
  });

  /**
   * Get pharmacy profile by ID (public)
   * GET /api/pharmacies/profile/:userId
   */
  getProfileById = asyncHandler(
    async (req: Request<{ userId: string }>, res: Response) => {
      const { userId } = req.params;

      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      const profile = await pharmacyService.getProfile(userId);

      if (!profile) {
        throw new AppError("Pharmacy profile not found", 404);
      }

      res.json(
        ResponseFormatter.success({
          userId: profile.userId,
          pharmacyName: profile.pharmacyName,
          phone: profile.phone,
          address: profile.address,
          operationDays: profile.operationDays,
        }),
      );
    },
  );

  /**
   * Update pharmacy profile
   * PUT /api/pharmacies/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const updates = req.body;

    const profile = await pharmacyService.updateProfile(userId, updates);

    if (!profile) {
      throw new AppError("Pharmacy profile not found", 404);
    }

    logger.info(`Pharmacy profile updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        {
          userId: profile.userId,
          pharmacyName: profile.pharmacyName,
          phone: profile.phone,
          updatedAt: profile.updatedAt,
        },
        "Pharmacy profile updated successfully",
      ),
    );
  });

  /**
   * Update operation days
   * PUT /api/pharmacies/operation-days
   */
  updateOperationDays = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const { operationDays } = req.body;

    const profile = await pharmacyService.updateOperationDays(
      userId,
      operationDays,
    );

    if (!profile) {
      throw new AppError("Pharmacy profile not found", 404);
    }

    logger.info(`Operation days updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { operationDays: profile.operationDays },
        "Operation days updated successfully",
      ),
    );
  });

  /**
   * Update specific day operation
   * PUT /api/pharmacies/operation-days/:day
   */
  updateDayOperation = asyncHandler(
    async (req: Request<{ day: string }>, res: Response) => {
      const userId = getUserId(req);
      const { day } = req.params;

      const { isAvailable, startTime, endTime } = req.body;

      const profile = await pharmacyService.updateDayOperation(userId, day, {
        isAvailable,
        startTime,
        endTime,
      });

      if (!profile) {
        throw new AppError("Pharmacy profile not found", 404);
      }

      logger.info(
        `Day operation updated via API: userId=${userId}, day=${day}`,
      );

      res.json(
        ResponseFormatter.success(
          { day, slot: { isAvailable, startTime, endTime } },
          "Day operation updated successfully",
        ),
      );
    },
  );

  /**
   * Update address
   * PUT /api/pharmacies/address
   */
  updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const address = req.body;

    const profile = await pharmacyService.updateAddress(userId, address);

    if (!profile) {
      throw new AppError("Pharmacy profile not found", 404);
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
   * Delete pharmacy profile
   * DELETE /api/pharmacies/profile
   */
  deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const deleted = await pharmacyService.deleteProfile(userId);

    if (!deleted) {
      throw new AppError("Pharmacy profile not found", 404);
    }

    logger.info(`Pharmacy profile deleted via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(null, "Pharmacy profile deleted successfully"),
    );
  });

  /**
   * Search pharmacies (public)
   * GET /api/pharmacies/search?q=searchTerm
   */
  searchPharmacies = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q) {
      throw new AppError("Search query is required", 400);
    }

    const pharmacies = await pharmacyService.searchPharmacies(q as string);

    res.json(
      ResponseFormatter.success(
        pharmacies.map((p) => ({
          userId: p.userId,
          pharmacyName: p.pharmacyName,
          phone: p.phone,
          address: p.address,
          operationDays: p.operationDays,
        })),
      ),
    );
  });

  /**
   * Get pharmacies by location (public)
   * GET /api/pharmacies/nearby?lat=x&lng=y&radius=10
   */
  getPharmaciesByLocation = asyncHandler(
    async (req: Request, res: Response) => {
      const { lat, lng, radius } = req.query;

      if (!lat || !lng) {
        throw new AppError("Latitude and longitude are required", 400);
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusKm = radius ? parseFloat(radius as string) : 10;

      const pharmacies = await pharmacyService.getPharmaciesByLocation(
        latitude,
        longitude,
        radiusKm,
      );

      res.json(
        ResponseFormatter.success(
          pharmacies.map((p) => ({
            userId: p.userId,
            pharmacyName: p.pharmacyName,
            phone: p.phone,
            address: p.address,
            operationDays: p.operationDays,
          })),
        ),
      );
    },
  );

  /**
   * Get pharmacies open on specific day (public)
   * GET /api/pharmacies/open/:day
   */
  getPharmaciesOpenOnDay = asyncHandler(
    async (req: Request<{ day: string }>, res: Response) => {
      const { day } = req.params;

      const pharmacies = await pharmacyService.getPharmaciesOpenOnDay(day);

      res.json(
        ResponseFormatter.success(
          pharmacies.map((p) => ({
            userId: p.userId,
            pharmacyName: p.pharmacyName,
            phone: p.phone,
            address: p.address,
            operationDays: p.operationDays,
          })),
        ),
      );
    },
  );
}

export default new PharmacyController();
