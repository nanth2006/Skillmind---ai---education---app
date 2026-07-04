import Razorpay from "razorpay"
import crypto from "crypto"
import Payment from "../models/Payment.js"
import User from "../models/user.js"

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

// ✅ CREATE PAYMENT (course purchase or pro upgrade)
export const createPayment = async (req, res) => {
  const { courseId, type, amount } = req.body

  try {
    if (!amount) {
      return res.status(400).json({ message: "Amount is required ❌" })
    }

    const payment = new Payment({
      userId: req.user.id,
      courseId: courseId || null,
      type: type === "pro" ? "pro" : "course",
      amount: Number(amount),
      status: "pending",
    })

    await payment.save()

    res.json({
      message: "Payment created ✅",
      payment,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ VERIFY / MARK PAYMENT AS SUCCESS
// (Call this after a successful payment from your payment gateway,
//  or from an admin action while testing)
export const verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)

    if (!payment) {
      return res.status(404).json({ message: "Payment not found ❌" })
    }

    if (payment.userId.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed ❌" })
    }

    payment.status = "success"
    payment.paymentRef = req.body.paymentRef || payment.paymentRef
    await payment.save()

    // If this was a "Pro" upgrade payment, unlock Pro for the user
    if (payment.type === "pro") {
      await User.findByIdAndUpdate(payment.userId, {
        isPro: true,
        proSince: new Date(),
      })
    }

    res.json({
      message: "Payment verified ✅",
      payment,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ GET MY PAYMENT HISTORY
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate("courseId", "title")
      .sort({ createdAt: -1 })

    res.json(payments)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ GET MY PRO STATUS
export const getMyProStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("isPro proSince")

    res.json({
      isPro: user?.isPro || false,
      proSince: user?.proSince || null,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ CREATE RAZORPAY ORDER (real test-mode checkout)
// Creates a pending Payment record + a Razorpay order, returns everything
// the frontend's Razorpay Checkout widget needs.
export const createRazorpayOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay()
    if (!razorpay) {
      return res.status(500).json({
        message: "Razorpay keys are not configured on the server ❌",
      })
    }

    const { courseId, type, amount } = req.body
    if (!amount) {
      return res.status(400).json({ message: "Amount is required ❌" })
    }

    const payment = new Payment({
      userId: req.user.id,
      courseId: courseId || null,
      type: type === "pro" ? "pro" : "course",
      amount: Number(amount),
      status: "pending",
    })
    await payment.save()

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `rcpt_${payment._id}`,
      notes: {
        paymentId: payment._id.toString(),
        userId: req.user.id.toString(),
        courseId: courseId || "",
      },
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ✅ VERIFY RAZORPAY SIGNATURE (call this from the Checkout success handler)
export const verifyRazorpaySignature = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, signature, paymentId } = req.body

    if (!orderId || !razorpayPaymentId || !signature) {
      return res.status(400).json({ message: "Missing verification fields ❌" })
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${razorpayPaymentId}`)
      .digest("hex")

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Signature mismatch ❌" })
    }

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found ❌" })
    }

    payment.status = "success"
    payment.paymentRef = razorpayPaymentId
    await payment.save()

    if (payment.type === "pro") {
      await User.findByIdAndUpdate(payment.userId, {
        isPro: true,
        proSince: new Date(),
      })
    }

    res.json({ verified: true, payment })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
