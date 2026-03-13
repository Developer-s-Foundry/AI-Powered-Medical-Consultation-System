import { Repository } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { RiskEvent } from "../entities/risk_events";
import { AiResponse } from "../entities/ai_responses";
import { Session } from "../entities/session"
import { Escalation } from "../entities/escalation";
import { EvaluateRiskParams, EvaluateRiskResult } from "../../types/types.interface";
import AppDataSource from "../../config/database";
import { Logger } from "../../config/logger";

/**
 * Decision thresholds.
 * Adjust these values to change when a doctor is recommended on MEDIUM risk.
 */
export const THRESHOLDS = {
  MEDIUM_DOCTOR_THRESHOLD: 10.0,
};


export class RiskEvaluatorService {
    private logger = Logger.getInstance();
    private dataSource: typeof AppDataSource;
  constructor() {
    this.dataSource = AppDataSource
  }

  private get riskEventRepo(): Repository<RiskEvent> {
    return this.dataSource.getRepository(RiskEvent);
  }

  private get aiResponseRepo(): Repository<AiResponse> {
    return this.dataSource.getRepository(AiResponse);
  }

  private get sessionRepo(): Repository<Session> {
    return this.dataSource.getRepository(Session);
  }

  private get escalationRepo(): Repository<Escalation> {
    return this.dataSource.getRepository(Escalation);
  }

  /**
   * Main evaluation function.
   *
   * Determines action + doctor recommendation,
   * writes risk_events,
   * updates ai_responses + sessions,
   * and optionally creates escalation.
   */
  async evaluateRisk({
    responseId,
    sessionId,
    patientId,
    riskLevel,
    weightedScore,
  }: EvaluateRiskParams): Promise<EvaluateRiskResult> {
    this.logger.info(
      `Evaluating risk: level=${riskLevel} score=${weightedScore}`
    );

    // ── Decide action based on risk level + score 

    let action: string;
    let adviceShown: boolean;
    let adviceUsed: boolean;
    let needsDoctor: boolean;
    let recType: "mandatory" | "optional" | null;

    switch (riskLevel) {
      case "HIGH":
        action = "escalate";
        adviceShown = false;
        adviceUsed = false;
        needsDoctor = true;
        recType = "mandatory";
        break;

      case "MEDIUM":
        action = "show_advice";
        adviceShown = true;
        adviceUsed = true;
        needsDoctor =
          weightedScore > THRESHOLDS.MEDIUM_DOCTOR_THRESHOLD;
        recType = needsDoctor ? "optional" : null;
        break;

      case "LOW":
      default:
        action = "show_sanitized_advice";
        adviceShown = true;
        adviceUsed = true;
        needsDoctor = false;
        recType = null;
        break;
    }

    this.logger.info(
      `action=${action} | adviceShown=${adviceShown} | needsDoctor=${needsDoctor}`
    );

    // ── create RiskEvent

     const newRiskEvent = this.riskEventRepo.create({
      ai_response: {response_id: responseId},
      session: {id: sessionId},
      risk_level: riskLevel,
      weighted_score: weightedScore.toString(),
      action_taken: action,
      advice_shown: adviceShown,
    });

    this.riskEventRepo.save(newRiskEvent)
    // ── Update AI response advice_used

    await this.aiResponseRepo.update(
      { response_id: responseId },
      { advice_used: adviceUsed }
    );

    // ── Update session final risk level 

    await this.sessionRepo.update(
      { id: sessionId },
      { final_risk_level: riskLevel }
    );

    // ── Handle Escalation (HIGH only)

    let escalationId: string | null = null;

    if (riskLevel === "HIGH") {

      const newEscalation = this.escalationRepo.create({
        risk_event: {id: newRiskEvent.id},
        session: {id:sessionId},
        patient_id: patientId,
        escalation_type: "alert",
        notified_at: new Date(),
      });

      await this.escalationRepo.save(newEscalation);

      // Mark session as escalated
      await this.sessionRepo.update(
        { id: sessionId },
        { session_status: "escalated" }
      );

      this.logger.info(`🚨 Escalation created: ${escalationId}`);
    }

    return {
      eventId: newRiskEvent.id,
      action,
      adviceShown,
      adviceUsed,
      needsDoctor,
      recType,
      escalationId,
    };
  }
}