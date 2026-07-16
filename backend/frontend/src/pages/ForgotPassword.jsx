import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"
import AuthShell from "../components/AuthShell"

function ForgotPassword() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [devLink, setDevLink] = useState("")

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const submit = async () => {
    setError("")
    if (!isValidEmail(email)) {
      setError("Enter a valid email")
      return
    }
    try {
      setLoading(true)
      const res = await API.post("/auth/forgot-password", { email })
      setSent(true)
      if (res.data.devResetLink) setDevLink(res.data.devResetLink)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === "Enter") submit() }

  return (
    <AuthShell badge="Reset Password">
      <h1 className="ash-title">Forgot Password?</h1>
      <p className="ash-subtitle">
        No worries — enter your email and we'll send you a link to reset it.
      </p>

      {error && <div className="ash-error">{error}</div>}

      {sent ? (
        <>
          <div className="ash-success">
            If that email is registered, a reset link has been sent ✅ Check your inbox.
          </div>

          {devLink && (
            <div style={{ textAlign: "left", marginTop: 8, marginBottom: 16, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              <div style={{ marginBottom: 6 }}>📧 Email isn't configured yet — here's your dev reset link:</div>
              <a
                href={devLink}
                style={{ color: "#c4b5fd", wordBreak: "break-all", fontWeight: 600 }}
              >
                {devLink}
              </a>
            </div>
          )}

          <button className="ash-btn" onClick={() => nav("/login")}>
            Back to Login
          </button>
        </>
      ) : (
        <>
          <div className="ash-field">
            <label className="ash-label">Email</label>
            <input
              className="ash-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="ash-btn" onClick={submit} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </>
      )}

      <p className="ash-link-row">
        Remembered your password? <span onClick={() => nav("/login")}>Login</span>
      </p>
    </AuthShell>
  )
}

export default ForgotPassword
