// src/pages/StudentMaterialViewer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar"; // import new sidebar


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

  // Load student's year on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "student" && user.id) {
      fetchStudentYear(user.id);
    }
  }, []);

  // Fetch student's year (and teacherId to load units)
  const fetchStudentYear = async (studentId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/${studentId}/year`
      );
if (res.data?.yearId) {
  setYearId(res.data.yearId._id);
  fetchMaterials(res.data.yearId._id);
  fetchUnits(studentId, res.data.yearId._id); // ✅ pass studentId + yearId
}

    } catch (err) {
      setError("❌ Failed to load your Year.");
    }
  };

// Fetch units for logged-in student
const fetchUnits = async (studentId, yearId) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/unit/student/${studentId}/year/${yearId}/units`
    );
    setUnits(res.data);
  } catch (err) {
    setError("❌ Failed to load units.");
  }
};



  // Fetch chapters by unit
  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`
      );
      setChapters(res.data);
    } catch (err) {
      setError("❌ Failed to load chapters.");
    }
  };

  // Fetch materials by year (filtered for this student)
const fetchMaterials = async (yearId) => {
  setLoading(true);
  try {
    const studentId = user?.id; // ✅ use logged-in student's ID
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/material/student/${studentId}/year/${yearId}`
    );
    setMaterials(res.data);
  } catch (err) {
    setError("❌ Failed to load materials.");
  } finally {
    setLoading(false);
  }
};

  // Zoom controls
  const handleZoom = (id, action) => {
    setZoomLevels((prev) => {
      const current = prev[id] || 1;
      if (action === "in") return { ...prev, [id]: Math.min(current + 0.2, 2) };
      if (action === "out") return { ...prev, [id]: Math.max(current - 0.2, 0.5) };
      if (action === "reset") return { ...prev, [id]: 1 };
      return prev;
    });
  };

  // Apply filters
  const filteredMaterials = materials.filter((m) => {
    if (filter.unitId && m.unitId?._id !== filter.unitId) return false;
    if (filter.chapterId && m.chapterId?._id !== filter.chapterId) return false;
    return true;
  });

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* === Sidebar === */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* === Main Content === */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📑 Course Materials</h2>
          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

          {/* Filters */}
          <div style={styles.filterBox}>
            {/* Unit Selector */}
            <div style={styles.filterItem}>
              <label style={styles.label}>📘 Unit</label>
              <select
                value={filter.unitId}
                onChange={(e) => {
                  const unitId = e.target.value;
                  setFilter({ ...filter, unitId, chapterId: "" });
                  if (unitId) fetchChapters(unitId);
                  else setChapters([]);
                }}
                style={styles.select}
              >
                {/* 👇 This "All Units" will only show student’s year units because units[] is already filtered */}
                <option value="">-- All Units of My Year --</option>
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
                <label style={styles.label}>📖 Chapter</label>
                <select
                  value={filter.chapterId}
                  onChange={(e) =>
                    setFilter({ ...filter, chapterId: e.target.value })
                  }
                  style={styles.select}
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
            <p>⏳ Loading materials...</p>
          ) : filteredMaterials.length === 0 ? (
            <p>⚠️ No materials found</p>
          ) : (
            <div style={styles.grid}>
              {filteredMaterials.map((m) => {
                const zoom = zoomLevels[m._id] || 1;
                return (
                  <div key={m._id} style={styles.card}>
                    <h4>{m.title}</h4>
                    <p>
                      <b>Unit:</b> {m.unitId?.name || "—"} <br />
                      <b>Chapter:</b> {m.chapterId?.name || "—"}
                    </p>

                    {/* Zoom Controls */}
                    <div style={styles.zoomControls}>
                      <button onClick={() => handleZoom(m._id, "out")} style={styles.zoomBtn}>
                        ➖
                      </button>
                      <button onClick={() => handleZoom(m._id, "in")} style={styles.zoomBtn}>
                        ➕
                      </button>
                      <button onClick={() => handleZoom(m._id, "reset")} style={styles.zoomBtn}>
                        🔄
                      </button>
                    </div>

                    {/* PDF Viewer */}
                    <div style={styles.viewerWrapper}>
                      <iframe
                        src={`${m.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                        title={m.title}
                        style={{
                          width: "100%",
                          height: "600px",
                          border: "none",
                          borderRadius: "6px",
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
        </div>
      </main>
    </div>
  );
}

const styles = {
  filterBox: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "10px",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  filterItem: { display: "flex", flexDirection: "column", flex: 1 },
  label: { marginBottom: "6px", fontWeight: "bold", color: "#34495e" },
  select: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    background: "#fff",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: "20px" },
  card: {
    background: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  zoomControls: { marginBottom: "8px", textAlign: "right" },
  zoomBtn: {
    marginLeft: "5px",
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    background: "#ecf0f1",
    cursor: "pointer",
    fontSize: "14px",
  },
  viewerWrapper: { overflow: "auto", border: "1px solid #ddd" },
};
