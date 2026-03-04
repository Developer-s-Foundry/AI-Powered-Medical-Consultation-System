import { Router } from "express";
import { Request, Response } from "express";
import { ResponseFormatter } from "../utils/response";
import sequelize from "../config/database";
import redisConnection from "../config/redis";

const router = Router();

/**
 * Basic health check
 * GET /health
 */
router.get("/", async (_req: Request, res: Response) => {
  res.json(
    ResponseFormatter.success({
      status: "healthy",
      service: "user-profile-service",
      timestamp: new Date().toISOString(),
    }),
  );
});

/**
 * Detailed health check
 * GET /health/detailed
 */
router.get("/detailed", async (_req: Request, res: Response) => {
  const health: any = {
    status: "healthy",
    service: "user-profile-service",
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Database check
  try {
    // const sequelize = (await import("../config/database")).default;
    await sequelize.authenticate();
    health.checks.database = { status: "up", message: "Connected" };
  } catch (error: any) {
    health.checks.database = { status: "down", message: error.message };
    health.status = "unhealthy";
  }

  // Redis check
  try {
    await redisConnection.ping();
    health.checks.redis = { status: "up", message: "Connected" };
  } catch (error: any) {
    health.checks.redis = { status: "down", message: error.message };
    health.status = "degraded";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;

  res.status(statusCode).json(ResponseFormatter.success(health));
});

/**
 * Readiness check (for Kubernetes)
 * GET /health/ready
 */
router.get("/ready", async (_req: Request, res: Response) => {
  try {
    // const sequelize = (await import("../config/database")).default;
    await sequelize.authenticate();

    res.json(ResponseFormatter.success({ ready: true }));
  } catch (error) {
    res
      .status(503)
      .json(
        ResponseFormatter.error("Service not ready", "Database unavailable"),
      );
  }
});

/**
 * Liveness check (for Kubernetes)
 * GET /health/live
 */
router.get("/live", (_req: Request, res: Response) => {
  res.json(ResponseFormatter.success({ alive: true }));
});

export default router;
