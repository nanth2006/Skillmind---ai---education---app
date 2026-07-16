import mongoose from "mongoose"

const courseSchema = new mongoose.Schema(
  {
    // Basic Fields
    title: {
      type: String,
    },

    material: {
      type: String,
    },

    // Uploaded study material file (pdf / docx / txt) for this course
    materialFile: {
      type: String,
      default: "",
    },

    // Text extracted from materialFile — used to generate the AI assessment
    materialText: {
      type: String,
      default: "",
    },

    goalDate: {
      type: String,
    },

    goalTime: {
      type: String,
    },

    status: {
      type: String,
      default: "pending",
    },

    progress: {
      type: Number,
      default: 0,
    },

    // Course Owner
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Course Details
    description: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: "",
    },

    // Media
    thumbnail: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    // Pricing
    isFree: {
      type: Boolean,
      default: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    paymentLink: {
      type: String,
      default: "",
    },

    // Publishing
    publishStatus: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },

    // Students Enrolled
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Course = mongoose.model("Course", courseSchema)

export default Course