import "dotenv/config";
import AppDataSource from "../config/database";
import { SymptomCode } from "../model/entities/symptom_code";

const symptoms = [
  // HIGH risk
  {
    code: "SYM-001",
    icd10_ref: "R07.9",
    description: "Chest pain",
    default_weight: "9.50",
    severity_class: "HIGH",
  },
  {
    code: "SYM-002",
    icd10_ref: "R06.0",
    description: "Difficulty breathing / shortness of breath",
    default_weight: "9.00",
    severity_class: "HIGH",
  },
  {
    code: "SYM-003",
    icd10_ref: "R55",
    description: "Fainting / loss of consciousness",
    default_weight: "9.00",
    severity_class: "HIGH",
  },
  {
    code: "SYM-004",
    icd10_ref: "R56.9",
    description: "Seizure",
    default_weight: "9.50",
    severity_class: "HIGH",
  },
  {
    code: "SYM-005",
    icd10_ref: "I64",
    description: "Sudden weakness or numbness on one side of the body",
    default_weight: "9.50",
    severity_class: "HIGH",
  },
  {
    code: "SYM-006",
    icd10_ref: "R47.0",
    description: "Sudden confusion or slurred speech",
    default_weight: "9.00",
    severity_class: "HIGH",
  },
  {
    code: "SYM-007",
    icd10_ref: "R04.2",
    description: "Coughing up blood",
    default_weight: "9.00",
    severity_class: "HIGH",
  },
  {
    code: "SYM-008",
    icd10_ref: "K92.1",
    description: "Vomiting blood",
    default_weight: "9.50",
    severity_class: "HIGH",
  },
  {
    code: "SYM-009",
    icd10_ref: "R57.9",
    description: "Severe allergic reaction / anaphylaxis",
    default_weight: "9.50",
    severity_class: "HIGH",
  },
  {
    code: "SYM-010",
    icd10_ref: "R41.3",
    description: "Sudden severe headache (worst of life)",
    default_weight: "9.00",
    severity_class: "HIGH",
  },
  // MEDIUM risk
  {
    code: "SYM-011",
    icd10_ref: "R51",
    description: "Headache",
    default_weight: "5.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-012",
    icd10_ref: "R50.9",
    description: "Fever (above 38C / 100.4F)",
    default_weight: "6.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-013",
    icd10_ref: "R10.9",
    description: "Abdominal pain",
    default_weight: "6.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-014",
    icd10_ref: "R11",
    description: "Nausea and vomiting",
    default_weight: "5.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-015",
    icd10_ref: "R19.7",
    description: "Diarrhoea",
    default_weight: "4.50",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-016",
    icd10_ref: "R05",
    description: "Persistent cough",
    default_weight: "5.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-017",
    icd10_ref: "R00.0",
    description: "Rapid or irregular heartbeat / palpitations",
    default_weight: "6.50",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-018",
    icd10_ref: "R60.0",
    description: "Swelling of limbs / oedema",
    default_weight: "5.50",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-019",
    icd10_ref: "R20.2",
    description: "Numbness or tingling in hands or feet",
    default_weight: "5.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-020",
    icd10_ref: "R31",
    description: "Blood in urine",
    default_weight: "7.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-021",
    icd10_ref: "R30.0",
    description: "Painful urination / dysuria",
    default_weight: "5.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-022",
    icd10_ref: "M54.5",
    description: "Lower back pain",
    default_weight: "4.50",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-023",
    icd10_ref: "R42",
    description: "Dizziness or vertigo",
    default_weight: "5.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-024",
    icd10_ref: "R63.0",
    description: "Loss of appetite",
    default_weight: "4.00",
    severity_class: "MEDIUM",
  },
  {
    code: "SYM-025",
    icd10_ref: "R61",
    description: "Excessive sweating / night sweats",
    default_weight: "4.50",
    severity_class: "MEDIUM",
  },
  // LOW risk
  {
    code: "SYM-026",
    icd10_ref: "J00",
    description: "Common cold / runny nose",
    default_weight: "2.00",
    severity_class: "LOW",
  },
  {
    code: "SYM-027",
    icd10_ref: "R68.0",
    description: "Mild sore throat",
    default_weight: "2.00",
    severity_class: "LOW",
  },
  {
    code: "SYM-028",
    icd10_ref: "R53",
    description: "Fatigue / tiredness",
    default_weight: "2.50",
    severity_class: "LOW",
  },
  {
    code: "SYM-029",
    icd10_ref: "M79.3",
    description: "Mild muscle aches and pains",
    default_weight: "2.00",
    severity_class: "LOW",
  },
  {
    code: "SYM-030",
    icd10_ref: "L29.9",
    description: "Skin itching / mild rash",
    default_weight: "2.00",
    severity_class: "LOW",
  },
  {
    code: "SYM-031",
    icd10_ref: "H10.9",
    description: "Red or itchy eyes",
    default_weight: "2.00",
    severity_class: "LOW",
  },
  {
    code: "SYM-032",
    icd10_ref: "R21",
    description: "Mild rash without fever",
    default_weight: "2.50",
    severity_class: "LOW",
  },
  {
    code: "SYM-033",
    icd10_ref: "K30",
    description: "Indigestion / bloating",
    default_weight: "2.00",
    severity_class: "LOW",
  },
  {
    code: "SYM-034",
    icd10_ref: "R05",
    description: "Mild cough / throat irritation",
    default_weight: "2.00",
    severity_class: "LOW",
  },
  {
    code: "SYM-035",
    icd10_ref: "G43.9",
    description: "Mild recurring headache / tension headache",
    default_weight: "2.50",
    severity_class: "LOW",
  },
];

async function seed() {
  await AppDataSource.initialize();
  console.log("Database connected.");
  const repo = AppDataSource.getRepository(SymptomCode);
  for (const s of symptoms) {
    const exists = await repo.findOne({ where: { code: s.code } });
    if (!exists) {
      const entity = repo.create(s);
      await repo.save(entity);
      console.log(`Seeded: ${s.code} — ${s.description}`);
    } else {
      console.log(`Skipped (exists): ${s.code}`);
    }
  }
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
