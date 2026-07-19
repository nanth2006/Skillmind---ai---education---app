import { extractTextFromFile } from "../utils/extractText.js"

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]

const SYSTEM_PROMPT = `You are a helpful AI tutor. Explain clearly and simply, step by step.

LANGUAGE RULES:
- If the user writes in Tamil script, reply in Tamil.
- If the user writes in Tanglish (Tamil words typed in English letters, e.g. "eppadi irukku", "nalla puriyudhu"), reply in Tanglish — Tamil sentences written in English script, mixing in English technical terms naturally.
- If the user writes in English, reply in English.
- Always match the user's language and style; never switch to a different language on your own.`

// Builds the messages array depending on whether a file was attached
const buildMessages = async (message, file) => {
  const userText = message?.trim() || "Please look at the attached file and help me."

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
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
    return { messages, model: "google/gemma-4-31b-it:free" } // vision-capable free model
  }

  if (file) {
    // Document (pdf / docx / txt) — extract text, feed as context
    const extracted = await extractTextFromFile(file.buffer, file.originalname)
    const combined = `${userText}\n\n--- Attached file: ${file.originalname} ---\n${(extracted || "").slice(0, 8000)}`
    messages.push({ role: "user", content: combined })
    return { messages, model: "meta-llama/llama-3.3-70b-instruct:free" }
  }

  // Plain text message
  messages.push({ role: "user", content: userText })
  return { messages, model: "meta-llama/llama-3.3-70b-instruct:free" }
}

// ✅ STREAMING CHAT
export const streamAI = async (req, res) => {
  try {
    const { message } = req.body
    const file = req.file

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    if (!process.env.OPENROUTER_API_KEY) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "⚠️ Server misconfiguration: OPENROUTER_API_KEY is missing." } }] })}\n\n`)
      return res.end()
    }

    const { messages, model } = await buildMessages(message, file)

    const FALLBACK_MODELS = [
      model,
      "deepseek/deepseek-chat-v3.1:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "meta-llama/llama-3.1-8b-instruct:free",
    ]

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    let response = null
    let lastErr = ""

    outer:
    for (const m of FALLBACK_MODELS) {
      // Try each model up to 2 times (handles brief provider overload)
      for (let attempt = 1; attempt <= 2; attempt++) {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: m,
            stream: true,
            messages,
          }),
        })

        if (response.ok) break outer

        try {
          const errJson = await response.clone().json()
          lastErr = errJson?.error?.message || JSON.stringify(errJson)
        } catch {
          lastErr = await response.clone().text()
        }
        console.warn(`Model ${m} attempt ${attempt} failed (${response.status}): ${lastErr}`)

        // Only worth retrying the SAME model on a 429 (temporary overload).
        // Any other error (400/404/etc.) — move straight to the next model.
        if (response.status !== 429) break
        if (attempt < 2) await sleep(1500)
      }
    }

    // 🔎 If every fallback model failed, surface the last error to the chat
    // instead of silently piping an empty/garbled response.
    if (!response.ok) {
      console.error("All models failed. Last error:", response.status, lastErr)
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `⚠️ AI service error (${response.status}): ${lastErr}` } }] })}\n\n`)
      return res.end()
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value))
    }

    res.end()
  } catch (err) {
    console.error("streamAI crashed:", err)
    try {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `⚠️ Server error: ${err.message}` } }] })}\n\n`)
    } catch {}
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