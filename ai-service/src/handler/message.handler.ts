import { patientPayload } from "../types/types.interface";
import { MessageDirection, MessageType } from "../types/enum.types";
import { AIPipelineService } from "../model/service/ai_pipeline_service";
import { SessionService } from "../model/service/session_service";
import { MessageService } from "../model/service/message_service";
import { Socket } from "socket.io"; // ← changed from Server
import { AppError } from "../custom.functions.ts/error";

export const handleMessages = async (
  userId: string,
  socket: Socket,
  socketId: string,
  payload: patientPayload,
) => {
  switch (payload.type) {
    case MessageType.PATIENT_MESSAGE:
      {
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
  socket: Socket, // ← changed from Server
  socketId: string,
  payload: patientPayload,
) {
  const sessionService = new SessionService();
  const messageService = new MessageService();
  const aiPipeline = new AIPipelineService();

  const newSession = await sessionService.createSession({ patientId: userId });
  const newMessage = await messageService.saveMessage({
    sessionId: newSession.id,
    patientId: userId,
    content: payload.content,
    direction: MessageDirection.IN,
  });

  await aiPipeline.processThroughAIPipeline({
    messageId: newMessage.id,
    sessionId: newSession.id,
    patientId: userId,
    content: payload.content,
    socket,
    socketId,
  });
}
