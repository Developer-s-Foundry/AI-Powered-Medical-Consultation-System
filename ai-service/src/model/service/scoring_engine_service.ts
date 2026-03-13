

/**
 * Scoring Engine
 *
 * Given a validated AI response (risk_level + symptom_codes with confidence),
 * this service:
 *   1. Resolves each symptom code to its DB record (default_weight, code_id)
 *   2. Looks up SCORING_RULES for applicable multipliers
 *   3. Calculates applied_weight = default_weight × multiplier × confidence
 *   4. Writes all rows to RESPONSE_SYMPTOMS
 *   5. Returns the total weighted_score (SUM of all applied_weights)
 */

import { Repository, In } from "typeorm";
import { SymptomCode } from "../entities/symptom_code";
import { ScoringRule } from "../entities/scoring_rule";
import { ResponseSymptom } from "../entities/response_symptom";
import { SymptomInput } from "../../types/types.interface";
import AppDataSource from "../../config/database";
import { Logger } from "../../config/logger";



export class ScoringService {
    private logger = Logger.getInstance();
    private dataSource: typeof AppDataSource;

    constructor() {
        this.dataSource = AppDataSource;
    }

  private get symptomRepo(): Repository<SymptomCode> {
    return this.dataSource.getRepository(SymptomCode);
  }

  private get ruleRepo(): Repository<ScoringRule> {
    return this.dataSource.getRepository(ScoringRule);
  }

  private get responseSymptomRepo(): Repository<ResponseSymptom> {
    return this.dataSource.getRepository(ResponseSymptom);
  }

  /**
   * Score symptoms based on AI response and scoring rules
   *
   * @param responseId - AI response ID
   * @param riskLevel - "HIGH" | "MEDIUM" | "LOW"
   * @param symptomCodes - [{ code, confidence }]
   * @returns total weighted score
   */
  async scoreSymptoms(
    responseId: string,
    riskLevel: string,
    symptomCodes: SymptomInput[]
  ): Promise<number> {
    if (!symptomCodes || symptomCodes.length === 0) {
      this.logger.info("No symptom codes to score.");
      return 0;
    }

    // Fetch all symptom records from DB
    const codes = symptomCodes.map((s) => s.code);
    const dbSymptoms = await this.symptomRepo.find({
      where: { code: In(codes) },
    });

    // Map code → db record for quick lookup
    const dbMap: Record<string, SymptomCode> = {};
    dbSymptoms.forEach((row) => {
      dbMap[row.code] = row;
    });

    const allCodeIds = dbSymptoms.map((r) => r.id);

    // Fetch relevant scoring rules
    const rules = await this.ruleRepo.find({
      where: [
        {
          symptom_code: {
            id: In(allCodeIds)
          } ,
          applies_to_risk: riskLevel,
          is_active: true,
        },
        {
          symptom_code: {
            id: In(allCodeIds)
          } ,
          applies_to_risk: "ALL",
          is_active: true,
        },
      ],
    });

    // Index rules by code_id for quick lookup
  // Multiple rules can apply to the same code — we multiply them all
    const ruleMap: Record<string, ScoringRule[]> = {};
    rules.forEach((rule) => {
      if (!ruleMap[rule.symptom_code.id]) {
        ruleMap[rule.symptom_code.id] = [];
      } 
        ruleMap[rule.symptom_code.id].push(rule);

    });

    //Calculate applied_weight for each symptom and write to RESPONSE_SYMPTOMS
    let totalWeightedScore = 0;
    const responseSymptomRows: ResponseSymptom[] = [];

    for (const symptom of symptomCodes) {
      const dbRecord = dbMap[symptom.code];
      if (!dbRecord) {
        this.logger.info(`Skipping ${symptom.code} — not found in DB`);
        continue;
      }

      const { id, default_weight } = dbRecord;
      const confidence = parseFloat(symptom.confidence.toString());

       // Compound all matching multipliers for this code
      let compoundMultiplier = 1.0;
      const appliedRules = ruleMap[id] || [];
      appliedRules.forEach((rule) => {
        compoundMultiplier *= parseFloat(rule.weight_multiplier.toString());
        this.logger.info(
          `Rule '${rule.rule_name}' * ${rule.weight_multiplier} applied to ${symptom.code}`
        );
      });

      const appliedWeight =
        parseFloat(default_weight.toString()) * compoundMultiplier * confidence;
      totalWeightedScore += appliedWeight;

      responseSymptomRows.push(
        this.responseSymptomRepo.create({
            symptom_code: {id: id},
            ai_response: {response_id:responseId},
          confidence: confidence.toString(),
          applied_weight: (parseFloat(appliedWeight.toFixed(3))).toString(),
        })
      );

      this.logger.info(
        `${symptom.code}: ${default_weight} × ${compoundMultiplier.toFixed(
          3
        )} × ${confidence} = ${appliedWeight.toFixed(3)}`
      );
    }

    // Bulk insert
    await this.responseSymptomRepo.save(responseSymptomRows);

    const finalScore = parseFloat(totalWeightedScore.toFixed(3));
    this.logger.info(`Total weighted_score: ${finalScore}`);

    return finalScore;
  }

  /**
   * Returns the dominant symptom for a response
   */
  async getDominantSymptom(
    responseId: string
  ): Promise<{ code_id: number; code: string; applied_weight: number } | null> {
    const result = await this.responseSymptomRepo
      .createQueryBuilder("rs")
      .innerJoinAndSelect("SymptomCode", "sc", "sc.code_id = rs.code_id")
      .where("rs.response_id = :responseId", { responseId })
      .orderBy("rs.applied_weight", "DESC")
      .limit(1)
      .getRawOne();

    return result || null;
  }
}