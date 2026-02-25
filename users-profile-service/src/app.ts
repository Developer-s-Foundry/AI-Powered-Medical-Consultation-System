import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { errorHandler } from "./utils/errorHandler";
import { ResponseFormatter } from "./utils/response";
import logger from "./utils/logger";
import config from "./config";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: config.app.clientUrl || "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    );

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Request logging
    if (config.app.env === "development") {
      this.app.use(morgan("dev"));
    } else {
      this.app.use(morgan("combined"));
    }

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later",
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => {
        res
          .status(429)
          .json(
            ResponseFormatter.error(
              "Too many requests",
              "Rate limit exceeded. Please try again later.",
            ),
          );
      },
    });

    // Apply rate limiting to API routes only
    this.app.use("/api/", limiter);

    // Request ID middleware (for tracking)
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      req.headers["x-request-id"] =
        req.headers["x-request-id"] ||
        `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      next();
    });

    logger.info("Middleware configured");
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Welcome route
    this.app.get("/", (_req: Request, res: Response) => {
      res.json(
        ResponseFormatter.success({
          service: config.app.name,
          version: "1.0.0",
          environment: config.app.env,
          timestamp: new Date().toISOString(),
          endpoints: {
            health: "/health",
            api: "/api",
            docs: "/api",
          },
        }),
      );
    });

    // API routes
    this.app.use("/api", routes);

    // 404 handler - must be after all routes
    this.app.use((req: Request, res: Response) => {
      res
        .status(404)
        .json(
          ResponseFormatter.error(
            "Route not found",
            `The endpoint ${req.method} ${req.originalUrl} does not exist`,
          ),
        );
    });

    logger.info(" Routes configured");
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // Global error handler - must be last
    this.app.use(errorHandler);

    logger.info("Error handling configured");
  }
}

export default new App().app;
