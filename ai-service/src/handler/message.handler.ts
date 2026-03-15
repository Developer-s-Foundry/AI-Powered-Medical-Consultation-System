import { patientPayload } from "../types/types.interface";
import { MessageDirection, MessageType } from "../types/enum.types";
import { AIPipelineService } from "../model/service/ai_pipeline_service";
import { SessionService } from "../model/service/session_service";
import { MessageService } from "../model/service/message_service";
import { Server } from "socket.io";
import { AppError } from "../custom.functions.ts/error";

/**
 * Central message router.
 * Every message the client sends comes through here.
 *
 * Supported types:
 *   PATIENT_MESSAGE: patient sends a symptom message
 *   AI_RESPONSE: AI responds with a medical advice and a disclaimer
 *   BOOKING_REQUEST → patient accepts a doctor recommendation
 */

export const handleMessages = async (
  userId: string,
  socket: Server,
  socketId: string,
  payload: patientPayload,
) => {
  switch (payload.type) {
    case MessageType.PATIENT_MESSAGE:
      {
        console.log("Handling patient message for userId:", userId);
        await handlePatientMessage(userId, socket, socketId, payload);
      }
      break;

    default: {
      throw new AppError("invalid type", 400);
    }
  }
};

async function handlePatientMessage(
  userId: string,
  socket: Server,
  socketId: string,
  payload: patientPayload,
) {
  const sessionService = new SessionService();
  const messageService = new MessageService();
  const aiPipeline = new AIPipelineService();
  // create a session
  try {
    console.log("1. Creating session...");
    const newSession = await sessionService.createSession({
      patientId: userId,
    });
    console.log("2. Session created:", newSession.id);

    console.log("3. Saving message...");
    const newMessage = await messageService.saveMessage({
      sessionId: newSession.id,
      patientId: userId,
      content: payload.content,
      direction: MessageDirection.IN,
    });
    console.log("4. Message saved:", newMessage.id);

    console.log("5. Starting AI pipeline...");
    await aiPipeline.processThroughAIPipeline({
      messageId: newMessage.id,
      sessionId: newSession.id,
      patientId: userId,
      content: payload.content,
      socket,
      socketId,
    });
    console.log("6. Pipeline complete");
  } catch (error) {
    console.error("handlePatientMessage error:", error);
    throw error;
  }
}
