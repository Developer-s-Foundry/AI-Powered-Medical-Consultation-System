import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { AppError } from "../custom.functions.ts/error";
import { config } from "../config/env.config";

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new AppError("Unauthorized", 401));
  }

  try {
    const payload: any = jwt.verify(token, config.SOCKET_JWT_SECRET);

    // Attach verified identity to socket session
    socket.data.userId = payload.userId;
    socket.data.role = payload.role;

    next();
  } catch (err) {
    next(new AppError("Invalid token", 401));
  }
}
