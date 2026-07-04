import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import Sidebar from "../components/Sidebar";

function Dashboard() {
  const nav = useNavigate();

  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      // 📊 courses
      const courseRes = await axios.get(
        "http://localhost:5000/api/courses",
        { headers: { Authorization: token } }
      );
      setCourses(courseRes.data);

      // 👤 profile
      try {
        const profileRes = await axios.get(
          "http://localhost:5000/api/profile/me",
          { headers: { Authorization: token } }
        );

        setProfile(profileRes.data);
        setForm(profileRes.data || {});
      } catch {
        setProfile(null);
      }
    };

    fetchData();
  }, []);

  // 📊 Chart
  const chartData = courses.map(c => ({
    name: c.title,
    progress: c.progress || 0
  }));

  const total = courses.length;
  const completed = courses.filter(c => c.progress >= 80).length;
  const pending = courses.filter(c => c.progress < 50).length;

  // ✏️ Update profile
  const updateProfile = async () => {
    const token = localStorage.getItem("token");

    await axios.put(
  "http://localhost:5000/api/profile/update",
  form,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
    setShowModal(false);
    window.location.reload();
  };

  return (
    <div style={{ display: "flex" }}>

      {/* 🔥 SIDEBAR */}
      <Sidebar />

      <div className="main" style={{ width: "100%" }}>

        {/* 🔝 TOP BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1>Dashboard</h1>

          {/* 🔥 MAIN LOGIC */}
          {profile ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
              onClick={() => setShowModal(true)}
            >
              <img
                src={`http://localhost:5000/uploads/${profile.avatar}`}
                width="40"
                height="40"
                style={{ borderRadius: "50%" }}
              />
              <span>{profile.name}</span>
            </div>
          ) : (
            <button
              onClick={() => nav("/profile-create")}
              style={{
                padding: "10px 15px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(90deg,#00dbde,#fc00ff)",
                color: "white",
                cursor: "pointer"
              }}
            >
              ➕ Create Profile
            </button>
          )}
        </div>

        {/* ⚠️ OPTIONAL MESSAGE */}
        {!profile && (
          <div className="card">
            <h3>⚠️ Please create your profile to continue</h3>
          </div>
        )}

        {/* 🔢 STATS */}
        <div className="grid">
          <div className="card"><h3>Total</h3><p>{total}</p></div>
          <div className="card"><h3>Completed</h3><p>{completed}</p></div>
          <div className="card"><h3>Pending</h3><p>{pending}</p></div>
        </div>

        {/* 📊 CHART */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Course Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 📚 COURSES */}
        <div style={{ marginTop: "20px" }}>
          <h3>Your Courses</h3>
          <div className="grid">
            {courses.map(c => (
              <div className="card" key={c._id}>
                <h4>{c.name}</h4>
                <p>{c.progress || 0}%</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ✏️ EDIT PROFILE MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Profile</h3>

            <input
              value={form.name || ""}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
            />

            <input
              value={form.phone || ""}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
            />

            <input
              value={form.schoolName || ""}
              onChange={e => setForm({ ...form, schoolName: e.target.value })}
              placeholder="School"
            />

            <button onClick={updateProfile}>Save</button>
            <button className="close" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;