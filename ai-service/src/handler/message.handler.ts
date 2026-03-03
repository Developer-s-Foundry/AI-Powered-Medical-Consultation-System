import { patientPayload } from "../types/types.interface";
import { MessageDirection, MessageType } from "../types/enum.types";
import { AIPipelineService } from "../model/service/ai_pipeline_service";
import { SessionService } from "../model/service/session_service";
import { MessageService } from "../model/service/message_service";
import { Server } from "socket.io";


/**
 * Central message router.
 * Every message the client sends comes through here.
 *
 * Supported types:
 *   PATIENT_MESSAGE: patient sends a symptom message
 *   AI_RESPONSE: AI responds with a medical advice and a disclaimer
 *   BOOKING_REQUEST → patient accepts a doctor recommendation
 */


export const handleMessages = async (userId: string, socket: Server, socketId: string,
    payload: patientPayload ) => {
    switch (payload.type) {

        case MessageType.PATIENT_MESSAGE: {
            await handlePatientMessage(userId, socket, socketId, payload);
        }
            break;

        case MessageType.BOOKING: {
            // handle booking
        }
            break;
    
        default:
            break;
    }
}



async function handlePatientMessage (userId: string, socket: Server, socketId: string,  payload: patientPayload) {
    const sessionService = new SessionService();
    const messageService = new MessageService()
    const aiPipeline = new AIPipelineService()
    // create a session
    const newSession = await sessionService.createSession({patientId:userId})
    
    // create a message
    const newMessage = await messageService.saveMessage({sessionId: newSession.id, patientId: userId, content: payload.content, direction: MessageDirection.IN})

    // pass params into AIpipeline
    await aiPipeline.processThroughAIPipeline({messageId: newMessage.id, sessionId: newSession.id, patientId:userId, content: payload.content, socket, socketId})

}