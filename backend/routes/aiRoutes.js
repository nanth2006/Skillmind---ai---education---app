import express from "express"
import { chatAI , streamAI} from "../controllers/aiController.js"

const router = express.Router()

router.post("/chat", chatAI)
router.post("/stream", streamAI)

export default router