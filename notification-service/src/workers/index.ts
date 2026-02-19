import emailWorker from "./emailWorker";
import smsWorker from "./smsWorker";
import logger from "../utils/logger";

export class WorkerManager {
  /**
   * Start all workers
   */
  static async startAll(): Promise<void> {
    logger.info("Starting all workers...");
    // Workers are initialized on import
    logger.info("All workers started");
  }

  /**
   * Shutdown all workers gracefully
   */
  static async shutdownAll(): Promise<void> {
    logger.info("Shutting down all workers...");
    await Promise.all([emailWorker.shutdown(), smsWorker.shutdown()]);
    logger.info("All workers shut down");
  }
}

export { emailWorker, smsWorker };
export default WorkerManager;
