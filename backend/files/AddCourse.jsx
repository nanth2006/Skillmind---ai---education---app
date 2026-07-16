import { useState } from "react"
import API from "../api"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"

function AddCourse() {
  const nav = useNavigate()

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
    try {
      const token = localStorage.getItem("token")

      const data = new FormData()
      data.append("name", form.name)
      data.append("description", form.description)
      data.append("duration", form.duration)
      data.append("completionDate", form.completionDate)
      if (form.file) data.append("file", form.file)

      // ✅ Fixed: /create route + auth token
      await API.post("/courses/create", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      })

      alert("Course Added ✅")
      nav("/courses")

    } catch (err) {
      console.error(err)
      alert("Error 😢 - " + (err.response?.data?.error || err.message))
    }
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="main" style={{ width: "100%" }}>
        <div className="add-course-page">
          <div className="form-card">

            <h2>Add New Course</h2>

            <input name="name" placeholder="Course Name" onChange={handleChange} />
            <input name="description" placeholder="Description" onChange={handleChange} />
            <input name="duration" placeholder="Duration (e.g. 2 hours)" onChange={handleChange} />
            <input type="date" name="completionDate" onChange={handleChange} />
            <input type="file" onChange={handleFile} />

            <button onClick={submit}>Submit</button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCourse
