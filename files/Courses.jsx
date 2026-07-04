import { useEffect, useState } from "react"
import API from "../api"
import Card from "../components/card"
import { useNavigate } from "react-router-dom"
import "../index.css"

function Courses() {
  const [courses, setCourses] = useState([])
  const nav = useNavigate()

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await API.get("/courses", {
        headers: {
          Authorization: `Bearer ${token}`   // ✅ Fixed: matches authMiddleware
        }
      })

      setCourses(res.data)

    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token")

    await API.delete(`/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    fetchCourses()
  }

  const handleEdit = (course) => {
    nav("/edit-course", { state: course })
  }

  return (
    <div className="courses-page">

      <h1>Courses</h1>

      <button className="add-btn" onClick={() => nav("/add-course")}>
        +
      </button>

      <div className="grid">
        {courses.length === 0 ? (
          <p>No courses found 😢</p>
        ) : (
          courses.map(c => (
            <Card
              key={c._id}
              course={c}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

    </div>
  )
}

export default Courses
