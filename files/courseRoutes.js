import express from "express"
import upload from "../utils/upload.js"
import auth from "../middleware/authMiddleware.js"
import {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse
} from "../controllers/courseController.js"

const router = express.Router()

router.post("/create", auth, upload.single("file"), createCourse)
router.get("/", auth, getCourses)
router.put("/:id", auth, upload.single("file"), updateCourse)
router.delete("/:id", auth, deleteCourse)

export default router
