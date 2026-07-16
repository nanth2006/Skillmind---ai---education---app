import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    type: {
      type: String,
      enum: ["deadline-alarm"],
      default: "deadline-alarm",
    },
    message: { type: String, default: "" },

    // active   -> alarm is currently ringing / should show in AlarmCenter
    // snoozed  -> user gave a reason, alarm goes quiet until snoozedUntil
    // dismissed-> course finished (or alarm cleared permanently)
    status: {
      type: String,
      enum: ["active", "snoozed", "dismissed"],
      default: "active",
    },

    snoozeReason: { type: String, default: "" },
    snoozedUntil: { type: Date, default: null },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, courseId: 1 })

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification
