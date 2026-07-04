function Card({ course, onDelete, onEdit }) {
  return (
    <div className="card">
      <h2>{course.title || course.name}</h2>

      <p>{course.description || "No description"}</p>

      <div className="progress-box">
        <div
          className="progress-bar"
          style={{ width: `${course.progress || 0}%` }}
        ></div>
      </div>

      <p>{course.progress || 0}% Completed</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button onClick={() => onEdit(course)}>✏️</button>
        <button onClick={() => onDelete(course._id)}>🗑️</button>
      </div>
    </div>
  )
}

export default Card