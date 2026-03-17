import dotenv from "dotenv";
dotenv.config();
import AppDataSource from "../config/database";
import { SymptomCode } from "../model/entities/symptom_code";

const symptoms = [
  {
    code: "SYM-001",
    description: "Severe headache",
    icd10_ref: "R51",
    severity_class: "HIGH",
    default_weight: "8.0",
  },
  {
    code: "SYM-002",
    description: "Difficulty breathing",
    icd10_ref: "R06.0",
    severity_class: "HIGH",
    default_weight: "9.0",
  },
  {
    code: "SYM-003",
    description: "Chest pain",
    icd10_ref: "R07.9",
    severity_class: "HIGH",
    default_weight: "9.5",
  },
  {
    code: "SYM-004",
    description: "Acute back pain",
    icd10_ref: "M54.5",
    severity_class: "MEDIUM",
    default_weight: "6.0",
  },
  {
    code: "SYM-005",
    description: "Mild cough",
    icd10_ref: "R05",
    severity_class: "LOW",
    default_weight: "2.0",
  },
  {
    code: "SYM-006",
    description: "Fever",
    icd10_ref: "R50.9",
    severity_class: "MEDIUM",
    default_weight: "5.0",
  },
  {
    code: "SYM-007",
    description: "Shortness of breath",
    icd10_ref: "R06.0",
    severity_class: "HIGH",
    default_weight: "9.0",
  },
  {
    code: "SYM-008",
    description: "Nausea",
    icd10_ref: "R11.0",
    severity_class: "LOW",
    default_weight: "3.0",
  },
  {
    code: "SYM-009",
    description: "Vomiting",
    icd10_ref: "R11.1",
    severity_class: "MEDIUM",
    default_weight: "5.0",
  },
  {
    code: "SYM-010",
    description: "Dizziness",
    icd10_ref: "R42",
    severity_class: "MEDIUM",
    default_weight: "5.0",
  },
  {
    code: "SYM-011",
    description: "Fatigue",
    icd10_ref: "R53.83",
    severity_class: "LOW",
    default_weight: "2.0",
  },
  {
    code: "SYM-012",
    description: "Abdominal pain",
    icd10_ref: "R10.9",
    severity_class: "MEDIUM",
    default_weight: "6.0",
  },
  {
    code: "SYM-013",
    description: "Joint pain",
    icd10_ref: "M25.50",
    severity_class: "MEDIUM",
    default_weight: "5.0",
  },
  {
    code: "SYM-014",
    description: "Skin rash",
    icd10_ref: "R21",
    severity_class: "LOW",
    default_weight: "3.0",
  },
  {
    code: "SYM-015",
    description: "Sore throat",
    icd10_ref: "J02.9",
    severity_class: "LOW",
    default_weight: "2.0",
  },
  {
    code: "SYM-016",
    description: "Runny nose",
    icd10_ref: "J34.89",
    severity_class: "LOW",
    default_weight: "1.5",
  },
  {
    code: "SYM-017",
    description: "Loss of consciousness",
    icd10_ref: "R55",
    severity_class: "HIGH",
    default_weight: "10.0",
  },
  {
    code: "SYM-018",
    description: "Palpitations",
    icd10_ref: "R00.2",
    severity_class: "HIGH",
    default_weight: "8.5",
  },
  {
    code: "SYM-019",
    description: "Swelling",
    icd10_ref: "R60.9",
    severity_class: "MEDIUM",
    default_weight: "4.0",
  },
  {
    code: "SYM-020",
    description: "Numbness or tingling",
    icd10_ref: "R20.2",
    severity_class: "MEDIUM",
    default_weight: "5.0",
  },
];
async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(SymptomCode);

  for (const symptom of symptoms) {
    const exists = await repo.findOne({ where: { code: symptom.code } });
    if (!exists) {
      await repo.save(repo.create(symptom));
      console.log(`Seeded: ${symptom.code} - ${symptom.description}`);
    } else {
      console.log(`Already exists: ${symptom.code}`);
    }
  }

  console.log("Seeding complete.");
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
