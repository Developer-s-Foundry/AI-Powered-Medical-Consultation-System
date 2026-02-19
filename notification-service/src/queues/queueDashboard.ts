import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import emailQueue from "./emailQueue";
import smsQueue from "./smsQueue";
import logger from "../utils/logger";

// Create Express adapter for Bull Board
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Create Bull Board
createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(smsQueue)],
  serverAdapter,
});

logger.info("Queue dashboard initialized at /admin/queues");

export default serverAdapter;
