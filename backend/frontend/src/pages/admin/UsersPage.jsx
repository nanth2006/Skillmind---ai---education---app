import { useEffect, useState } from "react"
import API from "../../api"
import { showAlert } from "../../components/Alert"

const COLORS = [["#dbeafe","#1d4ed8"],["#dcfce7","#15803d"],["#fef9c3","#a16207"],["#fdf4ff","#9333ea"],["#fee2e2","#b91c1c"]]

export default function UsersPage() {
  const [users, setUsers]     = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]   = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await API.get("/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      setUsers(res.data)
    } catch { showAlert("error", "Failed to load users") }
    finally { setLoading(false) }
  }

  const handleStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token")
      await API.put(`/admin/users/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      showAlert("success", `User ${status} ✅`)
      setSelected(null)
      fetchUsers()
    } catch { showAlert("error", "Action failed") }
  }

  const initials = name => name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "U"
  const filtered = filter === "all" ? users : users.filter(u => u.status === filter)

  const formatDate = (d) => {
    if (!d) return "—"
    const date = new Date(d)
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN")
  }

  const badgeStyle = (s) => ({
    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: s === "active" ? "#dcfce7" : s === "pending" ? "#fef9c3" : "#fee2e2",
    color: s === "active" ? "#15803d" : s === "pending" ? "#a16207" : "#b91c1c"
  })

  return (
    <div style={{ flex: 1, padding: 24, marginLeft: 70, background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Users Management</h1>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", padding: 4, borderRadius: 10, marginBottom: 16, width: "fit-content" }}>
          {["all","active","pending","blocked"].map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: "6px 16px", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer",
              background: filter === t ? "#fff" : "transparent",
              color: filter === t ? "#111827" : "#6b7280",
              boxShadow: filter === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({t === "all" ? users.length : users.filter(u => u.status === t).length})
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
          {loading ? <p>Loading...</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>{["User","Email","Courses","Status","Joined","Action"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u._id}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, background: COLORS[i%5][0], color: COLORS[i%5][1] }}>{initials(u.name)}</div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                        {u.isPro && <span style={{ background: "#fef9c3", color: "#a16207", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>PRO</span>}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", color: "#6b7280" }}>{u.email}</td>
                    <td style={{ padding: "10px 12px" }}>{u.enrolledCount ?? 0}</td>
                    <td style={{ padding: "10px 12px" }}><span style={badgeStyle(u.status)}>{u.status}</span></td>
                    <td style={{ padding: "10px 12px", color: "#9ca3af", fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <button onClick={() => setSelected(u)} style={{ padding: "5px 14px", background: "#f3f4f6", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {selected && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSelected(null)}>
            <div style={{ background: "#fff", borderRadius: 14, width: 460, maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>User Details</h3>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9ca3af" }}>✕</button>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 600, background: "#dbeafe", color: "#1d4ed8" }}>{initials(selected.name)}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.name}</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>{selected.email}</div>
                    <span style={{ marginTop: 6, display: "inline-block", ...badgeStyle(selected.status) }}>{selected.status}</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                  {[["Enrolled", selected.enrolledCount ?? 0], ["Role", selected.role], ["Plan", selected.isPro ? "Pro" : "Free"], ["Joined", formatDate(selected.createdAt)]].map(([l,v]) => (
                    <div key={l}><div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div><div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginTop: 4 }}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "0 20px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setSelected(null)} style={{ padding: "8px 18px", background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Close</button>
                {selected.status !== "blocked"
                  ? <button onClick={() => handleStatus(selected._id, "blocked")} style={{ padding: "8px 18px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Block User</button>
                  : <button onClick={() => handleStatus(selected._id, "active")} style={{ padding: "8px 18px", background: "#dcfce7", color: "#15803d", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Unblock User</button>
                }
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
