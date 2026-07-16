import User from "../models/user.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { sendMail } from "../utils/mailer.js"

// ✅ REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const existing = await User.findOne({ email })

    if (existing) {
      return res.status(400).json({
        message: "User already exists ❌",
      })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = new User({
      name,
      email,
      password: hash,
      role: "user",
    })

    await user.save()

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role || "user",
      },
      process.env.JWT_SECRET || "secret123",
      {
        expiresIn: "30d",
      }
    )

    res.json({
      message: "User Registered ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: "User not found ❌",
      })
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Account blocked ❌",
      })
    }

    const match = await bcrypt.compare(
      password,
      user.password
    )

    if (!match) {
      return res.status(400).json({
        message: "Invalid password ❌",
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role || "user",
      },
      process.env.JWT_SECRET || "secret123",
      {
        expiresIn: "7d",
      }
    )

    res.json({
      message: "Login success ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ FORGOT PASSWORD — generates a reset token & emails a reset link
export const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    // Don't reveal whether the email exists — same response either way
    if (!user) {
      return res.json({
        message: "If that email is registered, a reset link has been sent ✅",
      })
    }

    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000 // 30 minutes
    await user.save()

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
    const resetLink = `${frontendUrl}/reset-password/${rawToken}`

    const { sent } = await sendMail({
      to: user.email,
      subject: "Reset your SkillMind password",
      html: `
        <p>Hi ${user.name || "there"},</p>
        <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    })

    const response = {
      message: "If that email is registered, a reset link has been sent ✅",
    }

    // SMTP isn't configured yet — return the link directly so the
    // flow still works end-to-end during development.
    if (!sent) {
      response.devResetLink = resetLink
    }

    res.json(response)
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

// ✅ RESET PASSWORD — validates token & sets new password
export const resetPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters ❌",
      })
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired ❌",
      })
    }

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    res.json({
      message: "Password reset successful ✅",
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}
// ✅ GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  const {
    name,
    email,
    googleId,
    avatar,
  } = req.body

  try {
    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google-oauth",
        googleId,
        avatar,
        role: "user",
      })
    } else {
      if (!user.googleId) {
        user.googleId = googleId
        user.avatar = avatar
        await user.save()
      }
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Account blocked ❌",
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET || "secret123",
      {
        expiresIn: "7d",
      }
    )

    res.json({
      message: "Google Login ✅",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        avatar: user.avatar,
      },
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}