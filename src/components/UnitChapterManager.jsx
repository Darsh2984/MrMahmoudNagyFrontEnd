import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/AppStyles.css";

function UnitChapterManager() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(localStorage.getItem("yearId") || "");
  const [units, setUnits] = useState([]);
  const [newUnit, setNewUnit] = useState("");
  const [newChapter, setNewChapter] = useState({});
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.id;
  const navigate = useNavigate();

  // Load teacher's years
  useEffect(() => {
    if (teacherId) fetchYears();
  }, [teacherId]);

  const fetchYears = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch (err) {
      console.error("❌ Error fetching years:", err);
      toast.error("❌ Failed to load years");
    }
  };

  // Fetch units for selected year
  useEffect(() => {
    if (teacherId && selectedYear) fetchUnits();
  }, [teacherId, selectedYear]);

  const fetchUnits = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/${teacherId}/${selectedYear}`
      );
      setUnits(res.data);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
      toast.error("❌ Failed to load units");
    }
  };

  // === UNITS ===
  const addUnit = async () => {
    if (!newUnit) return toast.warn("⚠️ Enter unit name");
    if (!selectedYear) return toast.warn("⚠️ Select a year first");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/unit`, {
        name: newUnit,
        teacherId,
        yearId: selectedYear,
      });
      setNewUnit("");
      toast.success("✅ Unit added");
      fetchUnits();
    } catch (err) {
      console.error("❌ Error creating unit:", err);
      toast.error("❌ Failed to create unit");
    }
  };

  const updateUnit = async (unitId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/unit/${unitId}`, {
        name: editingUnit.name,
      });
      toast.success("✅ Unit updated");
      setEditingUnit(null);
      fetchUnits();
    } catch (err) {
      console.error("❌ Error updating unit:", err);
      toast.error("❌ Failed to update unit");
    }
  };

  const deleteUnit = async (unitId) => {
    if (!window.confirm("Are you sure you want to delete this unit and all its chapters?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/unit/${unitId}`);
      toast.success("✅ Unit deleted");
      fetchUnits();
    } catch (err) {
      console.error("❌ Error deleting unit:", err);
      toast.error("❌ Failed to delete unit");
    }
  };

  // === CHAPTERS ===
  const addChapter = async (unitId) => {
    if (!newChapter[unitId]) return toast.warn("⚠️ Enter chapter name");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/chapter`, {
        name: newChapter[unitId],
        unitId,
      });
      setNewChapter({ ...newChapter, [unitId]: "" });
      toast.success("✅ Chapter added");
      fetchUnits();
    } catch (err) {
      console.error("❌ Error creating chapter:", err);
      toast.error("❌ Failed to create chapter");
    }
  };

  const updateChapter = async (chapterId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/chapter/${chapterId}`, {
        name: editingChapter.name,
      });
      toast.success("✅ Chapter updated");
      setEditingChapter(null);
      fetchUnits();
    } catch (err) {
      console.error("❌ Error updating chapter:", err);
      toast.error("❌ Failed to update chapter");
    }
  };

  const deleteChapter = async (chapterId) => {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/chapter/${chapterId}`);
      toast.success("✅ Chapter deleted");
      fetchUnits();
    } catch (err) {
      console.error("❌ Error deleting chapter:", err);
      toast.error("❌ Failed to delete chapter");
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* === Sidebar === */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">📚 Dashboard</h2>
        <ul>
          <li onClick={() => navigate("/teacher-dashboard")}>🏠 Home</li>
          <li onClick={() => navigate("/manage-units")}>📘 Units & Chapters</li>
          <li onClick={() => navigate("/questions")}>📋 Questions</li>
          <li onClick={() => navigate("/createquiz")}>📝 Create Quiz</li>
          <li onClick={() => navigate("/quizlist")}>📑 Quiz Lists</li>
          <li onClick={() => navigate("/studentsperformance")}>📊 Performance</li>
          <li onClick={() => navigate("/teacher-tasks")}>📂 Tasks & Homework</li>
          <li onClick={() => navigate("/videomanager")}>📽 Upload Videos</li>
          <li onClick={() => navigate("/PDFManager")}>📃 Upload Course Materials</li>
        </ul>
      </aside>

      {/* === Main Content === */}
      <main className="page-container">
        <div className="section-card">
          <h3 className="card-title">📘 Manage Units & Chapters</h3>

          {/* Select Year */}
          <div className="form-inline">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                localStorage.setItem("yearId", e.target.value);
              }}
              className="styled-input"
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Unit */}
          {selectedYear && (
            <div className="form-inline" style={{ marginTop: "15px" }}>
              <input
                type="text"
                placeholder="Enter Unit Name"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="styled-input"
              />
              <button onClick={addUnit} className="btn btn-purple">
                Add Unit
              </button>
            </div>
          )}

          {/* Units List */}
          <ul className="unit-list">
            {units.map((u) => (
              <li key={u._id} className="unit-card">
                {editingUnit && editingUnit._id === u._id ? (
                  <div className="form-inline">
                    <input
                      type="text"
                      value={editingUnit.name}
                      onChange={(e) =>
                        setEditingUnit({ ...editingUnit, name: e.target.value })
                      }
                      className="styled-input"
                    />
                    <button onClick={() => updateUnit(u._id)} className="btn btn-green">
                      Save
                    </button>
                    <button onClick={() => setEditingUnit(null)} className="btn btn-purple">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="unit-header">
                    <b>{u.name}</b>
                    <div>
                      <button
                        onClick={() => setEditingUnit(u)}
                        className="btn btn-blue small-btn"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteUnit(u._id)}
                        className="btn btn-purple small-btn"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )}

                {/* Chapters */}
                <ul className="chapter-list">
                  {(u.chapters || []).map((c) => (
                    <li key={c._id} className="chapter-item">
                      {editingChapter && editingChapter._id === c._id ? (
                        <div className="form-inline">
                          <input
                            type="text"
                            value={editingChapter.name}
                            onChange={(e) =>
                              setEditingChapter({ ...editingChapter, name: e.target.value })
                            }
                            className="styled-input"
                          />
                          <button
                            onClick={() => updateChapter(c._id)}
                            className="btn btn-green small-btn"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingChapter(null)}
                            className="btn btn-grey small-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="chapter-header">
                          <span>{c.name}</span>
                          <div>
                            <button
                              onClick={() => setEditingChapter(c)}
                              className="btn btn-blue small-btn"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => deleteChapter(c._id)}
                              className="btn btn-purple small-btn"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Add Chapter */}
                <div className="form-inline">
                  <input
                    type="text"
                    placeholder="New Chapter"
                    value={newChapter[u._id] || ""}
                    onChange={(e) =>
                      setNewChapter({ ...newChapter, [u._id]: e.target.value })
                    }
                    className="styled-input"
                  />
                  <button onClick={() => addChapter(u._id)} className="btn btn-green">
                    Add Chapter
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default UnitChapterManager;
