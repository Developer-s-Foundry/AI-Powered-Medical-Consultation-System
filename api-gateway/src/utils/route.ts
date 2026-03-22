const AI_SERVICE = process.env.AI_SERVICE_URL || "http://localhost:3001";
const PAYMENT_SERVICE =
  process.env.PAYMENT_SERVICE_URL || "http://localhost:3002";
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || "http://localhost:3004";
const NOTIFICATION_SERVICE =
  process.env.NOTIFICATION_SERVICE_URL || "http://localhost:2002";
const DRUG_SERVICE = process.env.DRUG_SERVICE_URL || "http://localhost:2012";
const PROFILE_SERVICE =
  process.env.PROFILE_SERVICE_URL || "http://localhost:3007";

export const routingParts = [
  { upstream: AI_SERVICE, pattern: "/api/v1/ai/*", prefix: "" },
  { upstream: PAYMENT_SERVICE, pattern: "/api/v1/payments/*", prefix: "" },
  { upstream: AUTH_SERVICE, pattern: "/api/v1/auth/*", prefix: "" },
  {
    upstream: NOTIFICATION_SERVICE,
    pattern: "/api/v1/notifications/*",
    prefix: "/api/v1/notifications",
  },
  { upstream: DRUG_SERVICE, pattern: "/api/v1/drugs/*", prefix: "/api/drugs" },
  { upstream: PROFILE_SERVICE, pattern: "/api/v1/profiles/*", prefix: "/api" },
  {
    upstream: DRUG_SERVICE,
    pattern: "/api/v1/prescription/*",
    prefix: "/api/prescription",
  },
  { upstream: DRUG_SERVICE, pattern: "/api/v1/pharm/*", prefix: "/api/pharm" },
];

export const authPublicRoutes = [
  "/api/v1/auth/users/login",
  "/api/v1/auth/users/register",
  "/api/v1/auth/users/reset-password",
  "/api/v1/auth/users/forgot-password",
  "/api/v1/profiles/doctors/specialty",
];
