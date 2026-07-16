import { useNavigate } from "react-router-dom"
import AuthShell from "../components/AuthShell"

function Front() {
  const nav = useNavigate()

  return (
    <AuthShell badge="AI-Powered Learning" width={420}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>🚀</div>

      <h1 className="ash-title" style={{ fontSize: 32 }}>Welcome to SkillMind</h1>
      <p className="ash-subtitle">
        Start your learning journey with AI — personalized courses,
        real-time tutoring, and progress tracking built for you.
      </p>

      <button className="ash-btn" onClick={() => nav("/login")}>
        Get Started
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 26, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {[
          { num: "10k+", label: "Learners" },
          { num: "500+", label: "Courses" },
          { num: "98%", label: "Satisfaction" },
        ].map(({ num, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div className="ash-title" style={{ fontSize: 18, marginBottom: 2 }}>{num}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{label}</div>
          </div>
        ))}
      </div>
    </AuthShell>
  )
}

export default Front
