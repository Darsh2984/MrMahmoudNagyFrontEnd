import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentMaterialViewer.css"; // ✅ new css file
import {
  UploadSimple,
  Trash,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowCounterClockwise,
  BookOpen,
  FileArrowUp,
} from "phosphor-react";

export default function StudentMaterialViewer() {
  const [yearId, setYearId] = useState("");
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState({ unitId: "", chapterId: "" });
  const [zoomLevels, setZoomLevels] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "student" && user.id) fetchStudentYear(user.id);
  }, []);

  const fetchStudentYear = async (studentId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/${studentId}/year`
      );
      if (res.data?.yearId) {
        const yrId = res.data.yearId._id;
        setYearId(yrId);
        fetchMaterials(yrId);
        fetchUnits(studentId, yrId);
      }
    } catch {
      setError("❌ Failed to load your Year.");
    }
  };

  const fetchUnits = async (studentId, yearId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/student/${studentId}/year/${yearId}/units`
      );
      setUnits(res.data);
    } catch {
      setError("❌ Failed to load units.");
    }
  };

  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`);
      setChapters(res.data);
    } catch {
      setError("❌ Failed to load chapters.");
    }
  };

  const fetchMaterials = async (yearId) => {
    setLoading(true);
    try {
      const studentId = user?.id;
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/material/student/${studentId}/year/${yearId}`
      );
      setMaterials(res.data);
    } catch {
      setError("❌ Failed to load materials.");
    } finally {
      setLoading(false);
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

  const filteredMaterials = materials.filter((m) => {
    if (filter.unitId && m.unitId?._id !== filter.unitId) return false;
    if (filter.chapterId && m.chapterId?._id !== filter.chapterId) return false;
    return true;
  });

  return (
    <div className="student-layout">
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`student-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <header className="dashboard-header">
          <h2>📑 Course Materials</h2>
          <p>View and study all provided course PDFs</p>
        </header>

        <section className="section-card">
          {error && <p className="error-msg">{error}</p>}

          {/* === Filters === */}
          <div className="filter-box">
            <div className="filter-item">
              <label>📘 Select Unit</label>
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
                <label>📖 Select Chapter</label>
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

          {/* === Materials === */}
          {loading ? (
            <p className="loading-msg">⏳ Loading materials...</p>
          ) : filteredMaterials.length === 0 ? (
            <p className="no-data">⚠️ No materials found</p>
          ) : (
            <div className="material-grid">
              {filteredMaterials.map((m) => {
                const zoom = zoomLevels[m._id] || 1;
                return (
                  <div key={m._id} className="material-card">
                    <h4>{m.title}</h4>
                    <p className="material-meta">
                      <b>Unit:</b> {m.unitId?.name || "—"} <br />
                      <b>Chapter:</b> {m.chapterId?.name || "—"}
                    </p>

                    <div className="zoom-controls">
                      <button onClick={() => handleZoom(m._id, "out")} title="Zoom Out">
                        <MagnifyingGlassMinus size={18} />
                      </button>
                      <button onClick={() => handleZoom(m._id, "in")} title="Zoom In">
                        <MagnifyingGlassPlus size={18} />
                      </button>
                      <button onClick={() => handleZoom(m._id, "reset")} title="Reset Zoom">
                        <ArrowCounterClockwise size={18} />
                      </button>
                    </div>

                    <div className="pdf-viewer-wrapper">
                      <iframe
                        src={`${m.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        title={m.title}
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: "0 0",
                        }}
                      ></iframe>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
