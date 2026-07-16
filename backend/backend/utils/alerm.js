import cron from "node-cron"
import Course from "../models/course.js"
import Notification from "../models/Notification.js"

// Builds a real Date from a course's goalDate ("YYYY-MM-DD") + goalTime ("HH:mm").
// Falls back to end-of-day (23:59) if no time was set.
const buildDeadline = (goalDate, goalTime) => {
  if (!goalDate) return null
  const time = goalTime && /^\d{1,2}:\d{2}$/.test(goalTime) ? goalTime : "23:59"
  const dt = new Date(`${goalDate}T${time}`)
  return isNaN(dt.getTime()) ? null : dt
}

const checkDeadlines = async () => {
  try {
    const now = new Date()

    const courses = await Course.find({
      goalDate: { $exists: true, $nin: ["", null] },
      status: { $ne: "completed" },
      userId: { $ne: null },
    })

    for (const course of courses) {
      const deadline = buildDeadline(course.goalDate, course.goalTime)
      if (!deadline || deadline > now) continue // not overdue yet

      const existing = await Notification.findOne({
        userId: course.userId,
        courseId: course._id,
        status: { $in: ["active", "snoozed"] },
      })

      if (existing) {
        // Reactivate if the snooze window has passed
        if (
          existing.status === "snoozed" &&
          existing.snoozedUntil &&
          existing.snoozedUntil <= now
        ) {
          existing.status = "active"
          existing.seen = false
          await existing.save()
        }
        continue
      }

      await Notification.create({
        userId: course.userId,
        courseId: course._id,
        message: `Deadline passed for "${course.title}" and it's still incomplete. Finish it or snooze the alarm with a reason.`,
      })
    }
  } catch (err) {
    console.error("⏰ Alarm cron error:", err.message)
  }
}

// Runs every 5 minutes
cron.schedule("*/5 * * * *", checkDeadlines)

// Also run once on boot so overdue courses don't wait 5 minutes after a restart
checkDeadlines()

console.log("⏰ Alarm cron engine started (checks every 5 min)")
