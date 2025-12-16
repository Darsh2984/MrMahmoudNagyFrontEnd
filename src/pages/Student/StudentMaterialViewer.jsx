import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentMaterialViewer.css";
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowCounterClockwise,
  BookOpen,
} from "phosphor-react";

export default function StudentMaterialViewer() {
  const [yearId, setYearId] = useState("");
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState({ unitId: "", chapterId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

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
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`
      );
      setChapters(res.data);
    } catch {
      setError("❌ Failed to load chapters.");
    }
  };

  const fetchMaterials = async (yearId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/material/student/${user.id}/year/${yearId}`
      );
      setMaterials(res.data);
    } catch {
      setError("❌ Failed to load materials.");
    } finally {
      setLoading(false);
    }
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
          <p>View and study all provided PDFs</p>
        </header>

        <section className="section-card">
          {error && <p className="error-msg">{error}</p>}

          {/* Filters */}
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
                  onChange={(e) =>
                    setFilter({ ...filter, chapterId: e.target.value })
                  }
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

          {/* Materials */}
          {loading ? (
            <p className="loading-msg">⏳ Loading materials...</p>
          ) : filteredMaterials.length === 0 ? (
            <p className="no-data">⚠️ No materials found</p>
          ) : (
            <div className="material-grid">
              {filteredMaterials.map((m) => (
                <div key={m._id} className="material-card">
                  <h4>{m.title}</h4>
                  <p className="material-meta">
                    <b>Unit:</b> {m.unitId?.name || "—"} <br />
                    <b>Chapter:</b> {m.chapterId?.name || "—"}
                  </p>

                  {/* Native PDF Viewer */}
                  <div className="pdf-native">
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-pdf-btn"
                    >
                      <BookOpen size={18} /> Open PDF (Fullscreen)
                    </a>

                    <object
                      data={m.fileUrl}
                      type="application/pdf"
                      width="100%"
                      height="500px"
                    >
                      <p>
                        PDF preview not supported.{" "}
                        <a href={m.fileUrl} target="_blank" rel="noreferrer">
                          Open PDF
                        </a>
                      </p>
                    </object>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
