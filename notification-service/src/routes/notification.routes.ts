import { Router } from "express";
import notificationController from "../controllers/NotificationController";

const router = Router();

// Get paginated notifications for a user
router.get("/:userId", notificationController.getRecipientNotifications);

// Get recent notifications (last 10)
router.get("/:userId/recent", notificationController.getRecentNotifications);

// Get unread count
router.get("/:userId/count", notificationController.countNotifications);

export default router;
