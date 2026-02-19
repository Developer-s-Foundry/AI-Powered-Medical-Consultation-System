import twilio, { Twilio } from "twilio";
import logger from "../utils/logger";

let twilioClient: Twilio | null = null;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
  logger.info(" Twilio SMS configured");
} else {
  logger.warn(" Twilio SMS not configured (optional)");
}

export default twilioClient;
export const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
