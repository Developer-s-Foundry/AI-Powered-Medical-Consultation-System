export const routingParts = [
  { upstream: "http://localhost:3001", pattern: "/api/v1/ai/*" },
  { upstream: "http://localhost:3002", pattern: "/api/v1/payments/*" },
  { upstream: "http://localhost:3004", pattern: "/api/v1/auth/*" },
  { upstream: "http://localhost:2002", pattern: "/api/v1/notifications/*" },
  { upstream: "http://localhost:2012", pattern: "/api/v1/drugs/*" },
  { upstream: "http://localhost:3007", pattern: "/api/v1/profiles/*" },
];

export const authPublicRoutes = [
  "/api/v1/auth/user/login",
  "/api/v1/auth/user/create",
  "/api/v1/auth/user/reset-password",
  "/api/v1/auth/user/forgot-password",
];
