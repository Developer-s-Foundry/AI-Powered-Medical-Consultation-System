import { AiResponse } from "../entities/ai_responses";
import { Repository } from "typeorm";
import { Socket } from "socket.io";
import { Message } from "../entities/messages";
import { RiskEvent } from "../entities/risk_events";
import { Recommendation } from "../entities/recommendation";
import { RiskLevel } from '../../types/types.interface';



export class AIPipelineService {
  constructor(
    private aiResponseRepo: Repository<AiResponse>,
    private messageRepo: Repository<Message>,
   
    private riskEventRepo: Repository<RiskEvent>,
    private recommendationRepo: Repository<Recommendation>
  ) {}

  async processThroughAIPipeline({
    messageId,
    sessionId,
    patientId,
    content,
    socket,
  }: PipelineParams): Promise<void> {
    console.log(`Pipeline start | session=${sessionId}`);

    // ── STAGE 1: Call AI
    let rawAIResponse: RawAIResponse;

    try {
      rawAIResponse = await callAI(content);
    } catch (err: any) {
      socket.emit("TYPING_INDICATOR", { active: false });
      socket.emit("ERROR", {
        code: "AI_UNAVAILABLE",
        message: "Medical AI temporarily unavailable.",
      });

      await this.auditRepo.save({
        id: uuidv4(),
        session_id: sessionId,
        patient_id: patientId,
        event_type: "ai_call_failed",
        payload: { error: err.message },
      });

      return;
    }

    // ── STAGE 2: Validate
    const { valid, filtered } =
      await validateAIResponse(rawAIResponse);

    // ── STAGE 3: Store AI response
    const responseId = uuidv4();

    const aiResponse = this.aiResponseRepo.create({
      response_id: responseId,
      message_id: messageId,
      session_id: sessionId,
      raw_json: rawAIResponse,
      risk_level: valid
        ? filtered.risk_level
        : rawAIResponse.risk_level ?? "LOW",
      ai_advice: valid ? filtered.advice : null,
      json_valid: valid,
      advice_used: valid,
      model_version: "claude-sonnet-4",
    });

    await this.aiResponseRepo.save(aiResponse);

    if (!valid) {
      socket.emit("ERROR", {
        code: "AI_RESPONSE_INVALID",
        message: "Invalid AI output.",
      });
      return;
    }

    const { risk_level, symptom_codes, advice } = filtered;

    // ── STAGE 4: Score symptoms
    const weightedScore = await scoreSymptoms(
      responseId,
      risk_level,
      symptom_codes
    );

    // ── STAGE 5: Evaluate risk
    const riskResult: RiskEvaluationResult =
      await evaluateRisk({
        responseId,
        sessionId,
        patientId,
        riskLevel: risk_level,
        weightedScore,
      });

    const riskEvent = this.riskEventRepo.create({
      id: riskResult.eventId,
      response_id: responseId,
      risk_level,
      weighted_score: weightedScore,
      action: riskResult.action,
    });

    await this.riskEventRepo.save(riskEvent);

    // ── STAGE 6: Doctor recommendation
    let recommendationEntity: Recommendation | null = null;

    if (riskResult.needsDoctor) {
      const recommendation = await matchDoctor({
        eventId: riskResult.eventId,
        sessionId,
        responseId,
        recType: riskResult.recType,
        weightedScore,
        riskLevel: risk_level,
      });

      if (recommendation) {
        recommendationEntity =
          this.recommendationRepo.create({
            id: recommendation.rec_id,
            event_id: riskResult.eventId,
            doctor_id: recommendation.doctor.doctor_id,
            rec_type: recommendation.rec_type,
          });

        await this.recommendationRepo.save(recommendationEntity);
      }
    }

    // ── STAGE 7: Prepare advice
    let finalContent: string;
    let isSanitized = false;

    if (risk_level === "HIGH") {
      finalContent =
        "⚠ Immediate medical attention required.";
    } else if (risk_level === "LOW") {
      finalContent = sanitizeAdvice(advice);
      isSanitized = true;
    } else {
      finalContent = advice;
    }

    // ── STAGE 8: Emit via Socket.IO
    socket.emit("TYPING_INDICATOR", { active: false });

    socket.emit("TRIAGE_RESPONSE", {
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

    // ── STAGE 9: Save outbound message
    const message = this.messageRepo.create({
      message_id: uuidv4(),
      session_id: sessionId,
      patient_id: patientId,
      content: finalContent,
      direction: "out",
      is_sanitized: isSanitized,
    });

    await this.messageRepo.save(message);

    // ── STAGE 10: Final audit
    await this.auditRepo.save({
      id: uuidv4(),
      session_id: sessionId,
      patient_id: patientId,
      event_type: "triage_response_sent",
      payload: {
        risk_level,
        weightedScore,
        has_recommendation: !!recommendationEntity,
      },
    });

    console.log("Pipeline complete");
  }
}