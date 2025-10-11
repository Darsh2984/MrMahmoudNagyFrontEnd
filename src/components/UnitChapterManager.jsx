import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  BookOpen,
  PlusCircle,
  PencilSimple,
  Trash,
  ArrowsClockwise,
  Books,
} from "phosphor-react";
import TeacherSidebar from "./TeacherSidebar";
import "react-toastify/dist/ReactToastify.css";
import "./UnitChapterManager.css"; // ✅ new CSS file

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
  const teacherId = user.realTeacherId || user.id;

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
      toast.success("✅ Unit added successfully");
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
      toast.success("✅ Unit updated successfully");
      setEditingUnit(null);
      fetchUnits();
    } catch (err) {
      console.error("❌ Error updating unit:", err);
      toast.error("❌ Failed to update unit");
    }
  };

  const deleteUnit = async (unitId) => {
    toast.info("🗑 Deleting unit...");
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
      toast.success("✅ Chapter added successfully");
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
      toast.success("✅ Chapter updated successfully");
      setEditingChapter(null);
      fetchUnits();
    } catch (err) {
      console.error("❌ Error updating chapter:", err);
      toast.error("❌ Failed to update chapter");
    }
  };

  const deleteChapter = async (chapterId) => {
    toast.info("🗑 Deleting chapter...");
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
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="unitmanager-container">
        <div className="unitmanager-header">
          <div className="header-title">
            <Books size={26} weight="duotone" color="#0b3c49" />
            <h2>Manage Units & Chapters</h2>
          </div>
          <button className="btn-refresh" onClick={fetchYears}>
            <ArrowsClockwise size={18} /> Refresh
          </button>
        </div>

        {/* Year Selection */}
        <div className="form-section">
          <label className="field-label">
            <BookOpen size={18} /> Select Year
          </label>
          <select
            className="styled-select"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              localStorage.setItem("yearId", e.target.value);
            }}
          >
            <option value="">-- Select Year --</option>
            {years.map((y) => (
              <option key={y._id} value={y._id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>

        {/* Add Unit */}
        {selectedYear && (
          <div className="form-inline add-unit">
            <input
              type="text"
              placeholder="Enter Unit Name"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              className="styled-input"
            />
            <button onClick={addUnit} className="btn btn-green">
              <PlusCircle size={18} /> Add Unit
            </button>
          </div>
        )}

        {/* Units */}
        <div className="unit-list">
          {units.length === 0 ? (
            <p className="text-muted">No units created yet.</p>
          ) : (
            units.map((u) => (
              <div key={u._id} className="unit-card">
                <div className="unit-header">
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
                      <button
                        onClick={() => setEditingUnit(null)}
                        className="btn btn-grey"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h4>{u.name}</h4>
                      <div className="unit-actions">
                        <button onClick={() => setEditingUnit(u)} className="btn btn-blue small-btn">
                          <PencilSimple size={16} /> Edit
                        </button>
                        <button onClick={() => deleteUnit(u._id)} className="btn btn-red small-btn">
                          <Trash size={16} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

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
                        <div className="chapter-row">
                          <span>{c.name}</span>
                          <div>
                            <button
                              onClick={() => setEditingChapter(c)}
                              className="btn btn-blue small-btn"
                            >
                              <PencilSimple size={14} /> Edit
                            </button>
                            <button
                              onClick={() => deleteChapter(c._id)}
                              className="btn btn-red small-btn"
                            >
                              <Trash size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Add Chapter */}
                <div className="form-inline add-chapter">
                  <input
                    type="text"
                    placeholder="New Chapter"
                    value={newChapter[u._id] || ""}
                    onChange={(e) =>
                      setNewChapter({ ...newChapter, [u._id]: e.target.value })
                    }
                    className="styled-input"
                  />
                  <button onClick={() => addChapter(u._id)} className="btn btn-green small-btn">
                    <PlusCircle size={16} /> Add Chapter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default UnitChapterManager;
