import jwt from "jsonwebtoken"
import User from "../models/user.js"

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      message: "No token ❌"
    })
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader
   
  try {
     console.log("AUTH HEADER =", authHeader)
console.log("TOKEN =", token)
console.log("JWT_SECRET =", process.env.JWT_SECRET)

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    const user = await User.findById(decoded.id)
      .select("-password")

    if (!user) {
      return res.status(401).json({
        message: "User not found ❌"
      })
    }

    req.user = user

    next()
  } catch (error) {
  console.log("JWT ERROR =", error.message)

  return res.status(401).json({
    message: "Invalid token ❌"
  })
}
}

export default authMiddleware