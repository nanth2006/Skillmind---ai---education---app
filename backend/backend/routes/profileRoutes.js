import express from "express"
import {
  createProfile,
  getProfile,
  updateProfile
} from "../controllers/ProfileController.js"

import auth from "../middleware/authMiddleware.js"
import upload from "../utils/upload.js"

const router = express.Router()

router.post("/create", auth, upload.single("avatar"), createProfile)
router.get("/me", auth, getProfile)
router.put("/update", auth, upload.single("avatar"), updateProfile)

export default router