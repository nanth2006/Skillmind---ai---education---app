import express from "express"
import auth from "../middleware/authMiddleware.js"

import {
  createPayment,
  verifyPayment,
  getMyPayments,
  getMyProStatus,
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../controllers/paymentController.js"

const router = express.Router()

router.post("/", auth, createPayment)
router.put("/:id/verify", auth, verifyPayment)
router.get("/my", auth, getMyPayments)
router.get("/pro-status", auth, getMyProStatus)

router.post("/razorpay/order", auth, createRazorpayOrder)
router.post("/razorpay/verify", auth, verifyRazorpaySignature)

export default router
