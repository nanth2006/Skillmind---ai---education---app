import { useEffect, useState } from "react"
import API from "../api"

// stage: "loading" | "quiz" | "result" | "error"
export default function AssessmentModal({ course, onClose, onResult }) {
  const [stage, setStage] = useState("loading")
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadOrGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadOrGenerate = async () => {
    setStage("loading")
    setErrorMsg("")
    try {
      const existing = await API.get(`/assessments/${course._id}`)
      if (existing.data.exists && existing.data.questions.length > 0) {
        setQuestions(existing.data.questions)
        setAnswers(new Array(existing.data.questions.length).fill(null))
        setStage("quiz")
        return
      }
      await generate(false)
    } catch {
      await generate(false)
    }
  }

  const generate = async (force) => {
    setStage("loading")
    setErrorMsg("")
    try {
      const res = await API.post(`/assessments/${course._id}/generate`, { force })
      setQuestions(res.data.questions)
      setAnswers(new Array(res.data.questions.length).fill(null))
      setStage("quiz")
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Couldn't generate questions right now. Please try again."
      )
      setStage("error")
    }
  }

  const selectAnswer = (qIndex, optIndex) => {
    setAnswers((a) => {
      const copy = [...a]
      copy[qIndex] = optIndex
      return copy
    })
  }

  const allAnswered = answers.length > 0 && answers.every((a) => a !== null)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await API.post(`/assessments/${course._id}/submit`, { answers })
      setResult(res.data)
      setStage("result")
      onResult?.(res.data)
    } catch {
      setErrorMsg("Couldn't submit your answers. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const retry = () => {
    setAnswers(new Array(questions.length).fill(null))
    generate(true)
  }

  return (
    <div className="asm-overlay" onClick={onClose}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .asm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 4000; padding: 20px; box-sizing: border-box;
          font-family: 'DM Sans', sans-serif;
        }
        .asm-card {
          width: 560px; max-width: 100%; max-height: 88vh; overflow-y: auto;
          background: rgba(15,15,22,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 22px; padding: 30px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.55);
          animation: asm-rise 0.3s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes asm-rise {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .asm-head { margin-bottom: 18px; }
        .asm-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.3);
          color: #c4b5fd; font-size: 11px; font-weight: 700;
          padding: 5px 14px; border-radius: 20px; margin-bottom: 12px;
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .asm-title {
          font-family: 'Syne', sans-serif; font-size: 21px; font-weight: 800; color: #f1f5f9;
          margin: 0 0 4px;
        }
        .asm-sub { font-size: 12.5px; color: rgba(255,255,255,0.4); margin: 0; }

        .asm-loading {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          padding: 50px 10px; text-align: center;
        }
        .asm-spinner {
          width: 38px; height: 38px; border-radius: 50%;
          border: 3px solid rgba(168,85,247,0.2); border-top-color: #a855f7;
          animation: asm-spin 0.8s linear infinite;
        }
        @keyframes asm-spin { to { transform: rotate(360deg); } }
        .asm-loading p { font-size: 13px; color: rgba(255,255,255,0.45); }

        .asm-q { margin-bottom: 20px; }
        .asm-q-text {
          font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px;
          line-height: 1.5;
        }
        .asm-opt {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 12px; margin-bottom: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; font-size: 13px; color: #e2e8f0;
          transition: background 0.15s, border-color 0.15s, transform 0.1s;
        }
        .asm-opt:hover { background: rgba(168,85,247,0.08); transform: translateX(2px); }
        .asm-opt.selected {
          background: rgba(168,85,247,0.16);
          border-color: rgba(168,85,247,0.5);
          color: #f1f5f9;
        }
        .asm-opt-dot {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .asm-opt.selected .asm-opt-dot { border-color: #a855f7; background: #a855f7; }

        .asm-footer { display: flex; gap: 10px; margin-top: 8px; }
        .asm-btn {
          flex: 1; padding: 13px; border: none; border-radius: 14px;
          font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
        }
        .asm-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .asm-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
        .asm-btn.ghost { background: rgba(255,255,255,0.06); color: #cbd5e1; }
        .asm-btn.primary {
          background: linear-gradient(90deg, #a855f7, #ec4899); color: white;
          box-shadow: 0 8px 24px rgba(168,85,247,0.3);
        }

        .asm-result { text-align: center; padding: 20px 10px; }
        .asm-result-icon { font-size: 50px; margin-bottom: 10px; }
        .asm-result-title {
          font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800;
          margin-bottom: 6px;
        }
        .asm-result-title.pass { color: #4ade80; }
        .asm-result-title.fail { color: #f87171; }
        .asm-result-sub { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 22px; }

        .asm-error {
          background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3);
          color: #fca5a5; font-size: 12.5px; padding: 12px 14px; border-radius: 10px;
          margin-bottom: 16px; text-align: center;
        }
      `}</style>

      <div className="asm-card" onClick={(e) => e.stopPropagation()}>
        <div className="asm-head">
          <div className="asm-badge">📝 Completion Assessment</div>
          <h3 className="asm-title">{course.title}</h3>
          <p className="asm-sub">
            Pass this short quiz to mark the course as completed.
          </p>
        </div>

        {stage === "loading" && (
          <div className="asm-loading">
            <div className="asm-spinner" />
            <p>AI is generating your questions from the course material…</p>
          </div>
        )}

        {stage === "error" && (
          <>
            <div className="asm-error">{errorMsg}</div>
            <div className="asm-footer">
              <button className="asm-btn ghost" onClick={onClose}>Close</button>
              <button className="asm-btn primary" onClick={() => generate(true)}>
                Try Again
              </button>
            </div>
          </>
        )}

        {stage === "quiz" && (
          <>
            {questions.map((q, qi) => (
              <div className="asm-q" key={qi}>
                <div className="asm-q-text">{qi + 1}. {q.question}</div>
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={`asm-opt${answers[qi] === oi ? " selected" : ""}`}
                    onClick={() => selectAnswer(qi, oi)}
                  >
                    <span className="asm-opt-dot" />
                    {opt}
                  </div>
                ))}
              </div>
            ))}

            {errorMsg && <div className="asm-error">{errorMsg}</div>}

            <div className="asm-footer">
              <button className="asm-btn ghost" onClick={onClose}>Cancel</button>
              <button
                className="asm-btn primary"
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
              >
                {submitting ? "Grading..." : "Submit Answers"}
              </button>
            </div>
          </>
        )}

        {stage === "result" && result && (
          <div className="asm-result">
            <div className="asm-result-icon">{result.passed ? "🎉" : "📚"}</div>
            <div className={`asm-result-title ${result.passed ? "pass" : "fail"}`}>
              {result.passed ? "Course Completed!" : "Not quite — Incomplete"}
            </div>
            <div className="asm-result-sub">
              You scored {result.score}/{result.total} ({result.percent}%) —
              {" "}{result.passed ? `pass mark is ${result.passPercent}%` : `need ${result.passPercent}% to pass`}
            </div>
            <div className="asm-footer">
              {!result.passed && (
                <button className="asm-btn ghost" onClick={retry}>
                  Retry Quiz
                </button>
              )}
              <button className="asm-btn primary" onClick={onClose}>
                {result.passed ? "Done" : "Close"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
