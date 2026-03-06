import http from "http";
import { Server } from "socket.io";
import { Logger } from "./logger";
import { handleMessages } from "../handler/message.handler";

let io: Server;
const logger = Logger.getInstance();

export function initializeSocket(server: http.Server): Server {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("patient-message", (payload, callback) => {
      try {
        payload = typeof payload === "string" ? JSON.parse(payload) : payload;

        if (!payload) {
          return callback({
            type: "ERROR",
            code: "MESSAGE_UNIDENTIFIED",
            message: "message is required",
          });
        }

        if (!payload.type) {
          return callback({
            type: "ERROR",
            code: "TYPE_UNIDENTIFIED",
            message: "every message must include a type field",
          });
        }

        if (!socket.data.userId || !socket.data.role) {
          return callback({
            type: "ERROR",
            code: "NOT_AUTHENTICATED",
            message: "Authenticate before sending patient messages.",
          });
        }

        handleMessages(socket.data.userId, socket, socket.id, payload).catch(
          (err: Error) => {
            logger.info(`Pipeline error: ${err.message}`);
            socket.emit("TRIAGE_RESPONSE", {
              type: "ERROR",
              content: err.message,
            });
          },
        );

        callback({ type: "ACK", message: "Message received" });
      } catch (error) {
        callback({
          type: "ERROR",
          code: "INTERNAL_ERROR",
          message: "Invalid server response",
        });
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}
