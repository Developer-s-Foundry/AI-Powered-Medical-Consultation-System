
import { Session} from "../entities/session";
import { SessionStatus } from "../../types/enum.types";
import AppDataSource from "../../config/database";


export class SessionService {

  private dataSource: typeof AppDataSource
  constructor() {
    this.dataSource = AppDataSource;
  }

  private get repository() {
    return this.dataSource.getRepository(Session);
  }

  /**
   * Create session
   */
  async createSession(options: {
    patientId: string;
    channel: string;
  }): Promise<Session> {
    const session = this.repository.create({
      patient_id: options.patientId,
      session_status: SessionStatus.OPEN,
    });

    return await this.repository.save(session);
  }

  /**
   * Close session
   */
  async closeSession(sessionId: string): Promise<void> {
    await this.repository.update(sessionId, {
      session_status: SessionStatus.CLOSED,
      ended_at: new Date(),
    });
  }

  /**
   * Set final risk level
   */
  async setFinalRiskLevel(
    sessionId: string,
    riskLevel: string
  ): Promise<void> {
    await this.repository.update(sessionId, {
      final_risk_level: riskLevel,
    });
  }

  /**
   * Get open session
   */
  async getSession(sessionId: string): Promise<Session | null> {
    return await this.repository.findOne({
      where: {
        id: sessionId,
        session_status: SessionStatus.OPEN,
      },
    });
  }
}