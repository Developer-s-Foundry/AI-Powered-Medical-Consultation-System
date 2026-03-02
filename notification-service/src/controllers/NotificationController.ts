import { Request, Response } from "express";
import notificationService from "../services/NotificationService";
import logger from "../utils/logger";

export class NotificationController {
  // GET /api/notifications/:userId
  getRecipientNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await notificationService.getRecipientNotifications(
        userId,
        { limit, offset },
      );

      res.json({ success: true, data: result }); // { rows, count }
    } catch (error) {
      logger.error("Error fetching notifications:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch notifications" });
    }
  };

  // GET /api/notifications/:userId/recent
  getRecentNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const notifications =
        await notificationService.getRecentNotifications(userId);
      res.json({ success: true, data: notifications });
    } catch (error) {
      logger.error("Error fetching recent notifications:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch notifications" });
    }
  };

  // GET /api/notifications/:userId/count
  countNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const count =
        await notificationService.countRecipientNotifications(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      logger.error("Error counting notifications:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to count notifications" });
    }
  };
}

export default new NotificationController();
