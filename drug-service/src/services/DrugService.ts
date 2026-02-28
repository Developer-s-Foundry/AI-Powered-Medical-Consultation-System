import { Drug } from "../models/Drug";
import { DrugAttributes, DrugSearchFilters } from "../@types/drug.types";
import logger from "../utils/logger";
import eventPublisher from "./EventPublisher";
import { Op } from "sequelize";

export class DrugService {
  /**
   * Create drug
   */
  async createDrug(data: DrugAttributes): Promise<Drug> {
    try {
      const drug = await Drug.create(data as any);
      logger.info(`Drug created: ${drug.id}`);

      // Publish event
      await eventPublisher.publishDrugCreated({
        drugId: drug.id,
        pharmacyId: drug.pharmacyId,
        medicineName: drug.medicineName,
        price: parseFloat(drug.price.toString()),
      });
      return drug;
    } catch (error) {
      logger.error("Error creating drug:", error);
      throw error;
    }
  }

  /**
   * Get drug by ID
   */
  async getDrugById(id: string): Promise<Drug | null> {
    try {
      return await Drug.findByPk(id);
    } catch (error) {
      logger.error("Error fetching drug:", error);
      throw error;
    }
  }

  /**
   * Search drugs
   */
  async searchDrugs(filters: DrugSearchFilters): Promise<Drug[]> {
    try {
      const where: any = {};

      if (filters.medicineName) {
        where.medicineName = {
          [Op.iLike]: `%${filters.medicineName}%`,
        };
      }

      if (filters.manufacturer) {
        where.manufacturer = {
          [Op.iLike]: `%${filters.manufacturer}%`,
        };
      }

      if (filters.minPrice !== undefined) {
        where.price = where.price || {};
        where.price[Op.gte] = filters.minPrice;
      }

      if (filters.maxPrice !== undefined) {
        where.price = where.price || {};
        where.price[Op.lte] = filters.maxPrice;
      }

      if (filters.pharmacyId) {
        where.pharmacyId = filters.pharmacyId;
      }

      if (filters.requiresPrescription !== undefined) {
        where.requiresPrescription = filters.requiresPrescription;
      }

      // Only show drugs that haven't expired and have stock
      where.expiryDate = { [Op.gt]: new Date() };
      where.quantity = { [Op.gt]: 0 };

      const drugs = await Drug.findAll({
        where,
        order: [["medicineName", "ASC"]],
      });

      return drugs;
    } catch (error) {
      logger.error("Error searching drugs:", error);
      throw error;
    }
  }

  /**
   * Update drug
   */
  async updateDrug(
    id: string,
    updates: Partial<DrugAttributes>,
  ): Promise<Drug | null> {
    try {
      const drug = await Drug.findByPk(id);
      if (!drug) return null;

      await drug.update(updates);
      logger.info(`Drug updated: ${id}`);
      return drug;
    } catch (error) {
      logger.error("Error updating drug:", error);
      throw error;
    }
  }

  /**
   * Delete drug
   */
  async deleteDrug(id: string): Promise<boolean> {
    try {
      const deleted = await Drug.destroy({ where: { id } });
      if (deleted) {
        logger.info(`Drug deleted: ${id}`);
      }
      return deleted > 0;
    } catch (error) {
      logger.error("Error deleting drug:", error);
      throw error;
    }
  }

  /**
   * Get drugs by pharmacy
   */
  async getDrugsByPharmacy(pharmacyId: string): Promise<Drug[]> {
    try {
      return await Drug.findAll({
        where: { pharmacyId },
        order: [["medicineName", "ASC"]],
      });
    } catch (error) {
      logger.error("Error fetching pharmacy drugs:", error);
      throw error;
    }
  }

  /**
   * Update drug stock
   */
  async updateStock(id: string, quantity: number): Promise<Drug | null> {
    try {
      const drug = await Drug.findByPk(id);
      if (!drug) return null;
      const oldQuantity = drug.quantity;
      await drug.update({ quantity });
      logger.info(`Drug stock updated: ${id}, new quantity: ${quantity}`);

      //publish event
      await eventPublisher.publishDrugStockUpdated({
        drugId: drug.id,
        pharmacyId: drug.pharmacyId,
        medicineName: drug.medicineName,
        oldQuantity,
        newQuantity: quantity,
      });

      return drug;
    } catch (error) {
      logger.error("Error updating stock:", error);
      throw error;
    }
  }
}

export default new DrugService();
