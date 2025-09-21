import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/AppStyles.css";
import TeacherSidebar from "../../components/TeacherSidebar"; // ✅ import new sidebar


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
    videoUrl: "",
  });

  const [uploadType, setUploadType] = useState("file"); // "file" or "url"
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
    if (!form.title || !form.yearId || !form.unitId || !form.chapterId) {
      toast.warn("⚠️ All fields are required");
      return setError("⚠️ All fields are required");
    }

    setLoading(true);
    setError("");
    setUploadProgress(0);

    try {
      if (uploadType === "url") {
        // ✅ Directly save URL
        await axios.post(`${process.env.REACT_APP_API_URL}/api/video/url`, {
          title: form.title,
          videoUrl: form.videoUrl,
          yearId: form.yearId,
          unitId: form.unitId,
          chapterId: form.chapterId,
          teacherId,
        });
      } else {
        // ✅ Upload file
        const uploadId = Date.now().toString();
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("yearId", form.yearId);
        formData.append("unitId", form.unitId);
        formData.append("chapterId", form.chapterId);
        formData.append("teacherId", teacherId);
        formData.append("video", form.video);
        formData.append("uploadId", uploadId);

        // Start SSE listener
        const evtSource = new EventSource(
          `${process.env.REACT_APP_API_URL}/api/video/progress/${uploadId}`
        );
        evtSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setUploadProgress(data.progress);
          if (data.progress >= 100) {
            evtSource.close();
          }
        };

        await axios.post(`${process.env.REACT_APP_API_URL}/api/video`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
      }

      setForm({
        title: "",
        yearId: "",
        unitId: "",
        chapterId: "",
        video: null,
        videoUrl: "",
      });
      setUnits([]);
      setChapters([]);
      fetchVideos(form.yearId);

      toast.success("✅ Video added successfully!");
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Failed to add video.");
      toast.error("❌ Failed to add video");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 3000);
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
       {/* ✅ Sidebar extracted */}
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="page-container">
        <div className="section-card">
          <h3 className="card-title">🎥 Manage Course Videos</h3>
          <br />

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleUpload} className="form-grid">
            <input
              type="text"
              name="title"
              placeholder="Video Title"
              value={form.title}
              onChange={handleChange}
              className="styled-input"
            />

            {/* Year Dropdown */}
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

            {/* Unit Dropdown */}
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

            {/* Chapter Dropdown */}
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

            {/* Upload Type Toggle */}
            <div className="form-toggle">
              <label>
                <input
                  type="radio"
                  value="file"
                  checked={uploadType === "file"}
                  onChange={() => setUploadType("file")}
                />{" "}
                Upload File
              </label>
              <label>
                <input
                  type="radio"
                  value="url"
                  checked={uploadType === "url"}
                  onChange={() => setUploadType("url")}
                />{" "}
                Use URL
              </label>
            </div>

            {uploadType === "file" ? (
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleChange}
                className="styled-input"
              />
            ) : (
              <input
                type="text"
                name="videoUrl"
                placeholder="Paste Bunny CDN URL"
                value={form.videoUrl}
                onChange={handleChange}
                className="styled-input"
              />
            )}

            <button type="submit" disabled={loading} className="btn btn-orange">
              {loading ? "⏳ Uploading..." : "📤 Save Video"}
            </button>
          </form>

          {/* Progress Bar */}
          {loading && uploadType === "file" && (
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
