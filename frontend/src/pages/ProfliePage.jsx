import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE = "http://localhost:5000";

const FIELDS = [
  { name: "name",       label: "Full Name",    type: "text",   placeholder: "Enter your name"        },
  { name: "age",        label: "Age",           type: "number", placeholder: "Your age"               },
  { name: "dob",        label: "Date of Birth", type: "date",   placeholder: ""                       },
  { name: "phone",      label: "Phone",         type: "tel",    placeholder: "+91 XXXXX XXXXX"        },
  { name: "gender",     label: "Gender",        type: "text",   placeholder: "Male / Female / Other"  },
  { name: "className",  label: "Class",         type: "text",   placeholder: "e.g. 10th"              },
  { name: "schoolName", label: "School",        type: "text",   placeholder: "School name"            },
];

function ProfilePage() {
  const navigate = useNavigate();
  const [profile,  setProfile]  = useState(null);
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({});
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [imgError, setImgError] = useState(false);
  const [toast,    setToast]    = useState("");
  const [fetching, setFetching] = useState(true);   // ✅ loading state for fetch

  const token = localStorage.getItem("token");

  /* ── fetch profile ── */
  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    axios
      .get(`${BASE}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          // ✅ No profile yet — let the user create one via Edit mode
          setProfile({});
          setForm({});
          setEditing(true);           // ✅ auto-open edit so user can fill in
        } else {
          // ✅ Bad token or server error — redirect to login
          navigate("/login");
        }
      })
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setImgError(false);
    setPreview(URL.createObjectURL(f));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  /* ── save ── */
  const save = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      FIELDS.forEach(({ name }) => {
        if (form[name] !== undefined) data.append(name, form[name]);
      });
      if (file) data.append("avatar", file);

      const res = await axios.put(`${BASE}/api/profile/update`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setForm(res.data);
      setEditing(false);
      setFile(null);
      setPreview(null);
      showToast("Profile updated ✅");
    } catch (err) {
      showToast(err.response?.data?.message || "Error saving profile 😢");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm(profile);
    setFile(null);
    setPreview(null);
    setImgError(false);
  };

  /* ── avatar ── */
  const avatarSrc =
    preview
      ? preview
      : profile?.avatar && !imgError
      ? `${BASE}/uploads/${profile.avatar}`
      : null;

  const initials = profile?.name
    ? profile.name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  /* ── loading skeleton ── */
  if (fetching) {
    return (
      <div className="pp-bg">
        <div className="pp-wrap" style={{ display: "flex", justifyContent: "center", paddingTop: "120px" }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", fontSize: "14px" }}>
            Loading profile…
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pp-bg {
          min-height: 100vh;
          background: #07070f;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 48px 20px 60px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .pp-bg::before {
          content: '';
          position: fixed;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%);
          top: -120px; left: -100px;
          pointer-events: none;
        }
        .pp-bg::after {
          content: '';
          position: fixed;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          pointer-events: none;
        }

        .pp-wrap { width: 100%; max-width: 520px; position: relative; z-index: 1; }

        .pp-back {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 28px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s, border-color 0.2s;
        }
        .pp-back:hover { color: white; border-color: rgba(255,255,255,0.25); }

        .pp-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 24px;
          padding: 36px 32px 32px;
          backdrop-filter: blur(20px);
        }

        .pp-avatar-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
        }
        .pp-avatar-ring {
          width: 100px; height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22d3ee, #a855f7, #ec4899);
          padding: 3px;
          margin-bottom: 14px;
          position: relative;
        }
        .pp-avatar-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: #12121e;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: white;
          position: relative;
        }
        .pp-avatar-inner img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .pp-avatar-edit-btn {
          position: absolute;
          bottom: 2px; right: 2px;
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border: 2px solid #07070f;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: transform 0.2s;
        }
        .pp-avatar-edit-btn:hover { transform: scale(1.12); }
        .pp-avatar-edit-btn input { display: none; }

        .pp-display-name {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 700;
          color: #f8fafc;
          margin-bottom: 4px;
          text-align: center;
        }
        .pp-display-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          text-align: center;
        }

        .pp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 24px;
        }
        .pp-cell {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 14px;
        }
        .pp-cell-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.3);
          margin-bottom: 4px;
        }
        .pp-cell-val {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .pp-cell.full { grid-column: span 2; }

        .pp-field { margin-bottom: 14px; }
        .pp-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 6px;
        }
        .pp-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          appearance: none;
        }
        .pp-input:focus {
          border-color: rgba(168,85,247,0.55);
          background: rgba(168,85,247,0.08);
        }
        .pp-input::placeholder { color: rgba(255,255,255,0.2); }
        .pp-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }

        .pp-edit-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 14px;
        }
        .pp-edit-grid .pp-field:nth-child(7) { grid-column: span 2; }

        .pp-btn-primary {
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.02em;
        }
        .pp-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .pp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .pp-btn-ghost {
          flex: 1;
          padding: 13px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          background: transparent;
          color: rgba(255,255,255,0.55);
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
        }
        .pp-btn-ghost:hover { color: white; border-color: rgba(255,255,255,0.3); }

        .pp-btn-save {
          flex: 1;
          padding: 13px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .pp-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .pp-btn-row { display: flex; gap: 10px; margin-top: 6px; }

        .pp-toast {
          position: fixed;
          bottom: 32px; left: 50%;
          transform: translateX(-50%);
          background: rgba(20,20,35,0.95);
          border: 1px solid rgba(168,85,247,0.4);
          color: #e2e8f0;
          padding: 11px 22px;
          border-radius: 50px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          z-index: 9999;
          animation: ppFadeUp 0.3s ease;
        }
        @keyframes ppFadeUp {
          from { opacity:0; transform: translateX(-50%) translateY(10px); }
          to   { opacity:1; transform: translateX(-50%) translateY(0); }
        }

        @media (max-width: 500px) {
          .pp-card { padding: 24px 18px; }
          .pp-grid, .pp-edit-grid { grid-template-columns: 1fr; }
          .pp-edit-grid .pp-field:nth-child(7) { grid-column: span 1; }
          .pp-cell.full { grid-column: span 1; }
        }
      `}</style>

      <div className="pp-bg">
        <div className="pp-wrap">

          <button className="pp-back" onClick={() => navigate(-1)}>← Back</button>

          <div className="pp-card">

            {/* Avatar */}
            <div className="pp-avatar-zone">
              <div className="pp-avatar-ring">
                <div className="pp-avatar-inner">
                  {avatarSrc && (
                    <img src={avatarSrc} alt="profile" onError={() => setImgError(true)} />
                  )}
                  <span style={{ position: "relative", zIndex: avatarSrc ? 0 : 1 }}>
                    {initials}
                  </span>
                </div>

                {editing && (
                  <label className="pp-avatar-edit-btn" title="Change photo">
                    ✏️
                    <input type="file" accept="image/*" onChange={handleFile} />
                  </label>
                )}
              </div>

              {!editing && (
                <>
                  <div className="pp-display-name">{profile?.name || "Your Name"}</div>
                  <div className="pp-display-sub">
                    {[profile?.className && `Class ${profile.className}`, profile?.schoolName]
                      .filter(Boolean)
                      .join(" · ") || "AI School"}
                  </div>
                </>
              )}
            </div>

            {/* VIEW MODE */}
            {!editing && (
              <>
                <div className="pp-grid">
                  {[
                    { label: "Age",    val: profile?.age,        full: false },
                    { label: "Gender", val: profile?.gender,     full: false },
                    { label: "D.O.B",  val: profile?.dob,        full: false },
                    { label: "Phone",  val: profile?.phone,      full: false },
                    { label: "Class",  val: profile?.className,  full: false },
                    { label: "School", val: profile?.schoolName, full: true  },
                  ].map(({ label, val, full }) => (
                    <div key={label} className={`pp-cell${full ? " full" : ""}`}>
                      <div className="pp-cell-label">{label}</div>
                      <div className="pp-cell-val">{val || "—"}</div>
                    </div>
                  ))}
                </div>

                <button className="pp-btn-primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              </>
            )}

            {/* EDIT MODE */}
            {editing && (
              <>
                <div className="pp-edit-grid">
                  {FIELDS.map(({ name, label, type, placeholder }) => (
                    <div key={name} className="pp-field">
                      <label className="pp-label">{label}</label>
                      <input
                        className="pp-input"
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        value={form[name] || ""}
                        onChange={handleChange}
                      />
                    </div>
                  ))}
                </div>

                <div className="pp-btn-row">
                  <button className="pp-btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button className="pp-btn-save" onClick={save} disabled={loading}>
                    {loading ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {toast && <div className="pp-toast">{toast}</div>}
    </>
  );
}

export default ProfilePage;
