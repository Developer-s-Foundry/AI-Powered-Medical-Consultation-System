import { PharmacyProfile } from "../models/PharmacyProfile";
import { PharmacyProfileAttributes } from "../@types/pharmacy.types";
import logger from "../utils/logger";
import eventPublisher from "./EventPublisher";

export class PharmacyService {
  /**
   * Create pharmacy profile
   */
  async createProfile(
    data: PharmacyProfileAttributes,
  ): Promise<PharmacyProfile> {
    try {
      const profile = await PharmacyProfile.create(data as any);

      logger.info(`Pharmacy profile created: userId=${data.userId}`);

      // Publish event
      await eventPublisher.publishProfileCreated({
        userId: profile.userId,
        profileType: "pharmacy",
        data: {
          pharmacyName: profile.pharmacyName,
          phone: profile.phone,
          lincenseNumber: profile.lincenseNumber,
        },
      });

      return profile;
    } catch (error) {
      logger.error("Error creating pharmacy profile:", error);
      throw error;
    }
  }

  /**
   * Get pharmacy profile by userId
   */
  async getProfile(userId: string): Promise<PharmacyProfile | null> {
    try {
      const profile = await PharmacyProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Pharmacy profile not found: userId=${userId}`);
        return null;
      }

      return profile;
    } catch (error) {
      logger.error("Error fetching pharmacy profile:", error);
      throw error;
    }
  }

  /**
   * Update pharmacy profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<PharmacyProfileAttributes>,
  ): Promise<PharmacyProfile | null> {
    try {
      const profile = await PharmacyProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Pharmacy profile not found for update: userId=${userId}`);
        return null;
      }

      await profile.update(updates);

      logger.info(`Pharmacy profile updated: userId=${userId}`);

      // Publish event
      await eventPublisher.publishProfileUpdated({
        userId: profile.userId,
        profileType: "pharmacy",
        updates,
      });

      return profile;
    } catch (error) {
      logger.error("Error updating pharmacy profile:", error);
      throw error;
    }
  }

  /**
   * Update operation days
   */
  async updateOperationDays(
    userId: string,
    operationDays: any,
  ): Promise<PharmacyProfile | null> {
    try {
      const profile = await PharmacyProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Pharmacy profile not found: userId=${userId}`);
        return null;
      }

      await profile.update({ operationDays });

      logger.info(`Operation days updated: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error updating operation days:", error);
      throw error;
    }
  }

  /**
   * Update specific day operation
   */
  async updateDayOperation(
    userId: string,
    day: string,
    daySlot: {
      isAvailable: boolean;
      startTime: string;
      endTime: string;
    },
  ): Promise<PharmacyProfile | null> {
    try {
      const profile = await PharmacyProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Pharmacy profile not found: userId=${userId}`);
        return null;
      }

      const operationDays = profile.operationDays || { availableDays: {} };

      if (!operationDays.availableDays) {
        operationDays.availableDays = {};
      }

      operationDays.availableDays[day] = daySlot;

      await profile.update({ operationDays });

      logger.info(`Day operation updated: userId=${userId}, day=${day}`);

      return profile;
    } catch (error) {
      logger.error("Error updating day operation:", error);
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
  ): Promise<PharmacyProfile | null> {
    try {
      const profile = await PharmacyProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Pharmacy profile not found: userId=${userId}`);
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
   * Delete pharmacy profile
   */
  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const deleted = await PharmacyProfile.destroy({
        where: { userId },
      });

      if (deleted) {
        logger.info(`Pharmacy profile deleted: userId=${userId}`);

        // Publish event
        await eventPublisher.publishProfileDeleted({
          userId,
          profileType: "pharmacy",
        });
      }

      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting pharmacy profile:", error);
      throw error;
    }
  }

  /**
   * Check if profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      const count = await PharmacyProfile.count({
        where: { userId },
      });
      return count > 0;
    } catch (error) {
      logger.error("Error checking profile existence:", error);
      throw error;
    }
  }

  /**
   * Search pharmacies by name
   */
  async searchPharmacies(searchTerm: string): Promise<PharmacyProfile[]> {
    try {
      const { Op } = require("sequelize");

      const profiles = await PharmacyProfile.findAll({
        where: {
          pharmacyName: { [Op.iLike]: `%${searchTerm}%` },
        },
      });

      return profiles;
    } catch (error) {
      logger.error("Error searching pharmacies:", error);
      throw error;
    }
  }

  /**
   * Get pharmacies by location (within radius)
   */
  async getPharmaciesByLocation(
    lat: number,
    lng: number,
    radiusKm: number = 10,
  ): Promise<PharmacyProfile[]> {
    try {
      const profiles = await PharmacyProfile.findAll();

      // Filter pharmacies within radius
      const nearbyPharmacies = profiles.filter((profile) => {
        if (!profile.address || !profile.address.coordinates) return false;

        const distance = this.calculateDistance(
          lat,
          lng,
          profile.address.coordinates.lat,
          profile.address.coordinates.lng,
        );

        return distance <= radiusKm;
      });

      return nearbyPharmacies;
    } catch (error) {
      logger.error("Error fetching pharmacies by location:", error);
      throw error;
    }
  }

  /**
   * Get pharmacies open on specific day
   */
  async getPharmaciesOpenOnDay(day: string): Promise<PharmacyProfile[]> {
    try {
      const profiles = await PharmacyProfile.findAll();

      // Filter pharmacies that are open on the specified day
      const openPharmacies = profiles.filter((profile) => {
        const operationDays = profile.operationDays;
        if (!operationDays || !operationDays.availableDays) return false;

        const daySlot = operationDays.availableDays[day];
        return daySlot && daySlot.isAvailable;
      });

      return openPharmacies;
    } catch (error) {
      logger.error("Error fetching pharmacies by day:", error);
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export default new PharmacyService();
