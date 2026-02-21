import { DoctorProfile } from "../models/DoctorProfile";
import { DoctorProfileAttributes } from "../@types/doctor.types";
import logger from "../utils/logger";
import eventPublisher from "./EventPublisher";

export class DoctorService {
  /**
   * Create doctor profile
   */
  async createProfile(data: DoctorProfileAttributes): Promise<DoctorProfile> {
    try {
      const profile = await DoctorProfile.create(data as any);

      logger.info(`Doctor profile created: userId=${data.userId}`);

      // Publish event
      await eventPublisher.publishProfileCreated({
        userId: profile.userId,
        profileType: "doctor",
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          specialty: profile.specialty,
          hospitalName: profile.hospitalName,
        },
      });

      return profile;
    } catch (error) {
      logger.error("Error creating doctor profile:", error);
      throw error;
    }
  }

  /**
   * Get doctor profile by userId
   */
  async getProfile(userId: string): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      return profile;
    } catch (error) {
      logger.error("Error fetching doctor profile:", error);
      throw error;
    }
  }

  /**
   * Update doctor profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<DoctorProfileAttributes>,
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found for update: userId=${userId}`);
        return null;
      }

      await profile.update(updates);

      logger.info(`Doctor profile updated: userId=${userId}`);

      // Publish event
      await eventPublisher.publishProfileUpdated({
        userId: profile.userId,
        profileType: "doctor",
        updates,
      });

      return profile;
    } catch (error) {
      logger.error("Error updating doctor profile:", error);
      throw error;
    }
  }

  /**
   * Update consultation schedule
   */
  async updateConsultationSchedule(
    userId: string,
    consultationSchedule: any,
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      await profile.update({ consultationSchedule });

      logger.info(`Consultation schedule updated: userId=${userId}`);

      // Publish event
      await eventPublisher.publishScheduleUpdated({
        userId: profile.userId,
        schedule: consultationSchedule,
      });

      return profile;
    } catch (error) {
      logger.error("Error updating consultation schedule:", error);
      throw error;
    }
  }

  /**
   * Update available days
   */
  async updateAvailableDays(
    userId: string,
    availableDays: any,
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      const consultationSchedule = profile.consultationSchedule || {};
      consultationSchedule.availableDays = availableDays;

      await profile.update({ consultationSchedule });

      logger.info(`Available days updated: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error updating available days:", error);
      throw error;
    }
  }

  /**
   * Update specific day availability
   */
  async updateDayAvailability(
    userId: string,
    day: string,
    daySlot: {
      isAvailable: boolean;
      startTime: string;
      endTime: string;
    },
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      const consultationSchedule = profile.consultationSchedule || {
        availableDays: {},
      };

      if (!consultationSchedule.availableDays) {
        consultationSchedule.availableDays = {};
      }

      consultationSchedule.availableDays[day] = daySlot;

      await profile.update({ consultationSchedule });

      logger.info(`Day availability updated: userId=${userId}, day=${day}`);

      return profile;
    } catch (error) {
      logger.error("Error updating day availability:", error);
      throw error;
    }
  }

  /**
   * Update payment details
   */
  async updatePaymentDetails(
    userId: string,
    paymentDetails: any,
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      await profile.update({ paymentDetails });

      logger.info(`Payment details updated: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error updating payment details:", error);
      throw error;
    }
  }

  /**
   * Update Stripe account info
   */
  async updateStripeAccount(
    userId: string,
    stripeData: {
      accountId?: string;
      accountStatus?: string;
      payoutsEnabled?: boolean;
      chargesEnabled?: boolean;
      onboardingLink?: string | null;
      currency?: string;
    },
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      const paymentDetails = profile.paymentDetails || { stripe: {} };

      paymentDetails.stripe = {
        ...paymentDetails.stripe,
        ...stripeData,
      };

      await profile.update({ paymentDetails });

      logger.info(`Stripe account updated: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error updating Stripe account:", error);
      throw error;
    }
  }

  /**
   * Update consultation fees
   */
  async updateConsultationFees(
    userId: string,
    consultationFees: any,
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      const paymentDetails = profile.paymentDetails || {};
      paymentDetails.consultationFees = consultationFees;

      await profile.update({ paymentDetails });

      logger.info(`Consultation fees updated: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error updating consultation fees:", error);
      throw error;
    }
  }

  /**
   * Update address
   */
  async updateAddress(
    userId: string,
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    },
  ): Promise<DoctorProfile | null> {
    try {
      const profile = await DoctorProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Doctor profile not found: userId=${userId}`);
        return null;
      }

      await profile.update({ address });

      logger.info(`Address updated: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error updating address:", error);
      throw error;
    }
  }

  /**
   * Delete doctor profile
   */
  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const deleted = await DoctorProfile.destroy({
        where: { userId },
      });

      if (deleted) {
        logger.info(`Doctor profile deleted: userId=${userId}`);

        // Publish event
        await eventPublisher.publishProfileDeleted({
          userId,
          profileType: "doctor",
        });
      }

      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting doctor profile:", error);
      throw error;
    }
  }

  /**
   * Check if profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      const count = await DoctorProfile.count({
        where: { userId },
      });
      return count > 0;
    } catch (error) {
      logger.error("Error checking profile existence:", error);
      throw error;
    }
  }

  /**
   * Get doctors by specialty
   */
  async getDoctorsBySpecialty(specialty: string): Promise<DoctorProfile[]> {
    try {
      const { Op } = require("sequelize");

      const profiles = await DoctorProfile.findAll({
        where: {
          specialty: { [Op.iLike]: `%${specialty}%` },
        },
      });

      return profiles;
    } catch (error) {
      logger.error("Error fetching doctors by specialty:", error);
      throw error;
    }
  }

  /**
   * Search doctors by name or specialty
   */
  async searchDoctors(searchTerm: string): Promise<DoctorProfile[]> {
    try {
      const { Op } = require("sequelize");

      const profiles = await DoctorProfile.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${searchTerm}%` } },
            { lastName: { [Op.iLike]: `%${searchTerm}%` } },
            { specialty: { [Op.iLike]: `%${searchTerm}%` } },
            { hospitalName: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
      });

      return profiles;
    } catch (error) {
      logger.error("Error searching doctors:", error);
      throw error;
    }
  }

  /**
   * Get doctors available on specific day
   */
  async getDoctorsAvailableOnDay(day: string): Promise<DoctorProfile[]> {
    try {
      const profiles = await DoctorProfile.findAll();

      // Filter doctors who are available on the specified day
      const availableDoctors = profiles.filter((profile) => {
        const schedule = profile.consultationSchedule;
        if (!schedule || !schedule.availableDays) return false;

        const daySlot = schedule.availableDays[day];
        return daySlot && daySlot.isAvailable;
      });

      return availableDoctors;
    } catch (error) {
      logger.error("Error fetching doctors by day:", error);
      throw error;
    }
  }
}

export default new DoctorService();
