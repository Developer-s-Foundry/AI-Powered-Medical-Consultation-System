import AppDataSource from "../../config/database";
import { Message} from "../entities/messages";
import { MessageDirection } from "../../types/enum.types";

export class MessageService {
  private dataSource: typeof AppDataSource;
  constructor() {
    this.dataSource = AppDataSource;
  }

  private get repository() {
    return this.dataSource.getRepository(Message);
  }

  /**
   * Save a message
   */
  async saveMessage(options: {
    sessionId: string;
    patientId: string;
    content: string;
    direction: MessageDirection;
    isSanitized?: boolean;
  }): Promise<Message> {
    const message = this.repository.create({
      session: {id: options.sessionId},
      patient_id: options.patientId,
      content: options.content,
      direction: options.direction,
      is_sanitized: options.isSanitized ?? false,
    });

    return await this.repository.save(message);
  }
}

