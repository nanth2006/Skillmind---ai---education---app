import Course from "../models/course.js"

// ➕ Create Course (was "addCourse" but routes import "createCourse")
export const createCourse = async (req, res) => {
  try {
    const course = new Course({
      name: req.body.name || req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      completionDate: req.body.completionDate,
      file: req.file ? req.file.filename : null
    })

    await course.save()
    res.status(201).json({ message: "Course Added ✅", course })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// 📥 Get All Courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 })
    res.json(courses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ✏️ Update Course
export const updateCourse = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name || req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      completionDate: req.body.completionDate,
    }

    if (req.file) {
      updateData.file = req.file.filename
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )

    if (!course) {
      return res.status(404).json({ message: "Course not found ❌" })
    }

    res.json({ message: "Course Updated ✅", course })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// 🗑️ Delete Course
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found ❌" })
    }

    res.json({ message: "Course Deleted ✅" })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
