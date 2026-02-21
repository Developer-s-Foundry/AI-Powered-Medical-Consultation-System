import { Request } from "express";
import { AppError } from "./errorHandler";

/**
 * Get authenticated user ID from request
 */
export const getUserId = (req: Request): string => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  if (typeof userId !== "string") {
    throw new AppError("Invalid user ID format", 400);
  }

  return userId;
};

/**
 * Get authenticated user from request
 */
export const getAuthUser = (req: Request) => {
  if (!req.user) {
    throw new AppError("User not authenticated", 401);
  }

  return {
    userId: req.user.userId as string,
    email: req.user.email as string,
    role: req.user.role as string,
  };
};
