import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import API from "../api"

function EditCourse() {
  const { state } = useLocation()
  const nav = useNavigate()

  // ✅ Fixed: use "name" field (matches DB), removed non-existent "progress"
  const [form, setForm] = useState({
    name: state?.name || state?.title || "",
    description: state?.description || "",
    duration: state?.duration || "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const update = async () => {
    try {
      const token = localStorage.getItem("token")

      await API.put(`/courses/${state._id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert("Updated ✅")
      nav("/courses")
    } catch (err) {
      alert("Error ❌ - " + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Course</h2>

      <input
        name="name"
        value={form.name}
        placeholder="Course Name"
        onChange={handleChange}
        style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
      />
      <input
        name="description"
        value={form.description}
        placeholder="Description"
        onChange={handleChange}
        style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
      />
      <input
        name="duration"
        value={form.duration}
        placeholder="Duration"
        onChange={handleChange}
        style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
      />

      <button onClick={update} style={{ padding: "8px 20px" }}>Update ✅</button>
      <button onClick={() => nav("/courses")} style={{ padding: "8px 20px", marginLeft: "10px" }}>Cancel</button>
    </div>
  )
}

export default EditCourse
