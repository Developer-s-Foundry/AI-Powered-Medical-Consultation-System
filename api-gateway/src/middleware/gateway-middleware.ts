import { authPublicRoutes, routingParts } from "../utils/route";
import { Request, Response } from "express";
import { AppError } from "../custom-error/error";
import jwt from "jsonwebtoken";
import { matchRoute, processHeader } from "../utils/utils";
import { forwardRequest } from "../utils/utils";

// extract path and construct new url
export const apiMiddleware = async (req: Request, res: Response) => {
  const pathname = req.path;
  const routePart = matchRoute(pathname, routingParts);
  if (!routePart) {
    throw new AppError("resource not found", 404);
  }
  const serviceName = routePart.path.split("/")[2];
  const targetPath = req.originalUrl.replace(`api/v1/${serviceName}`, "");
  const targetUrl = `${routePart.host}${req.originalUrl}`;

  const headers = processHeader(req);

  // verify if the route is public
  if (authPublicRoutes.includes(pathname)) {
    const data = await forwardRequest(targetUrl, req.method, headers, req.body);
    return res.status(data.status).json(data.data);
  }

  // authenticate user
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.AUTH_JWT_SECRET as string);
    headers["x-user-id"] = (decoded as any).userId;
    headers["x-user-role"] = (decoded as any).role;
    const data = await forwardRequest(targetUrl, req.method, headers, req.body);
    res.status(data.status).json(data.data);
  } catch (error) {
    throw new AppError("invalid token", 403);
  }
};
