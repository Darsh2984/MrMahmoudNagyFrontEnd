import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AppStyles.css";

function CreateSchool({ teacherId }) {
  const [schools, setSchools] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [collapsed, setCollapsed] = useState(false); // ✅ collapsible state

  useEffect(() => {
    if (teacherId) fetchSchools();
  }, [teacherId]);

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/school/${teacherId}`);
      setSchools(res.data);
    } catch (err) {
      console.error("❌ Error fetching schools:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/school`, {
        name: schoolName,
        teacherId,
      });
      setSchoolName("");
      fetchSchools();
    } catch (err) {
      console.error("❌ Error creating school:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/school/${id}`);
      fetchSchools();
    } catch (err) {
      console.error("❌ Error deleting school:", err);
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
        <button type="submit" className="btn btn-purple">Add School</button>
      </form>

      {!collapsed && (
        <div className="school-list">
          {schools.map((school) => (
            <div key={school._id} className="school-row">
              <span className="school-name">{school.name}</span>
              <button
                onClick={() => handleDelete(school._id)}
                className="btn btn-danger small-btn"
              >
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CreateSchool;
