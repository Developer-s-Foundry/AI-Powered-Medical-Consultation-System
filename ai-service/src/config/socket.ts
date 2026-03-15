import http from "http";
import { Server } from "socket.io";
import { handleMessages } from "../handler/message.handler";

let io: Server;

export function initializeSocket(server: http.Server): Server {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("patient-message", async (payload, callback) => {
      if (!payload) {
        return callback({
          type: "ERROR",
          code: "MESSAGE_UNIDENTIFIED",
          message: "message is required",
        });
      }

      let parsedData: any;
      try {
        parsedData =
          typeof payload === "string" ? JSON.parse(payload) : payload;
      } catch (error) {
        return callback({
          type: "ERROR",
          code: "INVALID_JSON",
          message: "message is an invalid json",
        });
      }

      if (!parsedData.type) {
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

      try {
        await handleMessages(socket.data.userId, io, socket.id, parsedData);
      } catch (error) {
        return callback({
          type: "ERROR",
          code: "SERVER_ERROR",
          message: "An internal error occurred. Please try again.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}
