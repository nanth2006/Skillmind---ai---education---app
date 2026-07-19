import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const BASE = const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const navLinks = [
  { to: "/admin",             icon: "⊞", label: "Dashboard"   },
  { to: "/admin/users",       icon: "◈", label: "Users"       },
  { to: "/admin/my-courses",  icon: "⊟", label: "Courses"     },
  { to: "/admin/enrollments", icon: "◎", label: "Enrollments" },
  { to: "/admin/payments",    icon: "★", label: "Payments"    },
  { to: "/admin/profile",     icon: "◐", label: "Profile"     },
  { to: "/admin/settings",    icon: "◉", label: "Settings"    },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${BASE}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setImgError(false);
      })
      .catch(() => {});
  }, []);

  const avatarUrl =
    profile?.avatar && !imgError ? `${BASE}/uploads/${profile.avatar}` : null;

  const initials = profile?.name
    ? profile.name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');

        .asb {
          width: 70px;
          height: 100vh;
          background: #0a0a0f;
          position: fixed;
          top: 0; left: 0;
          display: flex;
          flex-direction: column;
          padding: 18px 0;
          transition: width 0.32s cubic-bezier(.77,0,.18,1);
          overflow: hidden;
          z-index: 1000;
          border-right: 1px solid rgba(255,255,255,0.06);
          box-sizing: border-box;
        }
        .asb:hover { width: 210px; }

        /* brand block */
        .asb-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 14px 18px;
          text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 10px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .asb-logo {
          width: 42px; height: 42px;
          border-radius: 14px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #ec4899 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 700;
          color: white;
          box-shadow: 0 0 14px rgba(168,85,247,0.3);
          overflow: hidden;
          position: relative;
        }
        .asb-logo img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          position: absolute; inset: 0;
        }
        .asb-logo .asb-initials {
          position: relative; z-index: 1;
        }
        .asb-info {
          opacity: 0;
          transition: opacity 0.18s 0.08s;
          overflow: hidden;
        }
        .asb:hover .asb-info { opacity: 1; }
        .asb-name {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 2px;
          white-space: nowrap;
        }
        .asb-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          margin: 0;
          white-space: nowrap;
        }

        /* nav links */
        .asb-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 8px; }
        .asb-link {
          display: flex; align-items: center; gap: 13px;
          padding: 11px 6px 11px 6px;
          border-radius: 10px;
          text-decoration: none;
          color: rgba(255,255,255,0.45);
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 400;
          white-space: nowrap;
          transition: background 0.2s, color 0.2s;
          position: relative;
        }
        .asb-link:hover, .asb-link.active {
          background: rgba(168,85,247,0.12);
          color: #e2d9f3;
        }
        .asb-link.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(180deg,#a855f7,#ec4899);
        }
        .asb-icon {
          font-size: 19px;
          flex-shrink: 0;
          width: 26px;
          text-align: center;
          line-height: 1;
        }
        .asb-label {
          opacity: 0;
          transition: opacity 0.15s 0.06s;
          letter-spacing: 0.01em;
        }
        .asb:hover .asb-label { opacity: 1; }

        /* logout */
        .asb-bottom {
          padding: 0 8px;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin-top: 10px;
          padding-top: 10px;
        }
        .asb-logout {
          display: flex; align-items: center; gap: 13px;
          padding: 11px 6px;
          border-radius: 10px;
          border: none;
          background: rgba(239,68,68,0.12);
          color: #f87171;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s;
        }
        .asb-logout:hover { background: rgba(239,68,68,0.22); }
      `}</style>

      <div className="asb">
        {/* ── Brand / Admin Profile ── */}
        <Link to="/admin/profile" className="asb-brand">
          <div className="asb-logo">
            {avatarUrl && (
              <img src={avatarUrl} alt="avatar" onError={() => setImgError(true)} />
            )}
            <span className="asb-initials">{initials}</span>
          </div>
          <div className="asb-info">
            <p className="asb-name">{profile?.name || "Admin"}</p>
            <p className="asb-sub">Control Center</p>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <nav className="asb-nav">
          {navLinks.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`asb-link${location.pathname === to ? " active" : ""}`}
            >
              <span className="asb-icon">{icon}</span>
              <span className="asb-label">{label}</span>
            </Link>
          ))}
        </nav>

        {/* ── Logout ── */}
        <div className="asb-bottom">
          <button className="asb-logout" onClick={logout}>
            <span className="asb-icon">⏻</span>
            <span className="asb-label">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
