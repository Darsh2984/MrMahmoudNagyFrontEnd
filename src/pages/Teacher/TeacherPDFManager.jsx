import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/AppStyles.css";

export default function TeacherMaterialManager() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [form, setForm] = useState({
    title: "",
    yearId: "",
    unitId: "",
    chapterId: "",
    file: null,
  });

  const [zoomLevels, setZoomLevels] = useState({});
  const [loading, setLoading] = useState(false);
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

  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch {
      setError("Failed to load years.");
    }
  };

  const fetchUnits = async (teacherId, yearId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/${teacherId}/${yearId}`
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
    } catch {
      setError("Failed to load chapters.");
    }
  };

  const fetchMaterials = async (yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/material/year/${yearId}`);
      setMaterials(res.data);
    } catch {
      setError("Failed to load materials.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") setForm({ ...form, file: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.yearId || !form.unitId || !form.chapterId || !form.file) {
      return setError("⚠️ All fields are required");
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("teacherId", teacherId);

      await axios.post(`${process.env.REACT_APP_API_URL}/api/material`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({ title: "", yearId: "", unitId: "", chapterId: "", file: null });
      setUnits([]);
      setChapters([]);
      fetchMaterials(form.yearId);
    } catch {
      setError("❌ Failed to upload PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/material/${id}`);
      fetchMaterials(form.yearId);
    } catch {
      setError("❌ Failed to delete PDF.");
    }
  };

  const handleZoom = (id, action) => {
    setZoomLevels((prev) => {
      const current = prev[id] || 1;
      if (action === "in") return { ...prev, [id]: Math.min(current + 0.2, 2) };
      if (action === "out") return { ...prev, [id]: Math.max(current - 0.2, 0.5) };
      if (action === "reset") return { ...prev, [id]: 1 };
      return prev;
    });
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* === Sidebar === */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">📃 Teacher</h2>
        <ul>
          <li onClick={() => navigate("/teacher-dashboard")}>🏠 Home</li>
          <li onClick={() => navigate("/manage-units")}>📘 Units & Chapters</li>
          <li onClick={() => navigate("/questions")}>📋 Questions</li>
          <li onClick={() => navigate("/createquiz")}>📝 Create Quiz</li>
          <li onClick={() => navigate("/quizlist")}>📑 Quiz Lists</li>
          <li onClick={() => navigate("/studentsperformance")}>📊 Performance</li>
          <li onClick={() => navigate("/teacher-tasks")}>📂 Tasks & Homework</li>
          <li onClick={() => navigate("/videomanager")}>📽 Upload Videos</li>
          <li className="active">📃 Upload Course Materials</li>
        </ul>
      </aside>

      {/* === Main Content === */}
      <main className="page-container">
        <div className="section-card">
          <h3 className="card-title">📑 Manage Course Materials</h3>
          <br />
          {error && <p className="error-text">{error}</p>}

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="form-grid">
            <input
              type="text"
              name="title"
              placeholder="PDF Title"
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
                  fetchMaterials(yearId);
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

            <input
              type="file"
              name="file"
              accept="application/pdf"
              onChange={handleChange}
              className="styled-input"
            />

            <button type="submit" disabled={loading} className="btn btn-purple">
              {loading ? "⏳ Uploading..." : "📤 Upload PDF"}
            </button>
          </form>
        </div>

        {/* Material List */}
        <div className="section-card">
          <h3 className="card-title">📚 Uploaded Materials</h3>
          {materials.length === 0 ? (
            <p>No materials uploaded yet.</p>
          ) : (
            <div className="video-grid">
              {materials.map((m) => {
                const zoom = zoomLevels[m._id] || 1;
                return (
                  <div key={m._id} className="video-card">
                    <h4>{m.title}</h4>
                    <p>
                      <b>Unit:</b> {m.unitId?.name} <br />
                      <b>Chapter:</b> {m.chapterId?.name}
                    </p>

                    {/* Zoom Controls */}
                    <div className="form-inline" style={{ justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleZoom(m._id, "out")}
                        className="btn btn-grey small-btn"
                      >
                        ➖
                      </button>
                      <button
                        onClick={() => handleZoom(m._id, "in")}
                        className="btn btn-grey small-btn"
                      >
                        ➕
                      </button>
                      <button
                        onClick={() => handleZoom(m._id, "reset")}
                        className="btn btn-grey small-btn"
                      >
                        🔄
                      </button>
                    </div>

                    {/* PDF Viewer */}
                    <div className="pdf-viewer">
                      <iframe
                        src={`${process.env.REACT_APP_API_URL}/api/material/stream/${m._id}#toolbar=0&navpanes=0&scrollbar=0`}
                        title={m.title}
                        style={{
                          width: "100%",
                          height: "500px",
                          border: "none",
                          transform: `scale(${zoom})`,
                          transformOrigin: "0 0",
                        }}
                      ></iframe>
                    </div>

                    <button
                      onClick={() => handleDelete(m._id)}
                      className="btn btn-purple small-btn"
                    >
                      🗑 Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
