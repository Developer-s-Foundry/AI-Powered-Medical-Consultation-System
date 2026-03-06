import AppDataSource from "../../config/database";
import { SymptomCode } from "../entities/symptom_code";
import { RawAIResponse } from "../../types/types.interface";
import { config } from "../../config/env.config";
import { GoogleGenAI } from "@google/genai";
import { Logger } from "../../config/logger";




const CONFIDENCE_THRESHOLD = 0.4;


/**
 * Fetches all active symptom codes from the DB and formats them
 * into the system prompt so the AI can map patient language to codes.
 */
export class AIService {
  private dataSource: typeof AppDataSource;
  private ai = new GoogleGenAI({apiKey: config.GEMINI_API_KEY});
  private logger = Logger.getInstance()

  constructor() {
    this.dataSource = AppDataSource;
  }

  private get repository() {
    
    return this.dataSource.getRepository(SymptomCode);
  }

  /**
   * Build system prompt from DB symptom codes
   */
  async buildSystemPrompt(): Promise<string> {
    const codes = await this.repository.find({
      order: {
        severity_class: "DESC",
        default_weight: "DESC",
      },
    });

    const codeList = codes
      .map(
        (c) =>
          `${c.code} | ${c.description} | ICD-10: ${
            c.icd10_ref ?? "N/A"
          } | severity: ${c.severity_class} | weight: ${c.default_weight}`
      )
      .join("\n");

    return `You are a medical triage assistant...
SYMPTOM CODE REFERENCE LIST:
${codeList}

INSTRUCTIONS:
1. Read the patient message carefully.
2. Map what the patient describes to the closest matching codes from the list above.
3. Assign a confidence score (0.000–1.000) to each matched code:
   - 1.000 = patient explicitly and clearly stated this symptom
   - 0.700 = patient implied it or described it vaguely
   - 0.400 = you are reading between the lines
   - Below 0.400 = do not include — too uncertain
4. Assess overall risk level:
   - HIGH   = patient needs immediate medical attention (chest pain, difficulty breathing, severe pain, signs of emergency)
   - MEDIUM = symptoms are notable and should be monitored; a doctor visit may be needed
   - LOW    = minor symptoms that can be managed with rest and self-care
5. Write clear, calm advice appropriate for the assessed risk level.
   - HIGH:   Do NOT give self-treatment advice. Tell the patient to seek immediate care.
   - MEDIUM: Give monitoring advice and recommend seeing a doctor if symptoms persist or worsen.
   - LOW:    Give practical self-care advice only. No clinical diagnosis language.

IMPORTANT RULES:
- Only use codes from the reference list above. Never invent codes.
- Do not make a definitive diagnosis.
- Do not mention specific drug dosages.
- Return ONLY valid JSON — no preamble, no markdown, no explanation outside the JSON.

REQUIRED JSON FORMAT:
{
  "risk_level": "HIGH" | "MEDIUM" | "LOW",
  "symptom_codes": [
    { "code": "SYM-XXX", "confidence": 0.000 }
  ],
  "advice": "Your advice to the patient here."
};

(Return ONLY valid JSON in required format.)`;
  }

  /**
   * Call Gemini
   */
  async callAI(patientMessage: string): Promise<RawAIResponse> {

    const systemPrompt = await this.buildSystemPrompt();

      const response = await this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: patientMessage,
          config: {
            responseMimeType: "application/json",
            systemInstruction: systemPrompt,
          },
        });
        console.log(response.text);

    if (!response.text) {
      this.logger.warn('Gemini API error')
      throw new Error(
        `Gemini API error`
      );
    }

    const cleaned = response.text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsed: RawAIResponse;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(
        `AI returned non-JSON response: ${response.text.slice(0, 200)}`
      );
    }

    return parsed;
  }

  /**
   * Validate AI response against DB and schema
   */
  async validateAIResponse(
    aiResponse: RawAIResponse
  ): Promise<{
    valid: boolean;
    errors: string[];
    filtered: RawAIResponse | null;
  }> {
    const errors: string[] = [];

    if (!["HIGH", "MEDIUM", "LOW"].includes(aiResponse.risk_level)) {
      errors.push(`Invalid risk_level: ${aiResponse.risk_level}`);
    }

    if (!Array.isArray(aiResponse.symptom_codes)) {
      errors.push("symptom_codes must be an array");
    }

    if (!aiResponse.advice?.trim()) {
      errors.push("advice must be a non-empty string");
    }

    if (errors.length > 0) {
      return { valid: false, errors, filtered: null };
    }

    // Fetch valid codes
    const dbCodes = await this.repository.find({
      select: ["code"],
    });

    const validCodes = new Set(dbCodes.map((r) => r.code));

    const filteredCodes = aiResponse.symptom_codes.filter(
      (item) => {
        if (item.confidence < CONFIDENCE_THRESHOLD) {
          return false;
        }
        if (!validCodes.has(item.code)) {
          return false;
        }
        return true;
      }
    );

    return {
      valid: true,
      errors: [],
      filtered: {
        risk_level: aiResponse.risk_level,
        symptom_codes: filteredCodes,
        advice: aiResponse.advice.trim(),
      },
    };
  }
}