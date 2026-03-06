
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
      recId: string,
      recType: string | null,
      reason: string,
      doctor: {
        doctorId: string,
        firstName: string,
        lastName: string,
        specialty: string,
        hospitalName: string,
        address: string,
        availableDays: WeeklySchedule
      },
}

export interface AppointmentParams {
  patientId: string
  doctorId: string
  sessionId: string
  availableDays: WeeklySchedule
  reason: string
}

export interface DaySchedule {
  isAvailable: boolean,
  startTime: string,
  endTime: string
}

export type WeeklySchedule = Record<string, DaySchedule>;

type Doctor = {
  id?: string;
  firstName?: string;
  lastName?: string;
};

export interface AppointmentType {
  id: string
  date: string;
  time: string;
  reason: string;
  type: string;
  status: string;
  doctor: Doctor
};


export interface doctorsData{
  userId: string
  firstName: string
  lastName: string
}
