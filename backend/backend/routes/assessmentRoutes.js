import express from "express"
import auth from "../middleware/authMiddleware.js"
import {
  getAssessment,
  generateAssessment,
  submitAssessment,
} from "../controllers/assessmentController.js"

const router = express.Router()

router.get("/:courseId", auth, getAssessment)
router.post("/:courseId/generate", auth, generateAssessment)
router.post("/:courseId/submit", auth, submitAssessment)

export default router
