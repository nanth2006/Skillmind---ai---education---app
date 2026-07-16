import express from "express"
import auth from "../middleware/authMiddleware.js"
import {
  getMyNotifications,
  snoozeNotification,
  dismissNotification,
  markSeen,
} from "../controllers/notificationController.js"

const router = express.Router()

router.get("/", auth, getMyNotifications)
router.put("/:id/snooze", auth, snoozeNotification)
router.put("/:id/dismiss", auth, dismissNotification)
router.put("/:id/seen", auth, markSeen)

export default router
