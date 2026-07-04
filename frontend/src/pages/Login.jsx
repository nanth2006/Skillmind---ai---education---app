import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import API from "../api"
import AuthShell from "../components/AuthShell"

function Login() {
  const nav = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const goAfterLogin = (user) => {
    if (user?.role === "admin") nav("/admin")
    else nav("/home")
  }

  const handleLogin = async () => {
    setMsg("")

    if (!isValidEmail(email)) {
      setMsg("Enter a valid email")
      return
    }

    try {
      setLoading(true)
      const res = await API.post("/auth/login", { email, password })

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))

      goAfterLogin(res.data.user)
    } catch (err) {
      setMsg(err.response?.data?.message || "Login Failed ❌")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse) => {
    setMsg("")
    try {
      setLoading(true)
      const payload = JSON.parse(atob(credentialResponse.credential.split(".")[1]))

      const res = await API.post("/auth/google", {
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        avatar: payload.picture,
      })

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))

      goAfterLogin(res.data.user)
    } catch (err) {
      setMsg(err.response?.data?.message || "Google login failed ❌")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell badge="Welcome Back">
      <div style={{
        width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
        background: "linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, fontWeight: 800, color: "#fff",
        boxShadow: "0 0 24px rgba(168,85,247,0.4)",
        fontFamily: "'Syne', sans-serif",
      }}>S</div>

      <h1 className="ash-title">SkillMind</h1>
      <p className="ash-subtitle">Login to continue your learning journey</p>

      {msg && <div className="ash-error">{msg}</div>}

      <div className="ash-field">
        <label className="ash-label">Email</label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.4 }}>✉️</span>
          <input
            className="ash-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      <div className="ash-field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="ash-label" style={{ marginBottom: 6 }}>Password</label>
          <span
            onClick={() => nav("/forgot-password")}
            style={{ fontSize: 11.5, color: "#c4b5fd", cursor: "pointer", fontWeight: 600, marginBottom: 6 }}
          >
            Forgot password?
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.4 }}>🔒</span>
          <input
            className="ash-input"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingLeft: 36, paddingRight: 40 }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 14 }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>
      </div>

      <button className="ash-btn" onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="ash-divider">
        <div className="ash-divider-line" />
        <span className="ash-divider-text">OR</span>
        <div className="ash-divider-line" />
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setMsg("Google login failed ❌")}
        />
      </div>

      <p className="ash-link-row">
        Don't have an account? <span onClick={() => nav("/register")}>Register</span>
      </p>
    </AuthShell>
  )
}

export default Login
