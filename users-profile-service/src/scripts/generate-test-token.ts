import jwt from "jsonwebtoken";
import config from "../config";
import { v4 as uuidv4 } from "uuid";

// You can modify these test users as needed
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
  admin: {
    userId: uuidv4(),
    email: "admin@test.com",
    role: "admin",
  },
};

console.log("\n===========================================");
console.log("TEST JWT TOKENS GENERATOR");
console.log("===========================================\n");

// Generate tokens for all roles
Object.entries(testUsers).forEach(([role, userData]) => {
  const token = jwt.sign(userData, config.jwt.secret, {
    expiresIn: "7d",
  });

  console.log(`${role.toUpperCase()} TOKEN:`);
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
console.log(" USAGE TIPS:");
console.log("===========================================");
console.log("1. Copy the token for the role you want to test");
console.log("2. Use it in the Authorization header:");
console.log("   Authorization: Bearer <token>");
console.log("3. Tokens expire in 7 days");
console.log("4. Run this script again to generate new tokens");
console.log("\n===========================================\n");
