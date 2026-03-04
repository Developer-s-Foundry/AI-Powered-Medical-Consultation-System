import { Prescription } from "../models/Prescription";
import { PrescriptionItem } from "../models/PrescriptionItem";
import { Drug } from "../models/Drug";
import {
  CreatePrescriptionInput,
  PrescriptionStatus,
} from "../@types/prescription.types";
import logger from "../utils/logger";
import eventPublisher from "./EventPublisher";

export class PrescriptionService {
  /**
   * Create prescription
   */
  async createPrescription(
    input: CreatePrescriptionInput,
  ): Promise<Prescription> {
    try {
      // Create prescription
      const prescription = await Prescription.create({
        doctorId: input.doctorId,
        appointmentId: input.appointmentId,
        patientId: input.patientId,
        diagnosis: input.diagnosis,
        instructions: input.instructions,
        notes: input.notes,
        status: PrescriptionStatus.ACTIVE,
      } as any);

      // Create prescription items
      const items = await Promise.all(
        input.items.map((item) =>
          PrescriptionItem.create({
            prescriptionId: prescription.id,
            drugId: item.drugId,
            dosage: item.dosage,
            duration: item.duration,
            quantityPrescribed: item.quantityPrescribed,
          } as any),
        ),
      );

      logger.info(`Prescription created: ${prescription.id}`);

      // Publish event
      await eventPublisher.publishPrescriptionCreated({
        prescriptionId: prescription.id,
        doctorId: input.doctorId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        diagnosis: input.diagnosis,
        itemCount: items.length,
      });

      return prescription;
    } catch (error) {
      logger.error("Error creating prescription:", error);
      throw error;
    }
  }

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(id: string): Promise<Prescription | null> {
    try {
      return await Prescription.findByPk(id, {
        include: [
          {
            model: PrescriptionItem,
            as: "items",
            include: [
              {
                model: Drug,
                as: "drug",
              },
            ],
          },
        ],
      });
    } catch (error) {
      logger.error("Error fetching prescription:", error);
      throw error;
    }
  }

  /**
   * Get prescriptions by patient
   */
  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    try {
      return await Prescription.findAll({
        where: { patientId },
        include: [
          {
            model: PrescriptionItem,
            as: "items",
            include: [
              {
                model: Drug,
                as: "drug",
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error fetching patient prescriptions:", error);
      throw error;
    }
  }

  /**
   * Get prescriptions by doctor
   */
  async getPrescriptionsByDoctor(doctorId: string): Promise<Prescription[]> {
    try {
      return await Prescription.findAll({
        where: { doctorId },
        include: [
          {
            model: PrescriptionItem,
            as: "items",
            include: [
              {
                model: Drug,
                as: "drug",
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      logger.error("Error fetching doctor prescriptions:", error);
      throw error;
    }
  }

  /**
   * Update prescription status
   */
  async updateStatus(
    id: string,
    status: PrescriptionStatus,
  ): Promise<Prescription | null> {
    try {
      const prescription = await Prescription.findByPk(id);
      if (!prescription) return null;

      await prescription.update({ status });
      logger.info(`Prescription status updated: ${id} -> ${status}`);

      // Publish event
      await eventPublisher.publishPrescriptionUpdated({
        prescriptionId: prescription.id,
        status,
      });

      //if fulfilled, publish additional event
      if (status === PrescriptionStatus.FULFILLED) {
        await eventPublisher.publishPrescriptionFulfilled({
          prescriptionId: id,
          patientId: prescription.patientId,
          pharmacyId: "", // Pharmacy ID can be added if available
        });
      }

      return prescription;
    } catch (error) {
      logger.error("Error updating prescription status:", error);
      throw error;
    }
  }
}

export default new PrescriptionService();
