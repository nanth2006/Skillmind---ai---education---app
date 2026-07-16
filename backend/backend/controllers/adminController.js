import User from "../models/user.js"
import Course from "../models/course.js"
import Enrollment from "../models/Enrollment.js"
import Payment from "../models/Payment.js"

// ✅ MIDDLEWARE - CHECK ADMIN ROLE
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied — Admins only ❌",
    })
  }
  next()
}

// ✅ DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalCourses = await Course.countDocuments()
    const totalEnrollments = await Enrollment.countDocuments()
    const pendingEnrollments = await Enrollment.countDocuments({ status: "pending" })
    const proUsers = await User.countDocuments({ isPro: true })

    const successfulPayments = await Payment.find({ status: "success" })
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

    const recentEnrollments = await Enrollment.find()
      .populate("userId", "name email")
      .populate("courseId", "title isFree price")
      .sort({ createdAt: -1 })
      .limit(5)

    const pendingApprovals = await Enrollment.find({ status: "pending" })
      .populate("userId", "name email")
      .populate("courseId", "title isFree price")
      .sort({ createdAt: -1 })
      .limit(10)

    const topCourses = await Course.find()
      .sort({ "enrolledUsers": -1 })
      .limit(5)

    res.json({
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        pendingEnrollments,
        proUsers,
        totalRevenue,
      },
      recentEnrollments,
      topCourses,
      pendingApprovals,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })

    const enrollmentCounts = await Enrollment.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ])

    const countMap = {}
    enrollmentCounts.forEach((e) => {
      countMap[e._id.toString()] = e.count
    })

    const result = users.map((u) => ({
      ...u.toObject(),
      enrolledCount: countMap[u._id.toString()] || 0,
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ UPDATE USER STATUS (active / pending / blocked)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" })
    }

    res.json({ message: "User status updated ✅", user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ GET ALL ENROLLMENTS
export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("userId", "name email")
      .populate("courseId", "title price discountPrice")
      .sort({ createdAt: -1 })

    res.json(enrollments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ UPDATE ENROLLMENT STATUS (approve / reject)
export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status } = req.body

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found ❌" })
    }

    res.json({ message: "Enrollment status updated ✅", enrollment })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ GET ALL PAYMENTS
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name email isPro")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })

    res.json(payments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
