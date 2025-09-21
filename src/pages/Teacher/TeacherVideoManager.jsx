import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/AppStyles.css";

export default function TeacherVideoManager() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);

  const [form, setForm] = useState({
    title: "",
    yearId: "",
    unitId: "",
    chapterId: "",
    video: null,
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "teacher") {
      setTeacherId(user.id);
      fetchYears(user.id);
    }
  }, []);

  // Fetch teacher's years
  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch (err) {
      console.error("❌ Error fetching years:", err);
      setError("Failed to load years.");
      toast.error("❌ Failed to load years");
    }
  };

  // Fetch units for selected year
  const fetchUnits = async (teacherId, yearId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/${teacherId}/${yearId}`
      );
      setUnits(res.data);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
      setError("Failed to load units.");
      toast.error("❌ Failed to load units");
    }
  };

  // Fetch chapters for selected unit
  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`);
      setChapters(res.data);
    } catch (err) {
      console.error("❌ Error fetching chapters:", err);
      setError("Failed to load chapters.");
      toast.error("❌ Failed to load chapters");
    }
  };

  // Fetch videos by year
  const fetchVideos = async (yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/video/year/${yearId}`);
      setVideos(res.data);
    } catch (err) {
      console.error("❌ Error fetching videos:", err);
      setError("Failed to load videos.");
      toast.error("❌ Failed to load videos");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "video") {
      setForm({ ...form, video: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.yearId || !form.unitId || !form.chapterId || !form.video) {
      toast.warn("⚠️ All fields are required");
      return setError("⚠️ All fields are required");
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("yearId", form.yearId);
      formData.append("unitId", form.unitId);
      formData.append("chapterId", form.chapterId);
      formData.append("teacherId", teacherId);
      formData.append("video", form.video);

      await axios.post(`${process.env.REACT_APP_API_URL}/api/video`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      setForm({ title: "", yearId: "", unitId: "", chapterId: "", video: null });
      setUnits([]);
      setChapters([]);
      fetchVideos(form.yearId);

      toast.success("✅ Video uploaded successfully!");
    } catch (err) {
      console.error("❌ Error uploading video:", err);
      setError("Failed to upload video.");
      toast.error("❌ Failed to upload video");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/video/${id}`);
      fetchVideos(form.yearId);
      toast.success("🗑 Video deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting video:", err);
      setError("Failed to delete video.");
      toast.error("❌ Failed to delete video");
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* === Sidebar === */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">📽 Teacher</h2>
        <ul>
          <li onClick={() => navigate("/teacher-dashboard")}>🏠 Home</li>
          <li onClick={() => navigate("/manage-units")}>📘 Units & Chapters</li>
          <li onClick={() => navigate("/questions")}>📋 Questions</li>
          <li onClick={() => navigate("/createquiz")}>📝 Create Quiz</li>
          <li onClick={() => navigate("/quizlist")}>📑 Quiz Lists</li>
          <li onClick={() => navigate("/studentsperformance")}>📊 Performance</li>
          <li onClick={() => navigate("/teacher-tasks")}>📂 Tasks & Homework</li>
          <li className="active">📽 Upload Videos</li>
          <li onClick={() => navigate("/PDFManager")}>📃 Upload Course Materials</li>
        </ul>
      </aside>

      {/* === Main Content === */}
      <main className="page-container">
        <div className="section-card">
          <h3 className="card-title">🎥 Manage Course Videos</h3>
          <br />

          {error && <p className="error-text">{error}</p>}

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="form-grid">
            <input
              type="text"
              name="title"
              placeholder="Video Title"
              value={form.title}
              onChange={handleChange}
              className="styled-input"
            />

            <select
              name="yearId"
              value={form.yearId}
              onChange={(e) => {
                const yearId = e.target.value;
                setForm({ ...form, yearId, unitId: "", chapterId: "" });
                setUnits([]);
                setChapters([]);
                if (yearId) {
                  fetchVideos(yearId);
                  fetchUnits(teacherId, yearId);
                }
              }}
              className="styled-input"
            >
              <option value="">-- Select Year --</option>
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name}
                </option>
              ))}
            </select>

            <select
              name="unitId"
              value={form.unitId}
              onChange={(e) => {
                const unitId = e.target.value;
                setForm({ ...form, unitId, chapterId: "" });
                setChapters([]);
                if (unitId) {
                  fetchChapters(unitId);
                }
              }}
              className="styled-input"
              disabled={!form.yearId}
            >
              <option value="">-- Select Unit --</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              name="chapterId"
              value={form.chapterId}
              onChange={handleChange}
              className="styled-input"
              disabled={!form.unitId}
            >
              <option value="">-- Select Chapter --</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="file"
              name="video"
              accept="video/*"
              onChange={handleChange}
              className="styled-input"
            />

            <button type="submit" disabled={loading} className="btn btn-orange">
              {loading ? "⏳ Uploading..." : "📤 Upload Video"}
            </button>
          </form>

          {/* Upload Progress Bar */}
          {loading && (
            <div className="upload-progress">
              <p>Uploading... {uploadProgress}%</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Video List */}
        <div className="section-card">
          <h3 className="card-title">📚 Uploaded Videos</h3>
          {videos.length === 0 ? (
            <p>No videos uploaded yet.</p>
          ) : (
            <div className="video-grid">
              {videos.map((v) => (
                <div key={v._id} className="video-card">
                  <h4>{v.title}</h4>
                  <p>
                    <b>Unit:</b> {v.unitId?.name} <br />
                    <b>Chapter:</b> {v.chapterId?.name}
                  </p>
                  <video
                    src={v.videoUrl}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    style={{ width: "100%", borderRadius: "6px" }}
                  />
                  <button
                    onClick={() => handleDelete(v._id)}
                    className="btn btn-red small-btn"
                  >
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
