import Assessment from "../models/Assessment.js"
import Course from "../models/course.js"
import { generateMCQs } from "../utils/aiHelper.js"

const PASS_PERCENT = 60

// Strip correctIndex before sending questions to the frontend
const publicQuestions = (questions) =>
  (questions || []).map((q) => ({
    question: q.question,
    options: q.options,
  }))

const getOwnedCourse = async (courseId, userId) => {
  const course = await Course.findById(courseId)
  if (!course) return null
  // A learner can only take the assessment for their own tracked course
  if (course.userId?.toString() !== userId.toString()) return null
  return course
}

// GET /api/assessments/:courseId  — fetch existing assessment (if any)
export const getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      courseId: req.params.courseId,
      userId: req.user.id,
    })

    if (!assessment) {
      return res.json({ exists: false })
    }

    res.json({
      exists: true,
      questions: publicQuestions(assessment.questions),
      passed: assessment.passed,
      attempts: assessment.attempts.map((a) => ({
        score: a.score,
        total: a.total,
        passed: a.passed,
        takenAt: a.takenAt,
      })),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST /api/assessments/:courseId/generate
// Creates (or regenerates, if forced) the MCQ set for this course+user.
export const generateAssessment = async (req, res) => {
  try {
    const course = await getOwnedCourse(req.params.courseId, req.user.id)
    if (!course) {
      return res.status(404).json({ message: "Course not found ❌" })
    }

    const force = req.body?.force === true

    let assessment = await Assessment.findOne({
      courseId: course._id,
      userId: req.user.id,
    })

    if (assessment && assessment.questions.length > 0 && !force) {
      return res.json({
        questions: publicQuestions(assessment.questions),
        regenerated: false,
      })
    }

    const questions = await generateMCQs(
      course.materialText,
      course.title,
      5
    )

    if (!questions.length) {
      return res.status(502).json({
        message:
          "AI couldn't generate questions right now. Please try again. ❌",
      })
    }

    if (assessment) {
      assessment.questions = questions
      assessment.passed = false
      await assessment.save()
    } else {
      assessment = await Assessment.create({
        courseId: course._id,
        userId: req.user.id,
        questions,
      })
    }

    res.json({
      questions: publicQuestions(assessment.questions),
      regenerated: true,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST /api/assessments/:courseId/submit   body: { answers: number[] }
export const submitAssessment = async (req, res) => {
  try {
    const course = await getOwnedCourse(req.params.courseId, req.user.id)
    if (!course) {
      return res.status(404).json({ message: "Course not found ❌" })
    }

    const assessment = await Assessment.findOne({
      courseId: course._id,
      userId: req.user.id,
    })

    if (!assessment || assessment.questions.length === 0) {
      return res.status(400).json({
        message: "No assessment generated yet for this course ❌",
      })
    }

    const answers = Array.isArray(req.body.answers) ? req.body.answers : []
    const total = assessment.questions.length

    let score = 0
    assessment.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score += 1
    })

    const percent = total > 0 ? (score / total) * 100 : 0
    const passed = percent >= PASS_PERCENT

    assessment.attempts.push({ answers, score, total, passed })
    assessment.passed = assessment.passed || passed
    await assessment.save()

    // Gate course completion on the assessment result
    course.status = passed ? "completed" : "incomplete"
    course.progress = passed ? 100 : course.progress
    await course.save()

    res.json({
      score,
      total,
      percent: Math.round(percent),
      passed,
      passPercent: PASS_PERCENT,
      course,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
