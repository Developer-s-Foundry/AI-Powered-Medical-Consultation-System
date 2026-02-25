import { Request, Response, NextFunction } from "express";
import logger from "./logger";
import { ResponseFormatter } from "./response";

/**
 * Custom Application Error
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let error = err.message;

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Sequelize errors
  if (err.name === "SequelizeValidationError") {
    statusCode = 400;
    message = "Validation Error";
    error =
      (err as any).errors?.map((e: any) => e.message).join(", ") || err.message;
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 409;
    message = "Duplicate Entry";
    error = "A record with this data already exists";
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = "Invalid Reference";
    error = "Referenced record does not exist";
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid Token";
    error = "Authentication token is invalid";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token Expired";
    error = "Authentication token has expired";
  }

  // Log error
  if (statusCode >= 500) {
    logger.error("Server Error:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn("Client Error:", {
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      statusCode,
    });
  }

  // Send response
  res.status(statusCode).json(ResponseFormatter.error(error, message));
};

/**
 * Async handler wrapper to catch async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res
    .status(404)
    .json(
      ResponseFormatter.error(
        "Route not found",
        `The endpoint ${req.method} ${req.originalUrl} does not exist`,
      ),
    );
};
