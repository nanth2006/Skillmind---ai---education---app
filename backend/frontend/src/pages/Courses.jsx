import { useEffect, useState } from "react"
import API from "../api"
import Sidebar from "../components/Sidebar"
import AlarmCenter from "../components/AlarmCenter"
import AssessmentModal from "../components/AssessmentModal"
import { showAlert } from "../components/Alert"

const initForm = {
  title: "",
  description: "",
  duration: "",
  goalDate: "",
  goalTime: "",
}

const STATUS_OPTS = [
  { key: "pending",     label: "Not Started", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  { key: "in-progress", label: "In Progress",  color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  { key: "completed",   label: "Completed",    color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  { key: "incomplete",  label: "Incomplete",   color: "#f87171", bg: "rgba(248,113,113,0.12)" },
]

const ACCEPTED_MATERIAL = ".pdf,.docx,.txt"

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initForm)
  const [materialFile, setMaterialFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [assessmentCourse, setAssessmentCourse] = useState(null)

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchMyCourses() }, [])

  const fetchMyCourses = async () => {
    try {
      const res = await API.get("/courses/my", { headers })
      setCourses(res.data)
    } catch {
      showAlert("error", "Failed to load your courses")
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(initForm)
    setMaterialFile(null)
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      title: c.title || "",
      description: c.description || "",
      duration: c.duration || "",
      goalDate: c.goalDate || "",
      goalTime: c.goalTime || "",
    })
    setMaterialFile(null)
    setShowModal(true)
  }

  const buildFormData = () => {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (materialFile) fd.append("materialFile", materialFile)
    return fd
  }

  const handleSave = async () => {
    if (!form.title.trim()) return showAlert("error", "Course title is required")
    setSaving(true)
    try {
      const fd = buildFormData()
      if (editing) {
        await API.put(`/courses/${editing._id}`, fd, { headers })
        showAlert("success", "Course updated ✅")
      } else {
        await API.post("/courses", fd, { headers })
        showAlert("success", "Course added ✅", form.title)
      }
      setShowModal(false)
      fetchMyCourses()
    } catch {
      showAlert("error", "Save failed ❌")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return
    try {
      await API.delete(`/courses/${id}`, { headers })
      showAlert("success", "Course removed")
      fetchMyCourses()
    } catch {
      showAlert("error", "Delete failed ❌")
    }
  }

  // Manual progress tracking — completion itself is gated by the assessment,
  // so this never pushes status straight to "completed".
  const updateProgress = async (course, progress) => {
    const status = progress > 0 && course.status !== "completed" ? "in-progress" : course.status
    setCourses(cs => cs.map(c => c._id === course._id ? { ...c, progress, status } : c))
    try {
      await API.put(`/courses/${course._id}`, { progress, status }, { headers })
    } catch {
      showAlert("error", "Couldn't save progress")
      fetchMyCourses()
    }
  }

  const statusMeta = (key) => STATUS_OPTS.find(s => s.key === key) || STATUS_OPTS[0]

  const handleAssessmentResult = (result) => {
    if (!assessmentCourse) return
    setCourses(cs => cs.map(c => c._id === assessmentCourse._id
      ? { ...c, status: result.passed ? "completed" : "incomplete", progress: result.passed ? 100 : c.progress }
      : c
    ))
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .crs-bg {
          flex: 1; margin-left: 70px; min-height: 100vh;
          background: #07070f; font-family: 'DM Sans', sans-serif;
          position: relative; overflow-x: hidden;
        }
        .crs-bg::before {
          content: ''; position: fixed;
          width: 560px; height: 560px;
          background: radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 65%);
          top: -180px; right: -120px; pointer-events: none;
        }
        .crs-bg::after {
          content: ''; position: fixed;
          width: 460px; height: 460px;
          background: radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 65%);
          bottom: -140px; left: 60px; pointer-events: none;
        }
        .crs-wrap { position: relative; z-index: 1; padding: 28px 32px 60px; }

        .crs-head {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 26px; flex-wrap: wrap; gap: 14px;
        }
        .crs-title {
          font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #f1f5f9; margin: 0;
        }
        .crs-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin: 4px 0 0; }
        .crs-head-actions { display: flex; align-items: center; gap: 10px; }

        .crs-btn-primary {
          padding: 11px 20px; border: none; border-radius: 12px;
          background: linear-gradient(90deg, #a855f7, #ec4899); color: white;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; position: relative; overflow: hidden;
          box-shadow: 0 8px 24px rgba(168,85,247,0.3);
          transition: transform 0.15s, box-shadow 0.25s;
        }
        .crs-btn-primary::before {
          content: ''; position: absolute; top: 0; left: -75%;
          width: 50%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg); transition: left 0.6s ease;
        }
        .crs-btn-primary:hover::before { left: 125%; }
        .crs-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(168,85,247,0.45); }

        .crs-empty {
          text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; backdrop-filter: blur(16px);
        }
        .crs-empty-icon { font-size: 44px; margin-bottom: 12px; }

        .crs-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 18px;
        }
        .crs-card {
          background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px; padding: 20px; backdrop-filter: blur(18px);
          display: flex; flex-direction: column; gap: 12px;
          transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
        }
        .crs-card:hover {
          transform: translateY(-3px);
          border-color: rgba(168,85,247,0.35);
          box-shadow: 0 16px 40px rgba(0,0,0,0.35);
        }
        .crs-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .crs-status {
          font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 20px;
          letter-spacing: 0.02em;
        }
        .crs-card-icons { display: flex; gap: 6px; }
        .crs-icon-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .crs-icon-btn:hover { background: rgba(168,85,247,0.18); }

        .crs-card-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #f1f5f9; margin: 0; }
        .crs-card-desc { font-size: 12.5px; color: rgba(255,255,255,0.4); margin: 0; line-height: 1.4; }
        .crs-meta-row { display: flex; gap: 14px; font-size: 11.5px; color: rgba(255,255,255,0.35); flex-wrap: wrap; }
        .crs-material-tag {
          font-size: 11px; color: #c4b5fd; background: rgba(168,85,247,0.1);
          border: 1px solid rgba(168,85,247,0.25); padding: 3px 9px; border-radius: 20px;
          display: inline-flex; align-items: center; gap: 4px; width: fit-content;
        }

        .crs-progress-track { background: rgba(255,255,255,0.07); border-radius: 20px; height: 8px; overflow: hidden; }
        .crs-progress-fill {
          height: 100%; background: linear-gradient(90deg,#22d3ee,#a855f7,#ec4899);
          transition: width 0.25s;
        }
        .crs-progress-row { display: flex; justify-content: space-between; align-items: center; }
        .crs-progress-label { font-size: 11.5px; color: rgba(255,255,255,0.4); }
        .crs-range { width: 110px; accent-color: #a855f7; }

        .crs-complete-btn {
          margin-top: 4px; padding: 10px; border: none; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 12.5px; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
        }
        .crs-complete-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .crs-complete-btn.take {
          background: linear-gradient(90deg, #22d3ee, #a855f7); color: white;
        }
        .crs-complete-btn.retry {
          background: rgba(248,113,113,0.14); color: #f87171; border: 1px solid rgba(248,113,113,0.3);
        }
        .crs-complete-btn.done {
          background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.25);
          cursor: default;
        }

        .crs-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
          padding: 20px; box-sizing: border-box;
        }
        .crs-modal {
          width: 440px; max-width: 100%; max-height: 88vh; overflow-y: auto;
          background: rgba(15,15,22,0.98); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 26px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .crs-modal h2 { font-family: 'Syne', sans-serif; font-size: 17px; color: #f1f5f9; margin: 0 0 18px; }
        .crs-field { margin-bottom: 14px; }
        .crs-label { display: block; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.45); margin-bottom: 6px; }
        .crs-input, .crs-textarea {
          width: 100%; padding: 10px 14px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
          color: #f1f5f9; font-size: 13px; outline: none; box-sizing: border-box;
          font-family: 'DM Sans', sans-serif; transition: border-color 0.2s;
        }
        .crs-input:focus, .crs-textarea:focus { border-color: rgba(168,85,247,0.5); }
        .crs-input::placeholder, .crs-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .crs-file-label {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 12px; border-radius: 10px;
          border: 1px dashed rgba(168,85,247,0.35); background: rgba(168,85,247,0.06);
          color: #c4b5fd; font-size: 12.5px; cursor: pointer; box-sizing: border-box;
          transition: background 0.2s;
        }
        .crs-file-label:hover { background: rgba(168,85,247,0.12); }
        .crs-file-hint { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 6px; }

        .crs-modal-actions { display: flex; gap: 10px; margin-top: 6px; }
        .crs-modal-actions button {
          flex: 1; padding: 11px; border: none; border-radius: 10px;
          font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Syne', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
        }
        .crs-modal-actions button:hover { transform: translateY(-1px); }
        .crs-modal-cancel { background: rgba(255,255,255,0.06); color: #cbd5e1; }
        .crs-modal-save { background: linear-gradient(90deg, #a855f7, #ec4899); color: white; }
        .crs-modal-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="crs-bg">
        <div className="crs-wrap">
          <div className="crs-head">
            <div>
              <h1 className="crs-title">My Courses</h1>
              <p className="crs-sub">Your personal learning tracker — upload material, study, and pass the AI check to finish</p>
            </div>
            <div className="crs-head-actions">
              <AlarmCenter />
              <button className="crs-btn-primary" onClick={openAdd}>+ Add Course</button>
            </div>
          </div>

          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
          ) : courses.length === 0 ? (
            <div className="crs-empty">
              <div className="crs-empty-icon">🎯</div>
              <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>No courses yet</div>
              <div style={{ fontSize: 13, marginBottom: 16 }}>Add a course you're learning and track your own progress</div>
              <button className="crs-btn-primary" onClick={openAdd}>Add your first course</button>
            </div>
          ) : (
            <div className="crs-grid">
              {courses.map(c => {
                const sm = statusMeta(c.status)
                return (
                  <div key={c._id} className="crs-card">
                    <div className="crs-card-top">
                      <span className="crs-status" style={{ background: sm.bg, color: sm.color }}>{sm.label}</span>
                      <div className="crs-card-icons">
                        <button className="crs-icon-btn" onClick={() => openEdit(c)} title="Edit">✏️</button>
                        <button className="crs-icon-btn" onClick={() => handleDelete(c._id)} title="Delete">🗑️</button>
                      </div>
                    </div>

                    <h3 className="crs-card-title">{c.title}</h3>
                    {c.description && <p className="crs-card-desc">{c.description}</p>}

                    <div className="crs-meta-row">
                      {c.duration && <span>⏱ {c.duration}</span>}
                      {c.goalDate && <span>🎯 {new Date(c.goalDate).toLocaleDateString("en-IN")}{c.goalTime ? ` ${c.goalTime}` : ""}</span>}
                    </div>

                    {c.materialFile && (
                      <span className="crs-material-tag">📄 Material uploaded</span>
                    )}

                    <div className="crs-progress-track">
                      <div className="crs-progress-fill" style={{ width: `${c.progress || 0}%` }} />
                    </div>

                    <div className="crs-progress-row">
                      <span className="crs-progress-label">{c.progress || 0}% complete</span>
                      <input
                        type="range" min="0" max="100" step="5"
                        className="crs-range"
                        value={c.progress || 0}
                        onChange={(e) => updateProgress(c, Number(e.target.value))}
                        disabled={c.status === "completed"}
                      />
                    </div>

                    {c.status === "completed" ? (
                      <button className="crs-complete-btn done">✅ Course Completed</button>
                    ) : c.status === "incomplete" ? (
                      <button className="crs-complete-btn retry" onClick={() => setAssessmentCourse(c)}>
                        Retry Assessment
                      </button>
                    ) : (
                      <button className="crs-complete-btn take" onClick={() => setAssessmentCourse(c)}>
                        🤖 Take Completion Assessment
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="crs-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="crs-modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? "Edit Course" : "Add Course"}</h2>

            <div className="crs-field">
              <label className="crs-label">Course Title *</label>
              <input className="crs-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Data Structures & Algorithms" />
            </div>

            <div className="crs-field">
              <label className="crs-label">Description</label>
              <textarea className="crs-textarea" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What are you learning?" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label className="crs-label">Duration</label>
                <input className="crs-input" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 4 weeks" />
              </div>
              <div>
                <label className="crs-label">Target Date</label>
                <input className="crs-input" type="date" value={form.goalDate} onChange={e => setForm({ ...form, goalDate: e.target.value })} />
              </div>
            </div>

            <div className="crs-field">
              <label className="crs-label">Deadline Time (alarm rings after this)</label>
              <input className="crs-input" type="time" value={form.goalTime} onChange={e => setForm({ ...form, goalTime: e.target.value })} />
            </div>

            <div className="crs-field">
              <label className="crs-label">Study Material (PDF / DOCX / TXT)</label>
              <label className="crs-file-label">
                📎 {materialFile ? materialFile.name : (editing?.materialFile ? "Replace uploaded material" : "Upload material to study from")}
                <input
                  type="file"
                  accept={ACCEPTED_MATERIAL}
                  style={{ display: "none" }}
                  onChange={(e) => setMaterialFile(e.target.files?.[0] || null)}
                />
              </label>
              <p className="crs-file-hint">The AI generates your completion quiz straight from this file.</p>
            </div>

            <div className="crs-modal-actions">
              <button className="crs-modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="crs-modal-save" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : (editing ? "Update" : "Add Course")}
              </button>
            </div>
          </div>
        </div>
      )}

      {assessmentCourse && (
        <AssessmentModal
          course={assessmentCourse}
          onClose={() => setAssessmentCourse(null)}
          onResult={handleAssessmentResult}
        />
      )}
    </div>
  )
}
