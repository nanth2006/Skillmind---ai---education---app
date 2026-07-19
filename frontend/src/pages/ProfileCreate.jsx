import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE  = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const FIELDS = [
  { name: "name",       label: "Full Name",    type: "text",   placeholder: "Enter your full name",   span: 2 },
  { name: "age",        label: "Age",           type: "number", placeholder: "Your age"                        },
  { name: "gender",     label: "Gender",        type: "text",   placeholder: "Male / Female / Other"           },
  { name: "dob",        label: "Date of Birth", type: "date",   placeholder: ""                                },
  { name: "phone",      label: "Phone",         type: "tel",    placeholder: "+91 XXXXX XXXXX"                 },
  { name: "className",  label: "Class",         type: "text",   placeholder: "e.g. 10th"                       },
  { name: "schoolName", label: "School Name",   type: "text",   placeholder: "Your school",            span: 2 },
];

export default function ProfileCreate() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({});
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const initials = form.name
    ? form.name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const submit = async () => {
    if (!form.name) { setError("Name is required"); return; }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data  = new FormData();
      FIELDS.forEach(({ name }) => {
        if (form[name]) data.append(name, form[name]);
      });
      if (file) data.append("avatar", file);

      await axios.post(`${BASE}/api/profile/create`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .pc-bg {
          min-height: 100vh;
          background: #07070f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .pc-bg::before {
          content: '';
          position: fixed;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%);
          top: -150px; right: -150px;
          pointer-events: none;
        }
        .pc-bg::after {
          content: '';
          position: fixed;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 65%);
          bottom: -100px; left: -100px;
          pointer-events: none;
        }

        .pc-card {
          width: 100%;
          max-width: 500px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;
          padding: 40px 36px 36px;
          backdrop-filter: blur(20px);
          position: relative;
          z-index: 1;
        }

        /* header */
        .pc-head { text-align: center; margin-bottom: 32px; }
        .pc-title {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          background: linear-gradient(90deg, #22d3ee, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
        }
        .pc-subtitle { font-size: 13px; color: rgba(255,255,255,0.35); }

        /* avatar upload */
        .pc-avatar-zone { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; }
        .pc-avatar-ring {
          width: 86px; height: 86px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22d3ee, #a855f7, #ec4899);
          padding: 3px;
          margin-bottom: 10px;
          cursor: pointer;
          position: relative;
        }
        .pc-avatar-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: #12121e;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 700;
          color: rgba(255,255,255,0.4);
          position: relative;
        }
        .pc-avatar-inner img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .pc-avatar-overlay {
          position: absolute; inset: 3px;
          border-radius: 50%;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          font-size: 20px;
        }
        .pc-avatar-ring:hover .pc-avatar-overlay { opacity: 1; }
        .pc-avatar-hint { font-size: 12px; color: rgba(255,255,255,0.3); }

        /* form grid */
        .pc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 14px;
        }
        .pc-field { margin-bottom: 14px; }
        .pc-field.span2 { grid-column: span 2; }
        .pc-label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 6px;
        }
        .pc-input {
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
        .pc-input:focus {
          border-color: rgba(168,85,247,0.55);
          background: rgba(168,85,247,0.08);
        }
        .pc-input::placeholder { color: rgba(255,255,255,0.2); }
        .pc-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }

        .pc-error {
          color: #f87171;
          font-size: 13px;
          text-align: center;
          margin: 8px 0 12px;
        }

        .pc-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(90deg, #a855f7, #ec4899);
          color: white;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          margin-top: 8px;
          letter-spacing: 0.02em;
        }
        .pc-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .pc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .pc-skip {
          text-align: center;
          margin-top: 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }
        .pc-skip span {
          color: #a855f7;
          cursor: pointer;
          text-decoration: underline;
        }
        .pc-skip span:hover { color: #c084fc; }

        @media (max-width: 480px) {
          .pc-card { padding: 28px 20px 24px; }
          .pc-grid { grid-template-columns: 1fr; }
          .pc-field.span2 { grid-column: span 1; }
        }
      `}</style>

      <div className="pc-bg">
        <div className="pc-card">

          {/* header */}
          <div className="pc-head">
            <div className="pc-title">Create Your Profile</div>
            <div className="pc-subtitle">Tell us a bit about yourself to get started</div>
          </div>

          {/* avatar */}
          <div className="pc-avatar-zone">
            <label className="pc-avatar-ring" title="Upload photo">
              <div className="pc-avatar-inner">
                {preview
                  ? <img src={preview} alt="preview" />
                  : <span>{initials}</span>}
              </div>
              <div className="pc-avatar-overlay">📷</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </label>
            <span className="pc-avatar-hint">
              {preview ? "Tap to change photo" : "Tap to upload photo"}
            </span>
          </div>

          {/* fields */}
          <div className="pc-grid">
            {FIELDS.map(({ name, label, type, placeholder, span }) => (
              <div key={name} className={`pc-field${span === 2 ? " span2" : ""}`}>
                <label className="pc-label">{label}</label>
                <input
                  className="pc-input"
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={form[name] || ""}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          {error && <div className="pc-error">{error}</div>}

          <button className="pc-btn" onClick={submit} disabled={loading}>
            {loading ? "Creating Profile…" : "Save & Continue →"}
          </button>

          <div className="pc-skip">
            <span onClick={() => navigate("/dashboard")}>Skip for now</span>
          </div>

        </div>
      </div>
    </>
  );
}
