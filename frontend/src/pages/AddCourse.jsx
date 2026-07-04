import { useState } from "react"
import API from "../api"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"

function AddCourse() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    completionDate: "",
    file: null
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFile = (e) => {
    setForm({ ...form, file: e.target.files[0] })
  }

  const submit = async () => {
    // ✅ Client-side validation before hitting API
    if (!form.name.trim()) {
      alert("Course name is required!")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const data = new FormData()
      data.append("name", form.name.trim())
      data.append("description", form.description)
      data.append("duration", form.duration)
      data.append("completionDate", form.completionDate)
      if (form.file) data.append("file", form.file)

      await API.post("/courses", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ Do NOT set Content-Type manually for FormData
          // Axios sets it automatically with the correct boundary
        }
      })

      alert("Course Added ✅")
      nav("/courses")

    } catch (err) {
      console.error("AddCourse ERROR:", err.response?.data || err.message)
      alert("Error 😢 — " + (err.response?.data?.error || err.message))
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

            <h2>Add New Course</h2>

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
            <input type="file" onChange={handleFile} />

            <button onClick={submit} disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCourse
