
import { extractTextFromFile } from "../utils/extractText.js"

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]

// Builds the messages array depending on whether a file was attached
const buildMessages = async (message, file) => {
  const userText = message?.trim() || "Please look at the attached file and help me."

  const messages = [
    { role: "system", content: "You are a helpful AI tutor. Explain clearly and simply, step by step." },
  ]

  if (file && IMAGE_TYPES.includes(file.mimetype)) {
    // Image — send as vision content
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: base64Image } },
      ],
    })
    return { messages, model: "google/gemini-flash-1.5" } // vision-capable model
  }

  if (file) {
    // Document (pdf / docx / txt) — extract text, feed as context
    const extracted = await extractTextFromFile(file.buffer, file.originalname)
    const combined = `${userText}\n\n--- Attached file: ${file.originalname} ---\n${(extracted || "").slice(0, 8000)}`
    messages.push({ role: "user", content: combined })
    return { messages, model: "meta-llama/llama-3-8b-instruct" }
  }

  // Plain text message
  messages.push({ role: "user", content: userText })
  return { messages, model: "meta-llama/llama-3-8b-instruct" }
}

// ✅ STREAMING CHAT
export const streamAI = async (req, res) => {
  try {
    const { message } = req.body
    const file = req.file

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const { messages, model } = await buildMessages(message, file)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages,
      }),
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value))
    }

    res.end()
  } catch (err) {
    console.error(err)
    res.end()
  }
}

// ✅ NON-STREAMING CHAT
export const chatAI = async (req, res) => {
  try {
    const { message } = req.body
    const file = req.file

    const { messages, model } = await buildMessages(message, file)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages }),
    })

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content

    res.json({ reply })
  } catch (err) {
    console.error(err)
    res.status(500).json({ reply: "Error" })
  }
}