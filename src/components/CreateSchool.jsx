import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AppStyles.css";

function CreateSchool({ teacherId }) {
  const [schools, setSchools] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [collapsed, setCollapsed] = useState(false); // ✅ collapsible state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // ✅ track which school is pending delete

  useEffect(() => {
    if (teacherId) fetchSchools();
  }, [teacherId]);

  const fetchSchools = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/school/${teacherId}`
      );
      // ✅ Sort alphabetically
      const sorted = res.data.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      setSchools(sorted);
    } catch (err) {
      console.error("❌ Error fetching schools:", err);
      toast.error("❌ Failed to load schools");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      toast.warn("⚠️ School name cannot be empty");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/school`, {
        name: schoolName,
        teacherId,
      });
      setSchoolName("");
      toast.success("✅ School created successfully");
      fetchSchools();
    } catch (err) {
      console.error("❌ Error creating school:", err);
      toast.error("❌ Failed to create school");
    }
  };

  const confirmDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/school/${id}`);
      toast.success("🗑 School deleted successfully");
      setConfirmDeleteId(null); // reset state
      fetchSchools();
    } catch (err) {
      console.error("❌ Error deleting school:", err);
      toast.error("❌ Failed to delete school");
    }
  };

  return (
    <div className="section-card">
      <div className="school-header">
        <h3>🏫 Manage Schools</h3>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "▼ Expand" : "▲ Collapse"}
        </button>
      </div>

      <form onSubmit={handleCreate} style={{ marginBottom: "15px" }}>
        <input
          type="text"
          placeholder="Enter School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="styled-input"
        />
        <button type="submit" className="btn btn-purple">
          Add School
        </button>
      </form>

      {!collapsed && (
        <div className="school-list">
          {schools.length === 0 ? (
            <p>No schools added yet.</p>
          ) : (
            schools.map((school) => (
              <div key={school._id} className="school-row">
                <span className="school-name">{school.name}</span>

                {confirmDeleteId === school._id ? (
                  <div className="confirm-delete">
                    <button
                      onClick={() => confirmDelete(school._id)}
                      className="btn btn-red small-btn"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="btn btn-blue small-btn"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(school._id)}
                    className="btn btn-danger small-btn"
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CreateSchool;
