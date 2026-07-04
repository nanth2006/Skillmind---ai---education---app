import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import API from "../api"
import Sidebar from "../components/Sidebar"

function EditCourse() {
  const { state } = useLocation()
  const nav = useNavigate()

  // Guard: if no course data, redirect back
  if (!state?._id) {
    nav("/courses")
    return null
  }

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: state?.name || state?.title || "",
    description: state?.description || "",
    duration: state?.duration || "",
    completionDate: state?.completionDate
      ? state.completionDate.slice(0, 10)   // format to YYYY-MM-DD for date input
      : "",
    file: null
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFile = (e) => {
    setForm({ ...form, file: e.target.files[0] })
  }

  const update = async () => {
    if (!form.name.trim()) {
      alert("Course name is required!")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      // ✅ Must use FormData — backend uses multer for file uploads
      const data = new FormData()
      data.append("name", form.name.trim())
      data.append("description", form.description)
      data.append("duration", form.duration)
      data.append("completionDate", form.completionDate)
      if (form.file) data.append("file", form.file)

      // ✅ Do NOT manually set Content-Type — Axios sets it with correct boundary
      await API.put(`/courses/${state._id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert("Course Updated ✅")
      nav("/courses")

    } catch (err) {
      console.error("EditCourse ERROR:", err.response?.data || err.message)
      alert("Update failed ❌ — " + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="main" style={{ width: "100%" }}>
        <div className="add-course-page">
          <div className="form-card">

            <h2>Edit Course</h2>

            <input
              name="name"
              placeholder="Course Name *"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
            <input
              name="duration"
              placeholder="Duration (e.g. 2 hours)"
              value={form.duration}
              onChange={handleChange}
            />
            <input
              type="date"
              name="completionDate"
              value={form.completionDate}
              onChange={handleChange}
            />

            <label style={{ fontSize: "0.85rem", color: "#888" }}>
              Update file (optional)
            </label>
            <input type="file" onChange={handleFile} />

            {state.file && !form.file && (
              <p style={{ fontSize: "0.8rem", color: "#aaa" }}>
                Current file: {state.file}
              </p>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button onClick={update} disabled={loading}>
                {loading ? "Saving..." : "Update ✅"}
              </button>
              <button
                onClick={() => nav("/courses")}
                disabled={loading}
                style={{ background: "#ccc", color: "#333" }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default EditCourse
