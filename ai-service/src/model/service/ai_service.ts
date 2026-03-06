import AppDataSource from "../../config/database";
import { SymptomCode } from "../entities/symptom_code";
import { RawAIResponse } from "../../types/types.interface";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const CONFIDENCE_THRESHOLD = 0.4;

/**
 * Fetches all active symptom codes from the DB and formats them
 * into the system prompt so the AI can map patient language to codes.
 */
export class AIService {
  private dataSource: typeof AppDataSource;
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
          } | severity: ${c.severity_class} | weight: ${c.default_weight}`,
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
   * Call Anthropic API
   */
  async callAI(patientMessage: string): Promise<RawAIResponse> {
    const systemPrompt = await this.buildSystemPrompt();
    console.log("Calling Anthropic API...");

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: patientMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${errText}`);
    }

    const data = await response.json();

    const rawText = data.content
      .filter((block: any) => block.type === "text")
      .map((block: any) => block.text)
      .join("");

    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsed: RawAIResponse;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(
        `AI returned non-JSON response: ${rawText.slice(0, 200)}`,
      );
    }

    return parsed;
  }

  /**
   * Validate AI response against DB and schema
   */
  async validateAIResponse(aiResponse: RawAIResponse): Promise<{
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

    const filteredCodes = aiResponse.symptom_codes.filter((item) => {
      if (item.confidence < CONFIDENCE_THRESHOLD) {
        return false;
      }
      if (!validCodes.has(item.code)) {
        return false;
      }
      return true;
    });

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
