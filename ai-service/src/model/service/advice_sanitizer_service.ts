import { ReplacementRule } from "../../types/types.interface";

/**
 * Advice Sanitizer
 *
 * For LOW risk responses, the AI advice is shown but must be sanitized
 * before delivery to the patient.
 *
 * The sanitizer works in two passes:
 *   1. Pattern replacement (regex-based)
 *   2. Sentence filtering
 */


// ─────────────────────────────────────────────────────────────
// Replacement Rules
// ─────────────────────────────────────────────────────────────

const REPLACEMENT_RULES: ReplacementRule[] = [
  // Drug dosage patterns (e.g. "500mg", "2 tablets")
  {
    pattern: /\b\d+\s*(mg|ml|mcg|g|tablets?|capsules?|doses?)\b/gi,
    replacement: "",
  },

  // Specific drug names
  {
    pattern:
      /\b(paracetamol|ibuprofen|aspirin|metformin|insulin|panadol|amoxicillin|lisinopril|atorvastatin|omeprazole)\b/gi,
    replacement: "over-the-counter medication (consult a pharmacist)",
  },

  // Diagnosis-adjacent phrases
  {
    pattern:
      /\b(you (may|might|could) have|this (could|may) be|signs of|symptoms of|indicative of|consistent with)\b/gi,
    replacement: "your symptoms suggest",
  },

  // Urgent escalation language (remove strong emergency phrasing)
  {
    pattern:
      /\b(immediately|emergency|urgent(ly)?|call (an )?ambulance|go to (the )?(ER|emergency room|A&E)|dial 999|dial 911)\b/gi,
    replacement: "see a doctor if symptoms persist",
  },

  // Confident diagnostic statements
  {
    pattern: /\b(you (have|are suffering from|are diagnosed with))\b/gi,
    replacement: "you may be experiencing",
  },
];

// ─────────────────────────────────────────────────────────────
// Sentence-level Block Patterns
// ─────────────────────────────────────────────────────────────

const SENTENCE_BLOCK_PATTERNS: RegExp[] = [
  /seek immediate/i,
  /call emergency/i,
  /this is (a )?medical emergency/i,
  /life[- ]threatening/i,
  /do not delay/i,
  /requires? (immediate|urgent) (medical )?(attention|care|treatment)/i,
];

// ─────────────────────────────────────────────────────────────
// Sanitizer Function
// ─────────────────────────────────────────────────────────────

/**
 * Sanitizes AI advice text for LOW risk delivery.
 *
 * @param rawAdvice - Original AI-generated advice
 * @returns Sanitized advice safe for LOW risk display
 */
export function sanitizeAdvice(rawAdvice: string): string {
  if (!rawAdvice || typeof rawAdvice !== "string") {
    return "";
  }

  // Apply replacement rules
  let sanitized: string = rawAdvice;

  for (const rule of REPLACEMENT_RULES) {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  }

  // Split into sentences and filter blocked ones
  const sentences: string[] = sanitized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const safeSentences: string[] = sentences.filter((sentence) => {
    const isBlocked: boolean = SENTENCE_BLOCK_PATTERNS.some((pattern) =>
      pattern.test(sentence)
    );

    if (isBlocked) {
      console.log(
        `✂ Sanitizer removed sentence: "${sentence.slice(0, 60)}..."`
      );
    }

    return !isBlocked;
  });

  // 3️⃣ Clean up spacing
  let result: string = safeSentences
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // 4️⃣ Append LOW risk footer (only if there's content)
  if (result.length > 0) {
    result +=
      " If your symptoms persist for more than 24 hours or worsen at any point, please consult a healthcare professional.";
  }

  return result;
}