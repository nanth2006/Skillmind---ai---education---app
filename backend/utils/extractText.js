import fs from "fs"
import path from "path"

// Lazily import the parser libraries so a missing optional dependency
// never crashes the whole server — it just means that file type
// won't get AI-assessment support until `npm install` is run.
const tryImport = async (name) => {
  try {
    return await import(name)
  } catch {
    console.warn(`⚠️  "${name}" not installed — run npm install in /backend`)
    return null
  }
}

export const extractTextFromFile = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) return ""

  const ext = path.extname(filePath).toLowerCase()

  try {
    if (ext === ".pdf") {
      const mod = await tryImport("pdf-parse")
      if (!mod) return ""
      const pdfParse = mod.default || mod
      const buffer = fs.readFileSync(filePath)
      const data = await pdfParse(buffer)
      return (data.text || "").trim()
    }

    if (ext === ".docx") {
      const mod = await tryImport("mammoth")
      if (!mod) return ""
      const mammoth = mod.default || mod
      const result = await mammoth.extractRawText({ path: filePath })
      return (result.value || "").trim()
    }

    if (ext === ".txt") {
      return fs.readFileSync(filePath, "utf-8").trim()
    }

    // Unsupported extension (image / video / etc.) — no text to extract
    return ""
  } catch (err) {
    console.error("extractTextFromFile error:", err.message)
    return ""
  }
}
