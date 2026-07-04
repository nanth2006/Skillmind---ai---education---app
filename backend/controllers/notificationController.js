import Notification from "../models/Notification.js"

// GET /api/notifications — active alarms for the logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const now = new Date()

    // Reactivate any snooze whose time has passed
    await Notification.updateMany(
      {
        userId: req.user.id,
        status: "snoozed",
        snoozedUntil: { $lte: now },
      },
      { $set: { status: "active", seen: false } }
    )

    const notifications = await Notification.find({
      userId: req.user.id,
      status: { $in: ["active", "snoozed"] },
    })
      .populate("courseId", "title goalDate goalTime")
      .sort({ createdAt: -1 })

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/notifications/:id/snooze   body: { reason, hours }
export const snoozeNotification = async (req, res) => {
  try {
    const { reason, hours } = req.body

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Please give a reason to snooze this alarm ❌",
      })
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!notification) {
      return res.status(404).json({ message: "Alarm not found ❌" })
    }

    const snoozeHours = Number(hours) > 0 ? Number(hours) : 24
    notification.status = "snoozed"
    notification.snoozeReason = reason.trim()
    notification.snoozedUntil = new Date(
      Date.now() + snoozeHours * 60 * 60 * 1000
    )
    notification.seen = true
    await notification.save()

    res.json({ message: "Alarm snoozed ✅", notification })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/notifications/:id/dismiss
export const dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { status: "dismissed", seen: true } },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: "Alarm not found ❌" })
    }

    res.json({ message: "Alarm dismissed ✅" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /api/notifications/:id/seen
export const markSeen = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { seen: true } }
    )
    res.json({ message: "ok" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
