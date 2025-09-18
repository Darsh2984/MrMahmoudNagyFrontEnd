import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AppStyles.css";

function CreateSchool({ teacherId }) {
  const [schools, setSchools] = useState([]);
  const [schoolName, setSchoolName] = useState("");

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
      await axios.post(`${process.env.REACT_APP_API_URL}/api/school`, { name: schoolName, teacherId });
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
      <h3>🏫 Manage Schools</h3>

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

      <ul className="styled-list">
        {schools.map((school) => (
          <li key={school._id}>
            {school.name}
            <button onClick={() => handleDelete(school._id)} className="btn btn-purple small-btn">🗑 Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CreateSchool;
