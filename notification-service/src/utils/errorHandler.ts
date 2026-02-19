import { Request, Response, NextFunction } from "express";
import logger from "./logger";
import { ResponseFormatter } from "./response";

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

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error("Error:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(ResponseFormatter.error(err.message));
    return;
  }

  // Default error
  res.status(500).json(ResponseFormatter.error("Internal server error"));
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
