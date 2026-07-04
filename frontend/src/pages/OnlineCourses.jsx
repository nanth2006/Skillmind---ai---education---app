import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api"
import Sidebar from "../components/Sidebar"
import { showAlert } from "../components/Alert"

const BASE = "http://localhost:5000"

export default function OnlineCourses() {
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [tab, setTab] = useState("browse")
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const nav = useNavigate()

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [coursesRes, enrollRes, proRes] = await Promise.all([
        API.get("/courses/online"),
        API.get("/courses/my-enrollments", { headers }),
        API.get("/payments/pro-status", { headers }).catch(() => ({ data: { isPro: false } })),
      ])

      setCourses(coursesRes.data)
      setEnrollments(enrollRes.data)
      setIsPro(proRes.data.isPro)
    } catch {
      showAlert("error", "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const enrolledMap = {}
  enrollments.forEach(e => { if (e.courseId) enrolledMap[e.courseId._id] = e })

  const handleEnroll = async (course) => {
    if (!course.isFree && !isPro) {
      showAlert("info", "This is a premium course", "Upgrade to Pro to enroll")
      nav("/payment")
      return
    }
    try {
      await API.post(`/courses/${course._id}/enroll`, {}, { headers })
      showAlert("success", "Enrolled ✅", course.title)
      fetchAll()
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Enroll failed")
    }
  }

  const list = tab === "browse"
    ? courses
    : enrollments.map(e => e.courseId).filter(Boolean)

  const levelColor = (l) => ({
    Beginner:     { bg: "#dcfce7", c: "#15803d" },
    Intermediate: { bg: "#fef9c3", c: "#a16207" },
    Advanced:     { bg: "#fee2e2", c: "#b91c1c" },
  }[l] || { bg: "#f3f4f6", c: "#6b7280" })

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24, marginLeft: 70, background: "#f8fafc", minHeight: "100vh" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Online Courses</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Courses hosted by SkillMind — browse and enroll</p>

        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", padding: 4, borderRadius: 10, marginBottom: 20, width: "fit-content" }}>
          {[["browse", "Browse All"], ["mine", "My Enrollments"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "6px 18px", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer",
              background: tab === key ? "#fff" : "transparent",
              color: tab === key ? "#111827" : "#6b7280",
              boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
            }}>{label}</button>
          ))}
        </div>

        {loading ? <p>Loading...</p> : (
          list.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>
              {tab === "browse" ? "No courses available yet — check back soon!" : "You haven't enrolled in any courses yet."}
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {list.map(course => {
                const enrollment = enrolledMap[course._id]
                const lvl = levelColor(course.level)

                return (
                  <div key={course._id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {course.thumbnail && (
                      <div style={{ height: 120, overflow: "hidden", position: "relative" }}>
                        <img src={`${BASE}/uploads/${course.thumbnail}`} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {course.videoUrl && <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>🎬 Video</span>}
                      </div>
                    )}
                    <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span style={{ background: lvl.bg, color: lvl.c, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>{course.level || "Beginner"}</span>
                        {course.isFree
                          ? <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d" }}>FREE</span>
                          : <span style={{ fontSize: 11, fontWeight: 700, color: "#a16207" }}>₹{course.discountPrice || course.price} {isPro && "· PRO"}</span>}
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{course.title}</h3>
                      <p style={{ fontSize: 13, color: "#6b7280", margin: 0, flex: 1, minHeight: 36 }}>{course.description || "No description available"}</p>

                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9ca3af" }}>
                        <span>📂 {course.category || "General"}</span>
                        {course.duration && <span>⏱ {course.duration}</span>}
                      </div>

                      {enrollment ? (
                        <>
                          <div style={{ background: "#f3f4f6", borderRadius: 20, height: 8, overflow: "hidden" }}>
                            <div style={{ width: `${enrollment.progress || 0}%`, height: "100%", background: "linear-gradient(90deg,#22d3ee,#a855f7)" }} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>{enrollment.progress || 0}% complete</span>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
                              background: enrollment.status === "approved" ? "#dcfce7" : "#fef9c3",
                              color: enrollment.status === "approved" ? "#15803d" : "#a16207"
                            }}>{enrollment.status === "approved" ? "Enrolled" : "Pending approval"}</span>
                          </div>
                        </>
                      ) : (
                        <button onClick={() => handleEnroll(course)} style={{ marginTop: 4, padding: "10px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                          {course.isFree ? "Enroll for Free" : "Enroll Now"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
