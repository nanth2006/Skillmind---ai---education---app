import mongoose from "mongoose"

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true }, // exactly 4 options
    correctIndex: { type: Number, required: true }, // 0-3, never sent to the frontend
  },
  { _id: false }
)

const attemptSchema = new mongoose.Schema(
  {
    answers: { type: [Number], default: [] },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    takenAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const assessmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: { type: [questionSchema], default: [] },
    attempts: { type: [attemptSchema], default: [] },
    passed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

assessmentSchema.index({ courseId: 1, userId: 1 }, { unique: true })

const Assessment = mongoose.model("Assessment", assessmentSchema)

export default Assessment
