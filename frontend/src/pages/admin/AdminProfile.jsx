import { useEffect, useState } from "react"
import axios from "axios"
import { showAlert } from "../../components/Alert"

const BASE = "http://localhost:5000"

const FIELDS = [
  { name: "name",       label: "Full Name",  type: "text",  placeholder: "Enter your full name" },
  { name: "phone",      label: "Phone",      type: "tel",   placeholder: "+91 XXXXX XXXXX"       },
  { name: "gender",     label: "Gender",     type: "text",  placeholder: "Male / Female / Other" },
  { name: "dob",        label: "Date of Birth", type: "date", placeholder: ""                    },
]

export default function AdminProfile() {
  const [profile, setProfile]   = useState(null)
  const [form, setForm]         = useState({})
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [imgError, setImgError] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)

  const token = localStorage.getItem("token")
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE}/api/profile/me`, { headers })
      setProfile(res.data || {})
      setForm(res.data || {})
    } catch {
      setProfile({})
      setForm({})
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const submit = async () => {
    if (!form.name?.trim()) {
      showAlert("error", "Name is required")
      return
    }

    try {
      setLoading(true)
      const data = new FormData()
      FIELDS.forEach(({ name }) => {
        if (form[name]) data.append(name, form[name])
      })
      if (file) data.append("avatar", file)

      const isCreate = !profile?._id
      const url = isCreate ? "/api/profile/create" : "/api/profile/update"
      const method = isCreate ? "post" : "put"

      const res = await axios[method](`${BASE}${url}`, data, { headers })
      setProfile(res.data)
      setForm(res.data)
      setFile(null)
      setPreview(null)
      setImgError(false)
      showAlert("success", "Admin profile saved ✅")
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Something went wrong 😢")
    } finally {
      setLoading(false)
    }
  }

  const initials = (form.name || "Admin")
    .trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const avatarUrl =
    preview ? preview :
    (profile?.avatar && !imgError ? `${BASE}/uploads/${profile.avatar}` : null)

  const inp = { width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }
  const lbl = { display: "block", fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 6 }

  return (
    <div style={{ flex: 1, padding: 24, marginLeft: 70, background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin Profile</h1>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Manage your admin account details</p>

      {fetching ? <p>Loading...</p> : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 28, maxWidth: 520 }}>

          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <label style={{ width: 86, height: 86, borderRadius: "50%", background: "linear-gradient(135deg,#22d3ee,#a855f7,#ec4899)", padding: 3, cursor: "pointer", marginBottom: 10, position: "relative" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 24, fontWeight: 700, color: "#fff" }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initials}
              </div>
              <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
            </label>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Tap avatar to change photo</span>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FIELDS.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label style={lbl}>{label}</label>
                <input
                  style={inp}
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={form[name] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          <button
            onClick={submit}
            disabled={loading}
            style={{ width: "100%", marginTop: 22, padding: "12px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Saving..." : profile?._id ? "Update Profile" : "Create Profile"}
          </button>
        </div>
      )}
    </div>
  )
}
