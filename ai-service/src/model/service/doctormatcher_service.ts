// services/DoctorMatcher.ts
import { ResponseSymptom } from "../entities/response_symptom";
import { SymptomSpecialty } from "../entities/symptom_specialty";
import { Recommendation } from "../entities/recommendation";
import {
  MatchDoctorParams,
  RecommendationDetails,
} from "../../types/types.interface";
import { Logger } from "../../config/logger";
import AppDataSource from "../../config/database";
import { config } from "../../config/env.config";
import { AppError } from "../../custom.functions.ts/error";
import { WeeklySchedule } from "../../types/types.interface";



export class DoctorMatcher {
  private logger = Logger.getInstance();
  private dataSource: typeof AppDataSource;

  constructor() {
    this.dataSource = AppDataSource;
  }

  buildReason({
    riskLevel,
    weightedScore,
    dominantSymptom,
    specialty,
    recType,
  }: {
    riskLevel: string;
    weightedScore: number;
    dominantSymptom: string;
    specialty: string;
    recType: "mandatory" | "optional"| null;
  }) {
    if (riskLevel === "HIGH") {
      return `HIGH risk triage — ${dominantSymptom} requires immediate specialist review (${specialty}).`;
    }

    if (recType === "optional") {
      return `Weighted score of ${weightedScore.toFixed(1)} exceeded threshold for ${dominantSymptom}. A consultation with ${specialty} is recommended.`;
    }

    return `Symptom assessment for ${dominantSymptom} suggests ${specialty} review.`;
  }

  async getDoctorBySpecialty(specialty_name: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(
        `http://localhost:3000/api/doctors/specialty/${specialty_name}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.GATEWAY_SECRET_KEY ?? ""}`,
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new AppError("Doctor service error", response.status);
      }

      return await response.json();
    } catch (error: unknown) {
      if ((error as Error).name === "AbortError") {
        throw new AppError("Doctor service timeout", 504);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async matchDoctor({
    eventId,
    sessionId,
    responseId,
    recType,
    weightedScore,
    riskLevel,
  }: MatchDoctorParams): Promise<RecommendationDetails | null> {
    this.logger.info(`Matching doctor: recType=${recType} score=${weightedScore}`);
  
    const responseSymptomRepo = this.dataSource.getRepository(ResponseSymptom);
    const specialtyRepo = this.dataSource.getRepository(SymptomSpecialty);
    const recommendationRepo = this.dataSource.getRepository(Recommendation);

    // Find dominant symptom
    const dominant = await responseSymptomRepo
      .createQueryBuilder("rs")
      .leftJoinAndSelect("rs.symptomCode", "sc")
      .where("rs.ai_response.response_id = :responseId", { responseId })
      .orderBy("rs.applied_weight", "DESC")
      .limit(1)
      .getOne();

    if (!dominant) {
      this.logger.info("No dominant symptom found");
      return null;
    }

    const dominantCodeId = dominant.symptom_code.id;
    this.logger.info(
      `Dominant symptom: ${dominant.symptom_code.code} (${dominant.symptom_code.description})`,
    );

    // Get preferred specialty (highest priority first)
    const specialtyMatch = await specialtyRepo.findOne({
      where: { symptom_code: { id: dominantCodeId } },
      relations: ["specialty"],
      order: { priority: "DESC" },
    });

    const preferredSpecialty =
      specialtyMatch?.specialty.name ?? "General Practice";
    this.logger.info(`Preferred specialty: ${preferredSpecialty}`);

    // Find available doctor by specialty
    let doctors = await this.getDoctorBySpecialty(preferredSpecialty);

    // Fallback to General Practice
    if (!doctors || doctors.length === 0) {
      if (preferredSpecialty !== "General Practice") {
        this.logger.info(`No ${preferredSpecialty} available — falling back`);
      }
      doctors = await this.getDoctorBySpecialty("General Practice");
    }

    if (!doctors || doctors.length === 0) {
      this.logger.info("No available doctor found — unassigned");
      return null;
    }

    const doctor = doctors[0];

    // Build reason
    const reason = this.buildReason({
      riskLevel,
      weightedScore,
      dominantSymptom: dominant.symptom_code.description,
      specialty: doctor?.specialty ?? preferredSpecialty,
      recType,
    });

    // Create recommendation
    const recommendation = recommendationRepo.create({
      risk_event: { id: eventId },
      session: { id: sessionId },
      doctor_id: doctor?.doctor?.userId ?? null,
      rec_type: recType,
      reason,
    });

    await recommendationRepo.save(recommendation);
    this.logger.info(
      `Recommendation created → ${doctor?.firstName ?? "Unassigned"}`,
    );

    if (!doctor) return null;
    // filter doctor available day
    const allDays: WeeklySchedule  = doctor.consultationSchedule.availableDays;
    
    
    const doctorAvailableDays = Object.fromEntries(Object.entries(allDays).filter(
      ([_, value]) => value.isAvailable)
    )

  

    // subsequently, return array of all the doctors
    return {
      recId: recommendation.rec_id,
      recType: recType,
      reason,
      doctor: {
        doctorId: doctor.userId,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        specialty: doctor.specialty,
        hospitalName: doctor.hospitalName,
        address: doctor.address,
        availableDays: doctorAvailableDays
      },
    };
  }
}
