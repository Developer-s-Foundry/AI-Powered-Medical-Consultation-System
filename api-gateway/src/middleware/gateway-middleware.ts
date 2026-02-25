import { authPublicRoutes, routingParts } from "../utils/route";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../custom-error/error";
import jwt from "jsonwebtoken";
import { matchRoute, processHeader, forwardRequest } from "../utils/utils";

export const apiMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pathname = req.path;
    const routePart = matchRoute(pathname, routingParts);
    if (!routePart) throw new AppError("Resource not found", 404);

    const targetUrl = `${routePart.host}${req.originalUrl}`;
    const headers = processHeader(req);

    // --- Public routes (no auth required)
    const isPublic = authPublicRoutes.some((route) =>
      pathname.startsWith(route),
    );
    if (isPublic) {
      const data = await forwardRequest(
        targetUrl,
        req.method,
        headers,
        req.body,
      );
      return res.status(data.status).json(data.data);
    }

    // --- Protected routes (require JWT)
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(
        token,
        process.env.AUTH_JWT_SECRET as string,
      ) as any;
      headers["x-user-id"] = decoded.userId;
      headers["x-user-role"] = decoded.role;

      const data = await forwardRequest(
        targetUrl,
        req.method,
        headers,
        req.body,
      );
      return res.status(data.status).json(data.data);
    } catch {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  } catch (err: any) {
    next(err);
  }
};
