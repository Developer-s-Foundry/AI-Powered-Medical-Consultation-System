import { Request, Response } from "express";
import doctorService from "../services/DoctorService";
import { ResponseFormatter } from "../utils/response";
import { asyncHandler, AppError } from "../utils/errorHandler";
import logger from "../utils/logger";
import { BankDetails } from "../@types/doctor.types";
import { DoctorProfile } from "../models/DoctorProfile";
import eventPublisher from "../services/EventPublisher";

export class DoctorController {
  /**
   * Create doctor profile
   * POST /api/doctors/profile
   */
  createProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const exists = await doctorService.profileExists(userId);
    if (exists) {
      throw new AppError("Doctor profile already exists", 400);
    }

    const profileData = {
      userId,
      ...req.body,
    };

    const profile = await doctorService.createProfile(profileData);

    logger.info(`Doctor profile created via API: userId=${userId}`);

    res.status(201).json(
      ResponseFormatter.success(
        {
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          gender: profile.gender,
          specialty: profile.specialty,
          hospitalName: profile.hospitalName,
          address: profile.address,
          createdAt: profile.createdAt,
        },
        "Doctor profile created successfully",
      ),
    );
  });

  /**
   * Get doctor profile
   * GET /api/doctors/profile
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const profile = await doctorService.getProfile(userId);

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
    }

    res.json(
      ResponseFormatter.success({
        userId: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        gender: profile.gender,
        specialty: profile.specialty,
        hospitalName: profile.hospitalName,
        address: profile.address,
        consultationSchedule: profile.consultationSchedule,
        paymentDetails: profile.paymentDetails,
        bankDetails: profile.bankDetails,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }),
    );
  });

  /**
   * Get doctor profile by ID (public)
   * GET /api/doctors/profile/:userId
   */
  getProfileById = asyncHandler(
    async (req: Request<{ userId: string }>, res: Response) => {
      const { userId } = req.params;

      const profile = await doctorService.getProfile(userId);

      if (!profile) {
        throw new AppError("Doctor profile not found", 404);
      }

      res.json(
        ResponseFormatter.success({
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          gender: profile.gender,
          specialty: profile.specialty,
          hospitalName: profile.hospitalName,
          address: profile.address,
          consultationSchedule: profile.consultationSchedule,
          paymentDetails: {
            consultationFees: profile.paymentDetails?.consultationFees,
            // Hide Stripe details from public
          },
        }),
      );
    },
  );

  /**
   * Update doctor profile
   * PUT /api/doctors/profile
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const updates = req.body;

    const profile = await doctorService.updateProfile(userId, updates);

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
    }

    logger.info(`Doctor profile updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        {
          userId: profile.userId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          specialty: profile.specialty,
          hospitalName: profile.hospitalName,
          updatedAt: profile.updatedAt,
        },
        "Doctor profile updated successfully",
      ),
    );
  });

  /**
   * Update consultation schedule
   * PUT /api/doctors/schedule
   */
  updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const schedule = req.body;

    const profile = await doctorService.updateConsultationSchedule(
      userId,
      schedule,
    );

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
    }

    logger.info(`Consultation schedule updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { consultationSchedule: profile.consultationSchedule },
        "Schedule updated successfully",
      ),
    );
  });

  /**
   * Update available days
   * PUT /api/doctors/schedule/days
   */
  updateAvailableDays = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const { availableDays } = req.body;

    const profile = await doctorService.updateAvailableDays(
      userId,
      availableDays,
    );

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
    }

    logger.info(`Available days updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { availableDays: profile.consultationSchedule?.availableDays },
        "Available days updated successfully",
      ),
    );
  });

  /**
   * Update specific day availability
   * PUT /api/doctors/schedule/days/:day
   */
  updateDayAvailability = asyncHandler(
    async (req: Request<{ day: string }>, res: Response) => {
      const userId = req.user?.userId;
      const { day } = req.params;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const { isAvailable, startTime, endTime } = req.body;

      const profile = await doctorService.updateDayAvailability(userId, day, {
        isAvailable,
        startTime,
        endTime,
      });

      if (!profile) {
        throw new AppError("Doctor profile not found", 404);
      }

      logger.info(
        `Day availability updated via API: userId=${userId}, day=${day}`,
      );

      res.json(
        ResponseFormatter.success(
          { day, slot: { isAvailable, startTime, endTime } },
          "Day availability updated successfully",
        ),
      );
    },
  );

  /**
   * Update payment details
   * PUT /api/doctors/payment
   */
  updatePaymentDetails = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const paymentDetails = req.body;

    const profile = await doctorService.updatePaymentDetails(
      userId,
      paymentDetails,
    );

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
    }

    logger.info(`Payment details updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { paymentDetails: profile.paymentDetails },
        "Payment details updated successfully",
      ),
    );
  });

  /**
   * Get bank details
   * GET /api/doctors/bank-details
   */
  getBankDetails = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const profile = await doctorService.getProfile(userId);

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
    }

    res.json(
      ResponseFormatter.success({
        bankDetails: profile.bankDetails || null,
      }),
    );
  });

  /**
   * Update Stripe account
   * PUT /api/doctors/payment/stripe
   */
  updateStripeAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const stripeData = req.body;

    const profile = await doctorService.updateStripeAccount(userId, stripeData);

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
    }

    logger.info(`Stripe account updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { stripe: profile.paymentDetails?.stripe },
        "Stripe account updated successfully",
      ),
    );
  });

  /**
   * Get doctor bank details by userId (For Payment Service)
   * GET /api/doctors/:userId/bank-details
   * * PUBLIC - No auth required (internal service call)
   */
  getDoctorBankDetails = asyncHandler(
    async (req: Request<{ userId: string }>, res: Response) => {
      const { userId } = req.params;

      const profile = await doctorService.getProfile(userId);

      if (!profile) {
        throw new AppError("Doctor profile not found", 404);
      }

      if (!profile.bankDetails) {
        throw new AppError("Bank details not configured for this doctor", 404);
      }

      res.json(
        ResponseFormatter.success({
          userId: profile.userId,
          doctorName: `${profile.firstName} ${profile.lastName}`,
          bankDetails: profile.bankDetails,
        }),
      );
    },
  );

  /**
   * Update consultation fees
   * PUT /api/doctors/payment/fees
   */
  updateConsultationFees = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const { consultationFees } = req.body;

    const profile = await doctorService.updateConsultationFees(
      userId,
      consultationFees,
    );

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
    }

    logger.info(`Consultation fees updated via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(
        { consultationFees: profile.paymentDetails?.consultationFees },
        "Consultation fees updated successfully",
      ),
    );
  });

  /**
   * Update address
   * PUT /api/doctors/address
   */
  updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const address = req.body;

    const profile = await doctorService.updateAddress(userId, address);

    if (!profile) {
      throw new AppError("Doctor profile not found", 404);
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
   * Delete doctor profile
   * DELETE /api/doctors/profile
   */
  deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("User not authenticated", 401);
    }

    const deleted = await doctorService.deleteProfile(userId);

    if (!deleted) {
      throw new AppError("Doctor profile not found", 404);
    }

    logger.info(`Doctor profile deleted via API: userId=${userId}`);

    res.json(
      ResponseFormatter.success(null, "Doctor profile deleted successfully"),
    );
  });

  /**
   * Search doctors (public)
   * GET /api/doctors/search?q=searchTerm
   */
  searchDoctors = asyncHandler(async (req: Request, res: Response) => {
    const { q, name, specialty } = req.query;
    const searchTerm = (q || name || specialty || "") as string;

    //  return all doctors if no query
    const doctors = searchTerm
      ? await doctorService.searchDoctors(searchTerm)
      : await doctorService.getAllDoctors();

    res.json(
      ResponseFormatter.success(
        doctors.map((d) => ({
          userId: d.userId,
          firstName: d.firstName,
          lastName: d.lastName,
          specialty: d.specialty,
          hospitalName: d.hospitalName,
          phone: d.phone,
          address: d.address,
        })),
      ),
    );
  });
  /**
   * Get doctors by specialty (public)
   * GET /api/doctors/specialty/:specialty
   */
  getDoctorsBySpecialty = asyncHandler(
    async (req: Request<{ specialty: string }>, res: Response) => {
      const { specialty } = req.params;

      const doctors = await doctorService.getDoctorsBySpecialty(specialty);

      res.json(
        ResponseFormatter.success(
          doctors.map((d) => ({
            userId: d.userId,
            firstName: d.firstName,
            lastName: d.lastName,
            specialty: d.specialty,
            hospitalName: d.hospitalName,
            address: d.address,
            consultationSchedule: d.consultationSchedule,
          })),
        ),
      );
    },
  );

  /**
   * Get doctors available on specific day (public)
   * GET /api/doctors/available/:day
   */
  getDoctorsAvailableOnDay = asyncHandler(
    async (req: Request<{ day: string }>, res: Response) => {
      const { day } = req.params;

      const doctors = await doctorService.getDoctorsAvailableOnDay(day);

      res.json(
        ResponseFormatter.success(
          doctors.map((d) => ({
            userId: d.userId,
            firstName: d.firstName,
            lastName: d.lastName,
            specialty: d.specialty,
            hospitalName: d.hospitalName,
            consultationSchedule: d.consultationSchedule,
          })),
        ),
      );
    },
  );

  /**
   * Update bank details (WITH ENCRYPTION)
   */
  async updateBankDetails(
    userId: string,
    bankDetails: BankDetails,
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      // Encrypt before saving
      const encryptionService = (await import("../utils/encryption")).default;
      const encrypted = encryptionService.encryptBankDetails(bankDetails);

      await profile.update({ bankDetails: encrypted });

      logger.info(`Bank details updated (encrypted) for doctor: ${userId}`);

      // Publish event
      await eventPublisher.publishDoctorBankUpdated({
        userId,
        bankDetails: {
          businessName: bankDetails.businessName,
          bankCode: bankDetails.bankCode,
          accountNumber: "******" + bankDetails.accountNumber.slice(-4), // Masked
          accountName: bankDetails.accountName,
          isVerified: bankDetails.isVerified || false,
        },
      });

      return profile;
    } catch (error) {
      logger.error("Error updating bank details:", error);
      throw error;
    }
  }

  /**
   * Get doctor profile (WITH BANK DETAILS DECRYPTION)
   */
  async getProfileWithBankDetails(
    userId: string,
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) return null;

      // Decrypt bank details if they exist
      if (profile.bankDetails) {
        const encryptionService = (await import("../utils/encryption")).default;
        (profile as any).bankDetails = encryptionService.decryptBankDetails(
          profile.bankDetails as any,
        );
      }

      return profile;
    } catch (error) {
      logger.error("Error fetching doctor profile with bank details:", error);
      throw error;
    }
  }

  /**
   * Verify bank account
   */
  async verifyBankAccount(
    userId: string,
    accountNumber: string,
    bankCode: string,
  ): Promise<any> {
    try {
      const axios = (await import("axios")).default;

      // Call Paystack to verify
      const response = await axios.get(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      if (response.data.status) {
        const accountName = response.data.data.account_name;

        const profile = await DoctorProfile.findByPk(userId);
        if (profile) {
          const bankDetails: BankDetails = {
            businessName:
              (profile.bankDetails as any)?.businessName ||
              `${profile.firstName} ${profile.lastName}`,
            bankCode,
            accountNumber,
            accountName,
            isVerified: true,
            verifiedAt: new Date(),
          };

          // Encrypt before saving
          const encryptionService = (await import("../utils/encryption"))
            .default;
          const encrypted = encryptionService.encryptBankDetails(bankDetails);

          await profile.update({ bankDetails: encrypted });

          logger.info(
            `Bank account verified and encrypted for doctor: ${userId}`,
          );

          // Publish event
          await eventPublisher.publishDoctorBankVerified({
            userId,
            accountNumber: "******" + accountNumber.slice(-4), // Masked
            accountName,
            bankCode,
          });

          return {
            accountNumber: "******" + accountNumber.slice(-4),
            accountName,
            bankCode,
            isVerified: true,
          };
        }
      }

      throw new Error("Bank account verification failed");
    } catch (error) {
      logger.error("Error verifying bank account:", error);
      throw error;
    }
  }
}

export default new DoctorController();
