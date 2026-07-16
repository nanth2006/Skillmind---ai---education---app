import { useEffect, useState } from "react"
import API from "../../api"
import { showAlert } from "../../components/Alert"

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchEnrollments() }, [])

  const fetchEnrollments = async () => {
    try {
      const res = await API.get("/admin/enrollments", { headers })
      setEnrollments(res.data)
    } catch { showAlert("error", "Failed to load enrollments") }
    finally { setLoading(false) }
  }

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/admin/enrollments/${id}/status`, { status }, { headers })
      showAlert("success", `Enrollment ${status} ✅`)
      fetchEnrollments()
    } catch { showAlert("error", "Action failed") }
  }

  const handleExport = () => {
    const rows = [["User","Email","Course","Status","Payment","Progress","Date"]]
    enrollments.forEach(e => rows.push([e.userId?.name, e.userId?.email, e.courseId?.title || e.courseId?.name, e.status, e.paymentStatus, e.progress + "%", formatDate(e.createdAt)]))
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "enrollments.csv"; a.click()
    showAlert("success", "Exported ✅", "enrollments.csv downloaded")
  }

  const filtered = filter === "all" ? enrollments : enrollments.filter(e => e.status === filter)
  const stats = { total: enrollments.length, approved: enrollments.filter(e => e.status === "approved").length, pending: enrollments.filter(e => e.status === "pending").length }

  const formatDate = (d) => {
    if (!d) return "—"
    const date = new Date(d)
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN")
  }

  const badge = (s) => ({ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s === "approved" || s === "free" ? "#dcfce7" : s === "pending" ? "#fef9c3" : "#fee2e2", color: s === "approved" || s === "free" ? "#15803d" : s === "pending" ? "#a16207" : "#b91c1c" })

  return (
    <div style={{ flex: 1, padding: 24, marginLeft: 70, background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Enrollments</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
          {[["Total",stats.total],["Approved",stats.approved],["Pending",stats.pending]].map(([l,v]) => (
            <div key={l} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 4, background: "#f3f4f6", padding: 4, borderRadius: 10 }}>
              {["all","approved","pending","rejected"].map(t => (
                <button key={t} onClick={() => setFilter(t)} style={{ padding: "6px 14px", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", background: filter === t ? "#fff" : "transparent", color: filter === t ? "#111827" : "#6b7280" }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={handleExport} style={{ padding: "7px 16px", background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>⬇ Export CSV</button>
          </div>

          {loading ? <p>Loading...</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>{["User","Course","Progress","Payment","Status","Date","Actions"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e._id}>
                    <td style={{ padding: "10px 12px" }}><div style={{ fontWeight: 500 }}>{e.userId?.name}</div><div style={{ fontSize: 11, color: "#9ca3af" }}>{e.userId?.email}</div></td>
                    <td style={{ padding: "10px 12px" }}>{e.courseId?.title || e.courseId?.name}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${e.progress}%`, background: "#2563eb", borderRadius: 6 }} />
                        </div>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>{e.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}><span style={badge(e.paymentStatus)}>{e.paymentStatus}</span></td>
                    <td style={{ padding: "10px 12px" }}><span style={badge(e.status)}>{e.status}</span></td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "#9ca3af" }}>{formatDate(e.createdAt)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {e.status === "pending" && (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => handleStatus(e._id, "approved")} style={{ padding: "4px 10px", background: "#dcfce7", color: "#15803d", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>✓</button>
                          <button onClick={() => handleStatus(e._id, "rejected")} style={{ padding: "4px 10px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>✕</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>No enrollments found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
    </div>
  )
}
