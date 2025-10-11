import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TeacherSidebar from "../../components/TeacherSidebar";
import {
  VideoCamera,
  UploadSimple,
  Trash,
  FilmStrip,
  FilmSlate,
  FileArrowUp,
} from "phosphor-react";
import "./TeacherVideoManager.css";

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
  const [uploadType, setUploadType] = useState("file");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "teacher") {
      setTeacherId(user.id);
      fetchYears(user.id);
    }
  }, []);

  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch {
      toast.error("❌ Failed to load years");
    }
  };

  const fetchUnits = async (teacherId, yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/unit/${teacherId}/${yearId}`);
      setUnits(res.data);
    } catch {
      toast.error("❌ Failed to load units");
    }
  };

  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`);
      setChapters(res.data);
    } catch {
      toast.error("❌ Failed to load chapters");
    }
  };

  const fetchVideos = async (yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/video/year/${yearId}`);
      setVideos(res.data);
    } catch {
      toast.error("❌ Failed to load videos");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "video") setForm({ ...form, video: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.yearId || !form.unitId || !form.chapterId) {
      toast.warning("⚠️ All fields are required");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      if (uploadType === "url") {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/video/url`, {
          title: form.title,
          videoUrl: form.videoUrl,
          yearId: form.yearId,
          unitId: form.unitId,
          chapterId: form.chapterId,
          teacherId,
        });
      } else {
        if (!form.video) {
          toast.warning("⚠️ Please select a video file");
          setLoading(false);
          return;
        }

        const uploadId = Date.now().toString();
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("yearId", form.yearId);
        fd.append("unitId", form.unitId);
        fd.append("chapterId", form.chapterId);
        fd.append("teacherId", teacherId);
        fd.append("video", form.video);
        fd.append("uploadId", uploadId);

        const evtSource = new EventSource(
          `${process.env.REACT_APP_API_URL}/api/video/progress/${uploadId}`
        );
        evtSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setUploadProgress(data.progress);
          if (data.progress >= 100) evtSource.close();
        };

        await axios.post(`${process.env.REACT_APP_API_URL}/api/video`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("✅ Video uploaded successfully!");
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
    } catch {
      toast.error("❌ Failed to upload video");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 3000);
    }
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>🗑 Are you sure you want to delete this video?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            className="video-toast-btn-confirm"
            onClick={async () => {
              try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/video/${id}`);
                toast.dismiss();
                fetchVideos(form.yearId);
                toast.success("✅ Video deleted successfully");
              } catch {
                toast.dismiss();
                toast.error("❌ Failed to delete video");
              }
            }}
          >
            Confirm
          </button>
          <button className="video-toast-btn-cancel" onClick={() => toast.dismiss()}>
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, position: "top-center" }
    );
  };

  return (
    <div className={`video-layout ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="video-container">
        {/* Upload Section */}
        <div className="video-section-card">
          <h2 className="video-title">
            <VideoCamera size={22} color="#0b3c49" weight="fill" /> Manage Course Videos
          </h2>

          <form onSubmit={handleUpload} className="video-form-grid">
            <input
              type="text"
              name="title"
              placeholder="Video Title"
              value={form.title}
              onChange={handleChange}
              className="video-input"
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
              className="video-input"
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
                if (unitId) fetchChapters(unitId);
              }}
              className="video-input"
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
              className="video-input"
              disabled={!form.unitId}
            >
              <option value="">-- Select Chapter --</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="video-toggle">
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
                className="video-input"
              />
            ) : (
              <input
                type="text"
                name="videoUrl"
                placeholder="Paste Bunny CDN Video URL"
                value={form.videoUrl}
                onChange={handleChange}
                className="video-input"
              />
            )}

            <button type="submit" disabled={loading} className="video-btn video-btn-blue">
              {loading ? "Uploading..." : <><UploadSimple size={18} /> Save Video</>}
            </button>
          </form>

          {loading && uploadType === "file" && (
            <div className="video-progress">
              <p>Uploading... {uploadProgress}%</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Video List */}
        <div className="video-section-card">
          <h2 className="video-title">
            <FilmStrip size={22} weight="fill" color="#8baa91" /> Uploaded Videos
          </h2>
          {videos.length === 0 ? (
            <p className="video-empty">No videos uploaded yet.</p>
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
                  <button onClick={() => handleDelete(v._id)} className="video-btn video-btn-red">
                    <Trash size={16} /> Delete
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
