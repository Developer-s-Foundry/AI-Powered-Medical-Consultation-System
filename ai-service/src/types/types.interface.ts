import { Recommendation } from "./../model/entities/recommendation";
import { Server } from "socket.io";

export interface patientPayload {
  type: string;
  content: string;
}

export interface SymptomInput {
  code: string;
  confidence: number;
}

export interface EvaluateRiskParams {
  responseId: string;
  sessionId: string;
  patientId: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  weightedScore: number;
}

export interface EvaluateRiskResult {
  eventId: string;
  action: string;
  adviceShown: boolean;
  adviceUsed: boolean;
  needsDoctor: boolean;
  recType: "mandatory" | "optional" | null;
  escalationId: string | null;
}

export interface MatchDoctorParams {
  eventId: string;
  sessionId: string;
  responseId: string;
  recType: "mandatory" | "optional" | null;
  weightedScore: number;
  riskLevel: string;
}

export interface ReplacementRule {
  pattern: RegExp;
  replacement: string;
}

export interface SymptomCode {
  code: string;
  confidence: number;
}

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface RawAIResponse {
  risk_level: RiskLevel;
  symptom_codes: SymptomCode[];
  advice: string;
}

export interface ValidatedAIResponse {
  valid: boolean;
  errors: string[];
  filtered: RawAIResponse;
}

export interface RiskEvaluationResult {
  eventId: string;
  action: string;
  adviceShown: boolean;
  needsDoctor: boolean;
  escalationId?: string;
  recType?: string;
}

export interface PipelineParams {
  messageId: string;
  sessionId: string;
  patientId: string;
  content: string;
  socket: Server;
  socketId: string;
}

export interface RecommendationDetails {
  rec_id: string;
  rec_type: "mandatory" | "optional" | null;
  reason: string;
  doctor: {
    doctor_id: string;
    first_name: string;
    last_name: string;
    specialty: string;
  } | null;
}

// {
//   type: "TRIAGE_RESPONSE",
//   risk_level: "MEDIUM",
//   content: "Monitor your blood sugar...",
//   recommendation: {
//     rec_type: "optional",
//     doctor: { full_name: "Dr. Amara Okafor" }
//   }
// }

// {
//   type: "TRIAGE_RESPONSE",
//   risk_level: "MEDIUM",
//   content: "Monitor your blood sugar...",
//   recommendation: null   // frontend sees null, renders no button
// }

// {
//   type: "TRIAGE_RESPONSE",
//   risk_level: "LOW",
//   content: "Rest and stay hydrated. See a doctor if symptoms persist.",
//   recommendation: null
// }
// ```
