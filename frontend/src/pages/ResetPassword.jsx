import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import API from "../api"
import AuthShell from "../components/AuthShell"

function ResetPassword() {
  const nav = useNavigate()
  const { token } = useParams()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const submit = async () => {
    setError("")
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match")
      return
    }
    try {
      setLoading(true)
      await API.post(`/auth/reset-password/${token}`, { password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || "Reset link is invalid or has expired")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === "Enter") submit() }

  return (
    <AuthShell badge="New Password">
      <h1 className="ash-title">Reset Password</h1>
      <p className="ash-subtitle">
        {done ? "Your password has been updated." : "Choose a new password for your account."}
      </p>

      {error && <div className="ash-error">{error}</div>}

      {done ? (
        <button className="ash-btn" onClick={() => nav("/login")}>
          Back to Login
        </button>
      ) : (
        <>
          <div className="ash-field">
            <label className="ash-label">New Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="ash-input"
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ paddingRight: 40 }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 14 }}
              >
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>
          </div>

          <div className="ash-field">
            <label className="ash-label">Confirm Password</label>
            <input
              className="ash-input"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="ash-btn" onClick={submit} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </>
      )}

      <p className="ash-link-row">
        Remembered it after all? <span onClick={() => nav("/login")}>Login</span>
      </p>
    </AuthShell>
  )
}

export default ResetPassword
