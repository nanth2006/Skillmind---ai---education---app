import express from "express"
import auth from "../middleware/authMiddleware.js"

import {
  isAdmin,
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllEnrollments,
  updateEnrollmentStatus,
  getAllPayments,
} from "../controllers/adminController.js"

const router = express.Router()

// All admin routes require login + admin role
router.use(auth, isAdmin)

router.get(
  "/dashboard",
  getDashboardStats
)

router.get(
  "/users",
  getAllUsers
)

router.put(
  "/users/:id/status",
  updateUserStatus
)

router.get(
  "/enrollments",
  getAllEnrollments
)

router.put(
  "/enrollments/:id/status",
  updateEnrollmentStatus
)

router.get(
  "/payments",
  getAllPayments
)

export default router