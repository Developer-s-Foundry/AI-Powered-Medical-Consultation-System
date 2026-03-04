import jwt from "jsonwebtoken";
import config from "../config";
import { v4 as uuidv4 } from "uuid";

// Test users
const testUsers = {
  patient: {
    userId: uuidv4(),
    email: "patient@test.com",
    role: "patient",
  },
  doctor: {
    userId: uuidv4(),
    email: "doctor@test.com",
    role: "doctor",
  },
  pharmacy: {
    userId: uuidv4(),
    email: "pharmacy@test.com",
    role: "pharmacy",
  },
};

console.log("\n===========================================");
console.log(" DRUGS SERVICE - TEST JWT TOKENS");
console.log("===========================================\n");

// Generate tokens for all roles
Object.entries(testUsers).forEach(([role, userData]) => {
  const token = jwt.sign(userData, config.jwt.secret, {
    expiresIn: "7d",
  });

  console.log(` ${role.toUpperCase()} TOKEN:`);
  console.log("─────────────────────────────────────────");
  console.log(`User ID: ${userData.userId}`);
  console.log(`Email:   ${userData.email}`);
  console.log(`Role:    ${userData.role}`);
  console.log("\nToken:");
  console.log(token);
  console.log("\nAuthorization Header:");
  console.log(`Bearer ${token}`);
  console.log("\n");
});

console.log("===========================================");
console.log("USAGE TIPS:");
console.log("===========================================");
console.log("1. Use PHARMACY token for: POST /api/drugs/create");
console.log("2. Use DOCTOR token for: POST /api/pharm/prescription/create");
console.log("3. Use PATIENT token for: GET /api/prescription/view");
console.log("4. No token needed for: GET /api/drugs/search");
console.log("\n===========================================\n");
