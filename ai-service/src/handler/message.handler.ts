import { patientPayload } from "../types/types.interface";
import { MessageType } from "../types/enum.types";


/**
 * Central message router.
 * Every message the client sends comes through here.
 *
 * Supported types:
 *   IDENTIFY: patient introduces themselves, session is created
 *   PATIENT_MESSAGE: patient sends a symptom message
 *   AI_RESPONSE: AI responds with a medical advice and a disclaimer
 *   BOOKING_REQUEST → patient accepts a doctor recommendation
 */


export const handleSocketMessages = async (payload: patientPayload ) => {
    switch (payload.type) {

        case MessageType.PATIENT_MESSAGE: {

        }
            
            break;
    
        default:
            break;
    }
}



function handlePatientMessage () {
    
}