import Course from "../models/course.js"
import Enrollment from "../models/Enrollment.js"
import { extractTextFromFile } from "../utils/extractText.js"
import { uploadToCloudinary } from "../utils/upload.js"

// ✅ CREATE COURSE
export const addCourse = async (req, res) => {
  const {
    title,
    material,
    goalDate,
    goalTime,
    description,
    duration,
    category,
    level,
    isFree,
    price,
    discountPrice,
    paymentLink,
    publishStatus,
    videoUrl,
  } = req.body

  try {
    let thumbnail = ""
    let video = ""
    let materialFile = ""
    let materialText = ""

    if (req.files?.thumbnail?.[0]) {
      const result = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        "skillmind/thumbnails"
      )
      thumbnail = result.secure_url
    }

    if (req.files?.video?.[0]) {
      const result = await uploadToCloudinary(
        req.files.video[0].buffer,
        "skillmind/videos"
      )
      video = result.secure_url
    }

    if (req.files?.materialFile?.[0]) {
      const result = await uploadToCloudinary(
        req.files.materialFile[0].buffer,
        "skillmind/materials"
      )
      materialFile = result.secure_url
      materialText = await extractTextFromFile(
        req.files.materialFile[0].buffer,
        req.files.materialFile[0].originalname
      )
    }

    const course = new Course({
      title,
      material,
      materialFile,
      materialText,
      goalDate,
      goalTime,
      userId: req.user?.id || null,
      description: description || "",
      duration: duration || "",
      category: category || "General",
      level: level || "Beginner",
      isFree: isFree === false || isFree === "false" ? false : true,
      price: Number(price) || 0,
      discountPrice: Number(discountPrice) || 0,
      paymentLink: paymentLink || "",
      publishStatus: publishStatus || "published",
      thumbnail,
      videoUrl: video || (videoUrl || ""),
    })

    await course.save()

    res.json({
      message: "Course added ✅",
      course,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ GET ALL COURSES
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 })

    res.json(courses)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ GET ONLINE COURSES (admin-hosted, published courses — visible to everyone)
export const getOnlineCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("userId", "name role")
      .sort({ createdAt: -1 })

    // Only show courses created by an admin, and that are published
    const onlineCourses = courses.filter(
      (c) => c.userId?.role === "admin" && c.publishStatus !== "draft"
    )

    res.json(onlineCourses)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ GET MY COURSES
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 })

    res.json(courses)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ UPDATE COURSE (only the owner can update their own course)
export const updateCourse = async (req, res) => {
  try {
    const existing = await Course.findById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        message: "Course not found ❌",
      })
    }

    if (existing.userId?.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You can only edit your own courses ❌",
      })
    }

    const update = {}

    const fields = [
      "title",
      "material",
      "goalDate",
      "goalTime",
      "status",
      "progress",
      "description",
      "duration",
      "category",
      "level",
      "isFree",
      "price",
      "discountPrice",
      "paymentLink",
      "publishStatus",
      "videoUrl",
    ]

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field]
      }
    })

    if (req.files?.thumbnail?.[0]) {
      const result = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        "skillmind/thumbnails"
      )
      update.thumbnail = result.secure_url
    }

    if (req.files?.video?.[0]) {
      const result = await uploadToCloudinary(
        req.files.video[0].buffer,
        "skillmind/videos"
      )
      update.videoUrl = result.secure_url
    }

    if (req.files?.materialFile?.[0]) {
      const result = await uploadToCloudinary(
        req.files.materialFile[0].buffer,
        "skillmind/materials"
      )
      update.materialFile = result.secure_url
      update.materialText = await extractTextFromFile(
        req.files.materialFile[0].buffer,
        req.files.materialFile[0].originalname
      )
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    )

    if (!course) {
      return res.status(404).json({
        message: "Course not found ❌",
      })
    }

    res.json({
      message: "Course updated ✅",
      course,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ DELETE COURSE (only the owner can delete their own course)
export const deleteCourse = async (req, res) => {
  try {
    const existing = await Course.findById(req.params.id)

    if (!existing) {
      return res.status(404).json({
        message: "Course not found ❌",
      })
    }

    if (existing.userId?.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You can only delete your own courses ❌",
      })
    }

    await Course.findByIdAndDelete(req.params.id)

    res.json({
      message: "Course deleted ✅",
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ GET MY ENROLLMENTS (for logged-in student)
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate("courseId")
      .sort({ createdAt: -1 })

    res.json(enrollments)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ ENROLL COURSE
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        message: "Course not found ❌",
      })
    }

    const existing = await Enrollment.findOne({
      userId: req.user.id,
      courseId: course._id,
    })

    if (existing) {
      return res.status(400).json({
        message: "Already enrolled ❌",
      })
    }

    const enrollment = new Enrollment({
      userId: req.user.id,
      courseId: course._id,
      status: course.isFree ? "approved" : "pending",
      paymentStatus: course.isFree
        ? "free"
        : "pending",
    })

    await enrollment.save()

    await Course.findByIdAndUpdate(
      course._id,
      {
        $addToSet: {
          enrolledUsers: req.user.id,
        },
      }
    )

    res.json({
      message: "Enrolled ✅",
      enrollment,
      paymentLink: course.paymentLink,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}