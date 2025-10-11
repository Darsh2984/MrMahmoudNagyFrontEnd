import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentVideoViewer.css"; // ✅ new css file

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

  useEffect(() => {
    if (user?.role === "student") fetchStudentYear(user.id);
  }, []);

  const fetchStudentYear = async (studentId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/student/${studentId}/year`);
      if (res.data?.yearId) {
        const yrId = res.data.yearId._id;
        setYearId(yrId);
        fetchVideos(yrId);
        fetchUnits(studentId, yrId);
      }
    } catch (err) {
      console.error("❌ Error fetching student year:", err);
      setError("Failed to load your Year.");
    }
  };

  const fetchUnits = async (studentId, yearId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/student/${studentId}/year/${yearId}/units`
      );
      setUnits(res.data);
    } catch {
      setError("Failed to load units.");
    }
  };

  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`);
      setChapters(res.data);
    } catch (err) {
      console.error("❌ Error fetching chapters:", err);
    }
  };

  const fetchVideos = async (yearId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/video/year/${yearId}`);
      setVideos(res.data);
    } catch {
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
    <div className="student-layout">
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`student-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <header className="dashboard-header">
          <h2>Course Videos</h2>
          <p>Watch your recorded lessons by unit and chapter</p>
        </header>

        <section className="section-card">
          {error && <p className="error-msg">{error}</p>}

          {/* === Filter Section === */}
          <div className="filter-box">
            <div className="filter-item">
              <label>Select Unit</label>
              <select
                value={filter.unitId}
                onChange={(e) => {
                  const unitId = e.target.value;
                  setFilter({ unitId, chapterId: "" });
                  unitId ? fetchChapters(unitId) : setChapters([]);
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

            {chapters.length > 0 && (
              <div className="filter-item">
                <label>Select Chapter</label>
                <select
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

          {/* === Videos === */}
          {loading ? (
            <p className="loading-msg">⏳ Loading videos...</p>
          ) : filteredVideos.length === 0 ? (
            <p className="no-data">⚠️ No videos found</p>
          ) : (
            <div className="video-grid">
              {filteredVideos.map((v) => (
                <div key={v._id} className="video-card">
                  <h4>{v.title}</h4>
                  <p className="video-meta">
                    <b>Unit:</b> {v.unitId?.name || "—"} <br />
                    <b>Chapter:</b> {v.chapterId?.name || "—"}
                  </p>
                  <video
                    src={v.videoUrl}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    className="video-player"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
