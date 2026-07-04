import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import Sidebar from "../components/Sidebar"

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
        "http://localhost:5000/api/profile/me",
        { headers: { Authorization: token } }
      )

      setProfile(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div style={{ display: "flex" }}>

      {/* 🔥 SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div style={{
        marginLeft: "80px",
        width: "100%",
        minHeight: "100vh",
        background: "#0f172a",
        color: "white"
      }}>

        {/* 🔝 TOP BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h2>SKILLMIND AI</h2>

          {/* 👤 PROFILE REALTIME */}
          {profile && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={`http://localhost:5000/uploads/${profile.avatar}`}
                style={{
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  border: "2px solid #00dbde"
                }}
              />
              <span>{profile.name}</span>
            </div>
          )}
        </div>

        {/* 🔥 HERO */}
        <div style={{
          textAlign: "center",
          padding: "60px 20px"
        }}>
          <h1 style={{ fontSize: "40px" }}>
            Learn Smarter with AI 🚀
          </h1>

          <p style={{ color: "#94a3b8", marginTop: "10px" }}>
            Your personal AI-powered learning assistant
          </p>

          <button
            onClick={() => nav("/courses")}
            style={{
              marginTop: "20px",
              padding: "12px 25px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(90deg,#00dbde,#fc00ff)",
              color: "white",
              cursor: "pointer"
            }}
          >
            Explore Courses
          </button>
        </div>

        {/* 📢 FEATURES */}
        <div style={{
          margin: "40px auto",
          width: "90%",
          padding: "30px",
          borderRadius: "20px",
          background: "linear-gradient(135deg,#1e293b,#0f172a)",
          textAlign: "center"
        }}>
          <h2>🔥 Why Choose SKILLMIND AI?</h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: "20px",
            marginTop: "30px"
          }}>
            <div className="card">⚡ Smart Learning</div>
            <div className="card">📊 Track Progress</div>
            <div className="card">🤖 AI Support</div>
            <div className="card">🎯 Personalized</div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Home