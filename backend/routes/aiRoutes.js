import express from "express"
import upload from "../utils/upload.js"
import { chatAI, streamAI } from "../controllers/aiController.js"

const router = express.Router()

router.post("/chat", upload.single("file"), chatAI)
router.post("/stream", upload.single("file"), streamAI)

export default router