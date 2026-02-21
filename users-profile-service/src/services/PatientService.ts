import { PatientProfile } from "../models/PatientProfile";
import { PatientProfileAttributes } from "../@types/patient.types";
import logger from "../utils/logger";
import eventPublisher from "./EventPublisher";

export class PatientService {
  /**
   * Create patient profile
   */
  async createProfile(data: PatientProfileAttributes): Promise<PatientProfile> {
    try {
      const profile = await PatientProfile.create(data as any);

      logger.info(`Patient profile created: userId=${data.userId}`);

      // Publish event
      await eventPublisher.publishProfileCreated({
        userId: profile.userId,
        profileType: "patient",
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        },
      });

      return profile;
    } catch (error) {
      logger.error("Error creating patient profile:", error);
      throw error;
    }
  }

  /**
   * Get patient profile by userId
   */
  async getProfile(userId: string): Promise<PatientProfile | null> {
    try {
      const profile = await PatientProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Patient profile not found: userId=${userId}`);
        return null;
      }

      return profile;
    } catch (error) {
      logger.error("Error fetching patient profile:", error);
      throw error;
    }
  }

  /**
   * Update patient profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<PatientProfileAttributes>,
  ): Promise<PatientProfile | null> {
    try {
      const profile = await PatientProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Patient profile not found for update: userId=${userId}`);
        return null;
      }

      await profile.update(updates);

      logger.info(`Patient profile updated: userId=${userId}`);

      // Publish event
      await eventPublisher.publishProfileUpdated({
        userId: profile.userId,
        profileType: "patient",
        updates,
      });

      return profile;
    } catch (error) {
      logger.error("Error updating patient profile:", error);
      throw error;
    }
  }

  /**
   * Update medical history
   */
  async updateMedicalHistory(
    userId: string,
    medicalHistory: any,
  ): Promise<PatientProfile | null> {
    try {
      const profile = await PatientProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Patient profile not found: userId=${userId}`);
        return null;
      }

      await profile.update({ medicalHistory });

      logger.info(`Medical history updated: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error updating medical history:", error);
      throw error;
    }
  }

  /**
   * Add existing condition
   */
  async addExistingCondition(
    userId: string,
    condition: {
      condition: string;
      diagnosedYear: Date;
      isOngoing: boolean;
    },
  ): Promise<PatientProfile | null> {
    try {
      const profile = await PatientProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Patient profile not found: userId=${userId}`);
        return null;
      }

      const medicalHistory = profile.medicalHistory || {
        existingConditions: [],
      };

      if (!medicalHistory.existingConditions) {
        medicalHistory.existingConditions = [];
      }

      medicalHistory.existingConditions.push(condition);

      await profile.update({ medicalHistory });

      logger.info(`Existing condition added: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error adding existing condition:", error);
      throw error;
    }
  }

  /**
   * Update current medications
   */
  async updateCurrentMedications(
    userId: string,
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>,
  ): Promise<PatientProfile | null> {
    try {
      const profile = await PatientProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Patient profile not found: userId=${userId}`);
        return null;
      }

      await profile.update({ currentMedications: medications });

      logger.info(`Current medications updated: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error updating medications:", error);
      throw error;
    }
  }

  /**
   * Add medication
   */
  async addMedication(
    userId: string,
    medication: {
      name: string;
      dosage: string;
      frequency: string;
    },
  ): Promise<PatientProfile | null> {
    try {
      const profile = await PatientProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Patient profile not found: userId=${userId}`);
        return null;
      }

      const currentMedications = profile.currentMedications || [];
      currentMedications.push(medication);

      await profile.update({ currentMedications });

      logger.info(`Medication added: userId=${userId}`);

      return profile;
    } catch (error) {
      logger.error("Error adding medication:", error);
      throw error;
    }
  }

  /**
   * Remove medication
   */
  async removeMedication(
    userId: string,
    medicationName: string,
  ): Promise<PatientProfile | null> {
    try {
      const profile = await PatientProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Patient profile not found: userId=${userId}`);
        return null;
      }

      const currentMedications = profile.currentMedications || [];
      const filteredMedications = currentMedications.filter(
        (med: any) => med.name !== medicationName,
      );

      await profile.update({ currentMedications: filteredMedications });

      logger.info(
        `Medication removed: userId=${userId}, medication=${medicationName}`,
      );

      return profile;
    } catch (error) {
      logger.error("Error removing medication:", error);
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
  ): Promise<PatientProfile | null> {
    try {
      const profile = await PatientProfile.findByPk(userId);

      if (!profile) {
        logger.warn(`Patient profile not found: userId=${userId}`);
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
   * Delete patient profile
   */
  async deleteProfile(userId: string): Promise<boolean> {
    try {
      const deleted = await PatientProfile.destroy({
        where: { userId },
      });

      if (deleted) {
        logger.info(`Patient profile deleted: userId=${userId}`);

        // Publish event
        await eventPublisher.publishProfileDeleted({
          userId,
          profileType: "patient",
        });
      }

      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting patient profile:", error);
      throw error;
    }
  }

  /**
   * Check if profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    try {
      const count = await PatientProfile.count({
        where: { userId },
      });
      return count > 0;
    } catch (error) {
      logger.error("Error checking profile existence:", error);
      throw error;
    }
  }

  /**
   * Get patients by blood group
   */
  async getPatientsByBloodGroup(bloodGroup: string): Promise<PatientProfile[]> {
    try {
      const profiles = await PatientProfile.findAll({
        where: {
          medicalHistory: {
            bloodGroup,
          },
        } as any,
      });

      return profiles;
    } catch (error) {
      logger.error("Error fetching patients by blood group:", error);
      throw error;
    }
  }

  /**
   * Search patients by name
   */
  async searchPatients(searchTerm: string): Promise<PatientProfile[]> {
    try {
      const { Op } = require("sequelize");

      const profiles = await PatientProfile.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${searchTerm}%` } },
            { lastName: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
      });

      return profiles;
    } catch (error) {
      logger.error("Error searching patients:", error);
      throw error;
    }
  }
}

export default new PatientService();
