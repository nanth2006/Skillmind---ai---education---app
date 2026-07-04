export const streamAI = async (req, res) => {
  try {
    const { message } = req.body

    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        stream: true,   // 🔥 IMPORTANT
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: message }
        ]
      })
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)

      // forward to frontend
      res.write(chunk)
    }

    res.end()

  } catch (err) {
    console.error(err)
    res.end()
  }
}
export const chatAI = async (req, res) => {
  try {
    const { message } = req.body

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "user", content: message }
        ]
      })
    })

    const data = await response.json()
    const reply = data?.choices?.[0]?.message?.content

    res.json({ reply })

  } catch (err) {
    res.status(500).json({ reply: "Error" })
  }
}