import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: "No token ❌" })
  }

  // "Bearer <token>" format handle பண்றோம்
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader

  try {
    const decoded = jwt.verify(token, "secret123")
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: "Invalid token ❌" })
  }
}

export default authMiddleware
