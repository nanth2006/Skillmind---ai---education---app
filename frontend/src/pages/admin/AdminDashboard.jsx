import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../../api"
import { showAlert } from "../../components/Alert"

export default function AdminDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await API.get("/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      setData(res.data)
    } catch (err) {
      showAlert("error", "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (id, status) => {
    try {
      const token = localStorage.getItem("token")
      await API.put(`/admin/enrollments/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      showAlert("success", `Enrollment ${status} ✅`)
      fetchStats()
    } catch {
      showAlert("error", "Action failed")
    }
  }

  const s = data?.stats

  return (
    <div style={{ flex: 1, padding: 24, marginLeft: 70, background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Admin Dashboard</h1>

        {loading ? <p>Loading...</p> : (
          <>
            {/* STATS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { label: "Total Users",    value: s?.totalUsers ?? 0 },
                { label: "Total Courses",  value: s?.totalCourses ?? 0 },
                { label: "Enrollments",    value: s?.totalEnrollments ?? 0 },
                { label: "Revenue",        value: "₹" + (s?.totalRevenue?.toLocaleString() ?? 0) },
              ].map((st, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{st.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#111827" }}>{st.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* RECENT ENROLLMENTS */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Recent Enrollments</h3>
                {data?.recentEnrollments?.length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13 }}>No enrollments yet</p> : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead><tr>{["User","Course","Status"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {data?.recentEnrollments?.map(e => (
                        <tr key={e._id}>
                          <td style={{ padding: "10px 12px" }}>{e.userId?.name}</td>
                          <td style={{ padding: "10px 12px" }}>{e.courseId?.title || e.courseId?.name}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ background: e.status === "approved" ? "#dcfce7" : e.status === "pending" ? "#fef9c3" : "#fee2e2", color: e.status === "approved" ? "#15803d" : e.status === "pending" ? "#a16207" : "#b91c1c", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{e.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* TOP COURSES */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top Courses</h3>
                {data?.topCourses?.map(c => (
                  <div key={c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{c.title || c.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{c.enrolledUsers?.length ?? 0} enrolled</div>
                    </div>
                    <span style={{ background: c.isFree ? "#dcfce7" : "#dbeafe", color: c.isFree ? "#15803d" : "#1d4ed8", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {c.isFree ? "Free" : "₹" + c.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PENDING APPROVALS */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Pending Approvals</h3>
                <span style={{ background: "#fef9c3", color: "#a16207", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{data?.pendingApprovals?.length ?? 0} pending</span>
              </div>
              {data?.pendingApprovals?.length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>No pending approvals 🎉</p> : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr>{["User","Course","Type","Action"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data?.pendingApprovals?.map(e => (
                      <tr key={e._id}>
                        <td style={{ padding: "10px 12px" }}>{e.userId?.name}</td>
                        <td style={{ padding: "10px 12px" }}>{e.courseId?.title || e.courseId?.name}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ background: e.courseId?.isFree ? "#dcfce7" : "#dbeafe", color: e.courseId?.isFree ? "#15803d" : "#1d4ed8", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                            {e.courseId?.isFree ? "Free" : "₹" + e.courseId?.price}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", display: "flex", gap: 6 }}>
                          <button onClick={() => handleApproval(e._id, "approved")} style={{ padding: "5px 12px", background: "#dcfce7", color: "#15803d", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                          <button onClick={() => handleApproval(e._id, "rejected")} style={{ padding: "5px 12px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
    </div>
  )
}
