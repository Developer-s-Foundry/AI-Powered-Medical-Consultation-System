export const routingParts = [
  { upstream: "http://localhost:3001", pattern: "/api/v1/ai/*", prefix: "" },
  {
    upstream: "http://localhost:3002",
    pattern: "/api/v1/payments/*",
    prefix: "",
  },
  { upstream: "http://localhost:3004", pattern: "/api/v1/auth/*", prefix: "" },
  {
    upstream: "http://localhost:2002",
    pattern: "/api/v1/notifications/*",
    prefix: "",
  },
  {
    upstream: "http://localhost:2012",
    pattern: "/api/v1/drugs/*",
    prefix: "/api/drugs",
  },
  {
    upstream: "http://localhost:3007",
    pattern: "/api/v1/profiles/*",
    prefix: "/api",
  },
  {
    upstream: "http://localhost:2012",
    pattern: "/api/v1/prescription/*",
    prefix: "/api/prescription",
  },
  {
    upstream: "http://localhost:2012",
    pattern: "/api/v1/pharm/*",
    prefix: "/api/pharm",
  },
];
export const authPublicRoutes = [
  "/api/v1/auth/users/login",
  "/api/v1/auth/users/register",
  "/api/v1/auth/users/reset-password",
  "/api/v1/auth/users/forgot-password",
];
