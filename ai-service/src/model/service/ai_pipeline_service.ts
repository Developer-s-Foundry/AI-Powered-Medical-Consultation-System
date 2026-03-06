import { AiResponse } from "./../entities/ai_responses";
import { Message } from "../entities/messages";
import {
  EvaluateRiskResult,
  MatchDoctorParams,
  PipelineParams,
  RawAIResponse,
  RecommendationDetails,
} from "../../types/types.interface";
import { Logger } from "../../config/logger";
import { AIService } from "./ai_service";
import AppDataSource from "../../config/database";
import { AppError } from "../../custom.functions.ts/error";
import { ScoringService } from "./scoring_engine_service";
import { RiskEvaluatorService } from "./risk_evaluator_service";
import { DoctorMatcher } from "./doctormatcher_service";
import { sanitizeAdvice } from "./advice_sanitizer_service";
import { MessageDirection, MessageType } from "../../types/enum.types";

export class AIPipelineService {
  private logger = Logger.getInstance();
  private aiService = new AIService();
  private aiResponseRepo = AppDataSource.getRepository(AiResponse);
  private messageRepo = AppDataSource.getRepository(Message);
  private doctorMatcher = new DoctorMatcher();
  private scoringService = new ScoringService();
  private riskEvaluatorService = new RiskEvaluatorService();

  async processThroughAIPipeline({
    messageId,
    sessionId,
    patientId,
    content,
    socket,
    socketId,
  }: PipelineParams): Promise<void> {
    this.logger.info(`Pipeline start | session=${sessionId}`);

    // ── STAGE 1: Call AI
    let rawAIResponse: RawAIResponse;

    try {
      rawAIResponse = await this.aiService.callAI(content);
    } catch (err: any) {
      socket.to(socketId).emit("TYPING_INDICATOR", { active: false });
      socket.to(socketId).emit("ERROR", {
        code: "AI_UNAVAILABLE",
        message: "Medical AI temporarily unavailable.",
      });
      return;
    }

    // ── STAGE 2: Validate
    const { valid, filtered } =
      await this.aiService.validateAIResponse(rawAIResponse);

    // ── STAGE 3: Store AI response
    if (!valid && !filtered) {
      throw new AppError("invalid response", 401);
    }
    const aiResponse = this.aiResponseRepo.create({
      message: { id: messageId },
      session: { id: sessionId },
      json_valid: valid,
      advice_used: valid,
      model_version: "claude-sonnet-4",
      risk_level:
        valid && filtered
          ? filtered.risk_level
          : (rawAIResponse.risk_level ?? "LOW"),
      ai_advice: valid && filtered ? filtered.advice : null,
      raw_json: rawAIResponse,
    });

    await this.aiResponseRepo.save(aiResponse);

    if (!valid || !filtered) {
      socket.emit("ERROR", {
        code: "AI_RESPONSE_INVALID",
        message: "Invalid AI output.",
      });
      return;
    }

    const { risk_level, symptom_codes, advice } = filtered;

    // ── STAGE 4: Score symptoms
    const weightedScore = await this.scoringService.scoreSymptoms(
      aiResponse.response_id,
      risk_level,
      symptom_codes,
    );

    // ── STAGE 5: Evaluate risk
    const riskResult: EvaluateRiskResult =
      await this.riskEvaluatorService.evaluateRisk({
        responseId: aiResponse.response_id,
        sessionId,
        patientId,
        riskLevel: risk_level,
        weightedScore,
      });

    // ── STAGE 6: Doctor recommendation
    let recommendationEntity: RecommendationDetails | null = null;

    if (riskResult.needsDoctor) {
      recommendationEntity = await this.doctorMatcher.matchDoctor({
        eventId: riskResult.eventId,
        sessionId,
        responseId: aiResponse.response_id,
        recType: riskResult.recType,
        weightedScore,
        riskLevel: risk_level,
      });
    }

    // ── STAGE 7: Prepare advice
    let finalContent: string;
    let isSanitized = false;

    if (risk_level === "HIGH") {
      finalContent = "Immediate medical attention required.";
    } else if (risk_level === "LOW") {
      finalContent = sanitizeAdvice(advice);
      isSanitized = true;
    } else {
      finalContent = advice;
    }

    // ── STAGE 8: Emit via Socket.IO
    this.logger.info(`Emitting TRIAGE_RESPONSE to socket: ${socketId}`);
    socket.emit("TYPING_INDICATOR", { active: false });

    socket.emit("TRIAGE_RESPONSE", {
      type: MessageType.AI_RESPONSE,
      session_id: sessionId,
      message_id: messageId,
      risk_level,
      weighted_score: weightedScore,
      content: finalContent,
      is_sanitized: isSanitized,
      symptom_codes,
      recommendation: recommendationEntity,
      escalation: riskResult.escalationId
        ? { escalation_id: riskResult.escalationId }
        : null,
      timestamp: new Date().toISOString(),
    });
    this.logger.info(`TRIAGE_RESPONSE emitted`);

    // ── STAGE 9: Save outbound message
    const message = this.messageRepo.create({
      session: { id: sessionId },
      patient_id: patientId,
      content: finalContent,
      direction: MessageDirection.OUT,
      is_sanitized: isSanitized,
    });

    await this.messageRepo.save(message);

    this.logger.info("Pipeline complete");
  }
}
