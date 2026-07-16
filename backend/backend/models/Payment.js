import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    // "course" = payment for a specific course
    // "pro"    = payment to upgrade user to Pro plan
    type: {
      type: String,
      enum: ["course", "pro"],
      default: "course",
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    paymentRef: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

const Payment = mongoose.model("Payment", paymentSchema)

export default Payment
