import { useEffect, useState } from "react";
import API from "../../api";
import { showAlert } from "../../components/Alert";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await API.get("/admin/payments", { headers });
      setPayments(res.data);
    } catch (err) {
      console.log(err);
      showAlert("error", "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    filter === "all"
      ? payments
      : payments.filter((p) => p.status === filter);

  const totalRevenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const badge = (s) => ({
    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    background: s === "success" ? "#dcfce7" : s === "pending" ? "#fef9c3" : "#fee2e2",
    color: s === "success" ? "#15803d" : s === "pending" ? "#a16207" : "#b91c1c"
  });

  return (
    <div style={{ flex: 1, padding: 24, marginLeft: 70, background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Payments</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
        {[["Total", payments.length], ["Successful", payments.filter(p => p.status === "success").length], ["Revenue", "₹" + totalRevenue.toLocaleString()]].map(([l, v]) => (
          <div key={l} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 18 }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", gap: 4, background: "#f3f4f6", padding: 4, borderRadius: 10, marginBottom: 16, width: "fit-content" }}>
          {["all", "success", "pending", "failed"].map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding: "6px 16px", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer",
              background: filter === t ? "#fff" : "transparent",
              color: filter === t ? "#111827" : "#6b7280",
              boxShadow: filter === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none"
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <p>Loading...</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["User", "Type", "Course", "Amount", "Status", "Date"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 500 }}>{p.userId?.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.userId?.email}</div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {p.type === "pro"
                      ? <span style={{ background: "#fef9c3", color: "#a16207", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>PRO</span>
                      : "Course"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{p.courseId?.title || "—"}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>₹{p.amount}</td>
                  <td style={{ padding: "10px 12px" }}><span style={badge(p.status)}>{p.status}</span></td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#9ca3af" }}>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#9ca3af" }}>No payments found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
