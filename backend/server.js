import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose"
import path from "path"

import authRoutes from "./routes/authRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import assessmentRoutes from "./routes/assessmentRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"

import "./utils/alerm.js"

dotenv.config()

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅")
  })
  .catch((err) => {
    console.log("MongoDB Error ❌", err)
  })

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Static Upload Folder
const __dirname = path.resolve()

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
)

console.log(
  "Uploads Path:",
  path.join(__dirname, "uploads")
)

console.log(
  "OPENROUTER KEY 👉",
  process.env.OPENROUTER_API_KEY
    ? "Loaded ✅"
    : "Missing ❌"
)

// Routes
app.use("/api/auth", authRoutes)

app.use("/api/courses", courseRoutes)

app.use("/api/profile", profileRoutes)

app.use("/api/ai", aiRoutes)

app.use("/api/admin", adminRoutes)

app.use("/api/payments", paymentRoutes)

app.use("/api/assessments", assessmentRoutes)

app.use("/api/notifications", notificationRoutes)

// Health Check
app.get("/", (req, res) => {
  res.send(
    "SkillMind Backend Running 🚀"
  )
})

const PORT = process.env.PORT || 5000

// Local dev la mattum listen pannunga — Vercel serverless function ku
// idha skip pannanum, illana andha function correct-ah export aagathu
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} 🚀`
    )
  })
}

export default app