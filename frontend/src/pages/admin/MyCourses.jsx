import { useEffect, useState } from "react"
import API from "../../api"
import { showAlert } from "../../components/Alert"

const EMOJIS = ["⚛️","🟢","🗄️","🎨","☁️","📱","🔐","📊","🤖","🎯"]
const COLORS  = ["#eff6ff","#f0fdf4","#fef9c3","#fdf4ff","#fff7ed"]

const initForm = { title: "", description: "", duration: "", category: "General", level: "Beginner", isFree: true, price: "", discountPrice: "", paymentLink: "", publishStatus: "published", videoUrl: "" }

const BASE =  (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
export default function MyCourses() {
  const [courses, setCourses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(initForm)
  const [thumbFile, setThumbFile] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(null)
  const [videoFile, setVideoFile] = useState(null)

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchMyCourses() }, [])

  const fetchMyCourses = async () => {
    try {
      const res = await API.get("/courses/my", { headers })
      setCourses(res.data)
    } catch { showAlert("error", "Failed to load courses") }
    finally { setLoading(false) }
  }

  const openAdd = () => { setEditing(null); setForm(initForm); setThumbFile(null); setThumbPreview(null); setVideoFile(null); setShowModal(true) }

  const openEdit = (c) => {
    setEditing(c)
    setForm({ title: c.title || "", description: c.description || "", duration: c.duration || "",
      category: c.category || "General", level: c.level || "Beginner",
      isFree: c.isFree, price: c.price || "", discountPrice: c.discountPrice || "",
      paymentLink: c.paymentLink || "", publishStatus: c.publishStatus || "published",
      videoUrl: c.videoUrl?.startsWith("/uploads/") ? "" : (c.videoUrl || "") })
    setThumbFile(null)
    setThumbPreview(c.thumbnail ? `${BASE}/uploads/${c.thumbnail}` : null)
    setVideoFile(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return showAlert("error", "Course title required ❌")
    if (!form.isFree && !form.price) return showAlert("error", "Price required for paid course ❌")
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, val]) => data.append(key, val))
      if (thumbFile) data.append("thumbnail", thumbFile)
      if (videoFile) data.append("video", videoFile)

      if (editing) {
        await API.put(`/courses/${editing._id}`, data, { headers: { ...headers, "Content-Type": "multipart/form-data" } })
        showAlert("success", "Course updated ✅")
      } else {
        await API.post("/courses", data, { headers: { ...headers, "Content-Type": "multipart/form-data" } })
        showAlert("success", "Course created ✅", form.title)
      }
      setShowModal(false)
      fetchMyCourses()
    } catch { showAlert("error", "Save failed ❌") }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return
    try {
      await API.delete(`/courses/${id}`, { headers })
      showAlert("warning", "Course deleted")
      setCourses(prev => prev.filter(c => c._id !== id))
    } catch { showAlert("error", "Delete failed") }
  }

  const inp = { width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }
  const lbl = { display: "block", fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 5 }

  return (
    <div style={{ flex: 1, padding: 24, marginLeft: 70, background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>My Courses</h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Courses you are hosting</p>
          </div>
          <button onClick={openAdd} style={{ padding: "9px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Course</button>
        </div>

        {loading ? <p>Loading...</p> : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <div>No courses yet</div>
            <button onClick={openAdd} style={{ marginTop: 12, padding: "9px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Create your first course</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
            {courses.map((c, i) => (
              <div key={c._id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ height: 110, background: COLORS[i%COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontSize: 38 }}>
                  {c.thumbnail
                    ? <img src={`${BASE}/uploads/${c.thumbnail}`} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : EMOJIS[i%EMOJIS.length]}
                  {c.videoUrl && <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>🎬 Video</span>}
                  <span style={{ position: "absolute", top: 8, right: 8, background: c.isFree ? "#dcfce7" : "#dbeafe", color: c.isFree ? "#15803d" : "#1d4ed8", padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                    {c.isFree ? "Free" : "₹" + (c.discountPrice || c.price)}
                  </span>
                  <span style={{ position: "absolute", top: 8, left: 8, background: c.publishStatus === "published" ? "#dcfce7" : "#f3f4f6", color: c.publishStatus === "published" ? "#15803d" : "#6b7280", padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600 }}>
                    {c.publishStatus || "published"}
                  </span>
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6 }}>{c.title}</div>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#6b7280", marginBottom: 8, flexWrap: "wrap" }}>
                    <span>👥 {c.enrolledUsers?.length ?? 0}</span>
                    {c.duration && <span>⏱ {c.duration}</span>}
                    <span>{c.level}</span>
                  </div>
                  {!c.isFree && c.paymentLink && <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🔗 {c.paymentLink}</div>}
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(c)} style={{ flex: 1, padding: 6, background: "#f3f4f6", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>✏️ Edit</button>
                    <button onClick={() => { navigator.clipboard.writeText(c.paymentLink || window.location.origin); showAlert("info","Link copied!") }} style={{ flex: 1, padding: 6, background: "#eff6ff", color: "#1d4ed8", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>📤 Share</button>
                    <button onClick={() => handleDelete(c._id)} style={{ padding: "6px 10px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowModal(false)}>
            <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{editing ? "Edit Course" : "Add New Course"}</h3>
                <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9ca3af" }}>✕</button>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 14 }}><label style={lbl}>Course Title *</label><input style={inp} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Complete React 2024" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div><label style={lbl}>Category</label><select style={inp} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {["General","Web Development","Data Science","Design","DevOps","Mobile"].map(c => <option key={c}>{c}</option>)}
                  </select></div>
                  <div><label style={lbl}>Level</label><select style={inp} value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                    {["Beginner","Intermediate","Advanced"].map(l => <option key={l}>{l}</option>)}
                  </select></div>
                </div>
                <div style={{ marginBottom: 14 }}><label style={lbl}>Description</label><textarea style={{ ...inp, resize: "vertical" }} rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div style={{ marginBottom: 14 }}><label style={lbl}>Duration (e.g. 12 hours)</label><input style={inp} value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} /></div>

                {/* Thumbnail */}
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Course Thumbnail</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 72, height: 48, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {thumbPreview
                        ? <img src={thumbPreview} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: 22 }}>🖼️</span>}
                    </div>
                    <label style={{ padding: "8px 14px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
                      Upload Image
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                        const f = e.target.files[0]
                        if (!f) return
                        setThumbFile(f)
                        setThumbPreview(URL.createObjectURL(f))
                      }} />
                    </label>
                  </div>
                </div>

                {/* Video */}
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>Course Video</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ padding: "8px 14px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151", width: "fit-content" }}>
                      {videoFile ? `📹 ${videoFile.name}` : "Upload Video File"}
                      <input type="file" accept="video/*" style={{ display: "none" }} onChange={e => {
                        const f = e.target.files[0]
                        if (!f) return
                        setVideoFile(f)
                      }} />
                    </label>
                    <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>— or —</div>
                    <input style={inp} value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} placeholder="Paste a YouTube / video URL" />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", marginBottom: 14 }}>
                  <div><div style={{ fontSize: 13, fontWeight: 500 }}>Free Course</div><div style={{ fontSize: 11, color: "#9ca3af" }}>Toggle off to set a price</div></div>
                  <label style={{ position: "relative", display: "inline-block", width: 38, height: 22 }}>
                    <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={form.isFree} onChange={e => setForm({...form, isFree: e.target.checked})} />
                    <span style={{ position: "absolute", cursor: "pointer", inset: 0, background: form.isFree ? "#2563eb" : "#d1d5db", borderRadius: 22, transition: "0.2s" }}>
                      <span style={{ position: "absolute", height: 16, width: 16, left: form.isFree ? 19 : 3, bottom: 3, background: "#fff", borderRadius: "50%", transition: "0.2s" }} />
                    </span>
                  </label>
                </div>

                {!form.isFree && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <div><label style={lbl}>Price (₹)</label><input style={inp} type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="999" /></div>
                      <div><label style={lbl}>Discounted Price (₹)</label><input style={inp} type="number" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: e.target.value})} placeholder="799" /></div>
                    </div>
                    <div style={{ marginBottom: 14 }}><label style={lbl}>Payment Link (Razorpay / Stripe)</label><input style={inp} value={form.paymentLink} onChange={e => setForm({...form, paymentLink: e.target.value})} placeholder="https://rzp.io/l/yourlink" /></div>
                  </>
                )}

                <div><label style={lbl}>Status</label><select style={inp} value={form.publishStatus} onChange={e => setForm({...form, publishStatus: e.target.value})}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select></div>
              </div>
              <div style={{ padding: "0 20px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setShowModal(false)} style={{ padding: "8px 18px", background: "#f3f4f6", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: "8px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {editing ? "Update Course" : "Create Course"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
