import { useNavigate } from "react-router-dom"
import { useState } from "react"
import API from "../api"
import AuthShell from "../components/AuthShell"

function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" }
    let score = 0
    if (pwd.length >= 6) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)) score++
    const map = [
      { level: 1, label: "Weak", color: "#f87171" },
      { level: 2, label: "Medium", color: "#fbbf24" },
      { level: 3, label: "Strong", color: "#4ade80" },
    ]
    return map[score - 1] || map[0]
  }

  const strength = getStrength(form.password)

  const register = async () => {
    setError("")
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    try {
      setLoading(true)
      const res = await API.post("/auth/register", form)
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)
        localStorage.setItem("user", JSON.stringify(res.data.user))
      }
      nav("/profile-create")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") register()
  }

  return (
    <AuthShell badge="Join SkillMind">
      <h1 className="ash-title">Create Account</h1>
      <p className="ash-subtitle">Start your learning journey today</p>

      {error && <div className="ash-error">{error}</div>}

      <div className="ash-field">
        <label className="ash-label">Full Name</label>
        <div style={{ position: "relative" }}>
          <input
            className="ash-input"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="name"
            maxLength={30}
            style={{ paddingRight: 46 }}
          />
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>
            {form.name.length}/30
          </span>
        </div>
      </div>

      <div className="ash-field">
        <label className="ash-label">Email</label>
        <div style={{ position: "relative" }}>
          <input
            className="ash-input"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="email"
            maxLength={50}
            style={{ paddingRight: 46 }}
          />
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "rgba(255,255,255,0.3)", pointerEvents: "none" }}>
            {form.email.length}/50
          </span>
        </div>
      </div>

      <div className="ash-field">
        <label className="ash-label">Password</label>
        <div style={{ position: "relative" }}>
          <input
            className="ash-input"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min 6 characters"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            autoComplete="new-password"
            style={{ paddingRight: 40 }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 14 }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        {form.password && (
          <>
            <div style={{ height: 4, borderRadius: 10, background: "rgba(255,255,255,0.08)", marginTop: 8, overflow: "hidden" }}>
              <div style={{
                width: strength.level === 1 ? "33%" : strength.level === 2 ? "66%" : "100%",
                background: strength.color, height: "100%", borderRadius: 10, transition: "0.3s"
              }} />
            </div>
            <p style={{ fontSize: 11, color: strength.color, textAlign: "right", margin: "4px 0 0" }}>{strength.label}</p>
          </>
        )}
      </div>

      <button className="ash-btn" onClick={register} disabled={loading}>
        {loading ? "Creating account..." : "Register"}
      </button>

      <p className="ash-link-row">
        Already have an account? <span onClick={() => nav("/login")}>Login</span>
      </p>
    </AuthShell>
  )
}

export default Register
