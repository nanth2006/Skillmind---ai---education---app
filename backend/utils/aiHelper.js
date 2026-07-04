const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const TEXT_MODEL = "meta-llama/llama-3-8b-instruct"

// Asks the AI for strict JSON so we can parse it reliably.
const SYSTEM_PROMPT = `You are an exam generator for an online learning platform.
Respond with ONLY valid JSON — no markdown fences, no commentary, no extra text.
Use exactly this shape:
{"questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0}]}
Rules:
- Generate exactly the requested number of questions.
- Each question must have exactly 4 options.
- correctIndex is the 0-based index (0,1,2 or 3) of the correct option.
- Questions must be answerable from the given material (or general course knowledge if no material is given).`

const safeParseQuestions = (raw) => {
  const cleaned = (raw || "").replace(/```json|```/g, "").trim()
  try {
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed.questions)) return parsed.questions
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (Array.isArray(parsed.questions)) return parsed.questions
      } catch {
        // fall through to empty array below
      }
    }
  }
  return []
}

// Basic shape validation so a malformed AI response never reaches the user.
const sanitizeQuestions = (questions, count) => {
  return questions
    .filter(
      (q) =>
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        Number.isInteger(q.correctIndex) &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3
    )
    .slice(0, count)
}

export const generateMCQs = async (materialText, title, count = 5) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set on the server")
  }

  const trimmed = (materialText || "").slice(0, 9000) // keep prompt size sane

  const userPrompt = trimmed
    ? `Course title: "${title}".\nUsing ONLY the study material below, create ${count} multiple-choice questions to test whether a learner understood it.\n\nMaterial:\n"""${trimmed}"""`
    : `Course title: "${title}".\nNo study material was uploaded, so create ${count} general multiple-choice questions a learner studying "${title}" should be able to answer.`

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  })

  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content || "{}"

  const questions = sanitizeQuestions(safeParseQuestions(raw), count)
  return questions
}
