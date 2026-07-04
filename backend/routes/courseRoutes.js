import express from "express"
import upload from "../utils/upload.js"
import auth from "../middleware/authMiddleware.js"

import {
  addCourse,
  getCourses,
  getOnlineCourses,
  getMyCourses,
  getMyEnrollments,
  updateCourse,
  deleteCourse,
  enrollCourse
} from "../controllers/courseController.js"

const router = express.Router()

router.get("/", getCourses)
router.get("/online", getOnlineCourses)
router.get("/my", auth, getMyCourses)
router.get("/my-enrollments", auth, getMyEnrollments)

const uploadFields = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "materialFile", maxCount: 1 },
])

router.post(
  "/",
  auth,
  uploadFields,
  addCourse
)

router.put(
  "/:id",
  auth,
  uploadFields,
  updateCourse
)

router.delete("/:id", auth, deleteCourse)

router.post("/:id/enroll", auth, enrollCourse)

export default router