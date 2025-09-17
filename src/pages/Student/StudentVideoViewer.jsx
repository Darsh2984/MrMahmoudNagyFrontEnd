// src/pages/StudentVideoViewer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentVideoViewer() {
  const [yearId, setYearId] = useState("");
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState({ unitId: "", chapterId: "" });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

  // 🔹 Get year & teacher from backend using student ID
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "student") {
      fetchStudentYear(user.id);
    }
  }, []);

  const fetchStudentYear = async (studentId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/${studentId}/year`
      );
      if (res.data?.yearId) {
        setYearId(res.data.yearId._id);
        fetchVideos(res.data.yearId._id);
        fetchUnits(res.data.teacherId);
      }
    } catch (err) {
      console.error("❌ Error fetching student year:", err);
      setError("Failed to load your Year.");
    }
  };

  const fetchUnits = async (teacherId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/${teacherId}`
      );
      setUnits(res.data);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
    }
  };

  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`
      );
      setChapters(res.data);
    } catch (err) {
      console.error("❌ Error fetching chapters:", err);
    }
  };

  const fetchVideos = async (yearId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/video/year/${yearId}`
      );
      setVideos(res.data);
    } catch (err) {
      console.error("❌ Error fetching videos:", err);
      setError("Failed to load videos.");
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((v) => {
    if (filter.unitId && v.unitId?._id !== filter.unitId) return false;
    if (filter.chapterId && v.chapterId?._id !== filter.chapterId) return false;
    return true;
  });

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* === Sidebar === */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">🎓 Student</h2>
        <div className="sidebar-footer">
          <p>👤 {user?.name}</p>
        </div>
        <ul>
          <li onClick={() => navigate("/student-dashboard")}>🏠 Dashboard</li>
          <li onClick={() => navigate("/student-tasks")}>📋 My Tasks</li>
          <li onClick={() => navigate("/student-quizzes")}>📝 My Quizzes</li>
          <li onClick={() => navigate("/student-attendance")}>📊 My Attendance</li>
          <li onClick={() => navigate("/student-performance")}>📈 My Performance</li>
          <li onClick={() => navigate("/StudentVideoViewer")}>🎥 Course Videos</li>
          <li onClick={() => navigate("/MaterialViewer")}>📚 Course Materials</li>
        </ul>
      </aside>

      {/* === Main Content === */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">🎥 Course Videos</h2>
          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

          {/* 🔹 Filter Section */}
          <div style={styles.filterBox}>
            {/* Unit Selector */}
            <div style={styles.filterItem}>
              <label style={styles.label}>📦 Select Unit</label>
              <select
                style={styles.select}
                value={filter.unitId}
                onChange={(e) => {
                  const unitId = e.target.value;
                  setFilter({ unitId, chapterId: "" });
                  if (unitId) fetchChapters(unitId);
                  else setChapters([]);
                }}
              >
                <option value="">-- All Units --</option>
                {units.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Selector */}
            {chapters.length > 0 && (
              <div style={styles.filterItem}>
                <label style={styles.label}>📖 Select Chapter</label>
                <select
                  style={styles.select}
                  value={filter.chapterId}
                  onChange={(e) => setFilter({ ...filter, chapterId: e.target.value })}
                >
                  <option value="">-- All Chapters --</option>
                  {chapters.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 🔹 Videos */}
          {loading ? (
            <p style={styles.loading}>⏳ Loading videos...</p>
          ) : filteredVideos.length === 0 ? (
            <p style={styles.noData}>⚠️ No videos found</p>
          ) : (
            <div style={styles.videoGrid}>
              {filteredVideos.map((v) => (
                <div key={v._id} style={styles.card}>
                  <h4>{v.title}</h4>
                  <p>
                    <b>Unit:</b> {v.unitId?.name || "—"} <br />
                    <b>Chapter:</b> {v.chapterId?.name || "—"}
                  </p>
                  <video
                    src={`${process.env.REACT_APP_API_URL}${v.videoUrl}`}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    style={styles.video}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  filterBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "25px",
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    justifyContent: "center",
  },
  filterItem: { display: "flex", flexDirection: "column", minWidth: "220px" },
  label: { marginBottom: "6px", fontWeight: "bold", color: "#2c3e50" },
  select: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    background: "#fff",
  },
  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  video: { width: "100%", borderRadius: "6px" },
  loading: { textAlign: "center", fontWeight: "bold", color: "#555" },
  noData: { textAlign: "center", color: "#888" },
};
