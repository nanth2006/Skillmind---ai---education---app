import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import Sidebar from "../components/Sidebar"

const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function Home() {
  const nav = useNavigate()

  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetchProfile()

    // 🔥 realtime feel (auto refresh)
    const interval = setInterval(fetchProfile, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await axios.get(
        `${BASE}/api/profile/me`,
        { headers: { Authorization: token } }
      )

      setProfile(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const features = [
    { icon: "⚡", title: "Smart Learning", desc: "AI-tailored lessons that adapt to your pace" },
    { icon: "📊", title: "Track Progress", desc: "Visual dashboards showing exactly where you stand" },
    { icon: "🤖", title: "AI Support", desc: "Instant doubt-solving, anytime you need it" },
    { icon: "🎯", title: "Personalized", desc: "A learning path built around your goals" },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        .home-wrap * { box-sizing: border-box; }
        .home-wrap { font-family: 'Syne', sans-serif; }
        .home-btn { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .home-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.45); }
        .feature-card { transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
        .feature-card:hover { transform: translateY(-4px); border-color: rgba(124,58,237,0.5); background: rgba(124,58,237,0.08); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease both; }
      `}</style>

      <div className="home-wrap" style={{ display: "flex" }}>

        {/* 🔥 SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <div style={{
          marginLeft: "80px",
          width: "100%",
          minHeight: "100vh",
          background: "#080812",
          color: "#f1f5f9"
        }}>

          {/* 🔝 TOP BAR */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "18px 40px",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(8,8,18,0.85)",
            backdropFilter: "blur(10px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}>
            <h2 style={{
              margin: 0,
              fontWeight: 800,
              fontSize: "20px",
              letterSpacing: "0.02em",
              background: "linear-gradient(90deg,#a78bfa,#ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              SKILLMIND AI
            </h2>

            {/* 👤 PROFILE REALTIME */}
            {profile && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={`${BASE}/uploads/${profile.avatar}`}
                  style={{
                    borderRadius: "50%",
                    width: "38px",
                    height: "38px",
                    objectFit: "cover",
                    border: "2px solid #a78bfa",
                    boxShadow: "0 0 10px rgba(167,139,250,0.4)",
                  }}
                />
                <span style={{ fontSize: "14px", fontWeight: 600 }}>{profile.name}</span>
              </div>
            )}
          </div>

          {/* 🔥 HERO */}
          <div className="fade-up" style={{
            textAlign: "center",
            padding: "88px 20px 64px",
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              border: "1px solid rgba(167,139,250,0.35)",
              background: "rgba(124,58,237,0.1)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#c4b5fd",
              marginBottom: "22px",
            }}>
              ✦ AI-Powered Learning
            </div>

            <h1 style={{
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              margin: 0,
            }}>
              Learn Smarter with{" "}
              <span style={{
                background: "linear-gradient(90deg,#a78bfa,#ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                AI 🚀
              </span>
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.55)",
              marginTop: "16px",
              fontSize: "16px",
              maxWidth: "480px",
              marginLeft: "auto",
              marginRight: "auto",
            }}>
              Your personal AI-powered learning assistant — built to guide, track and grow with you.
            </p>

            <button
              className="home-btn"
              onClick={() => nav("/courses")}
              style={{
                marginTop: "30px",
                padding: "14px 32px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(90deg,#7c3aed,#ec4899)",
                color: "white",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              Explore Courses →
            </button>
          </div>

          {/* 📢 FEATURES */}
          <div className="fade-up" style={{
            margin: "0 auto 60px",
            width: "90%",
            maxWidth: "1000px",
            padding: "40px 32px",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "linear-gradient(160deg, rgba(124,58,237,0.08), rgba(15,15,25,0.4))",
            textAlign: "center",
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>
              🔥 Why Choose SKILLMIND AI?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "34px" }}>
              Everything you need to learn faster, in one place.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: "18px",
            }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  className="feature-card"
                  style={{
                    padding: "26px 18px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    cursor: "default",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>{f.title}</div>
                  <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Home