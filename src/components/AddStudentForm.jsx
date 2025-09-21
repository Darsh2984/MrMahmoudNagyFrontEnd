import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../src/styles/AppStyles.css";

function AddStudentForm({ years, onStudentAdded }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Extract fetch function
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/students`);
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      setError("Failed to load students");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudentToGroup = async () => {
    if (!selectedYear || !selectedGroup || selectedStudent.length === 0) {
      toast.warn("⚠️ Please select a Year, Group, and at least one Student");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/group/${selectedGroup}/add-student`,
        { studentIds: selectedStudent } // ✅ send array
      );

      toast.success("✅ Students added successfully");
      setSelectedStudent([]);
      if (onStudentAdded) onStudentAdded();
    } catch (err) {
      console.error("❌ Error adding students:", err);
      toast.error("❌ Failed to add students");
    }
  };

  return (
    <div className="section-card">
      <div className="header-flex">
        <h3 className="section-title">👨‍🎓 Add Student to Group</h3>
        {/* ✅ Refresh Button */}
        <button className="btn btn-purple" onClick={fetchStudents}>
          🔄 Refresh
        </button>
      </div>

      {/* Year Selector */}
      <label className="field-label">Select Year</label>
      <select
        className="styled-select"
        value={selectedYear}
        onChange={(e) => {
          setSelectedYear(e.target.value);
          setSelectedGroup("");
        }}
      >
        <option value="">-- Select Year --</option>
        {years.map((y) => (
          <option key={y._id} value={y._id}>
            {y.name}
          </option>
        ))}
      </select>

      {/* Group Selector */}
      {selectedYear && (
        <>
          <label className="field-label">Select Group</label>
          <select
            className="styled-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">-- Select Group --</option>
            {years.find((y) => y._id === selectedYear)?.groups?.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Student Selector */}
      <label className="field-label">Select Students</label>
      {loading ? (
        <p>Loading students...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="checkbox-grid">
          {students.map((s) => (
            <label
              key={s._id}
              className={`checkbox-card ${
                selectedStudent.includes(s._id) ? "selected" : ""
              }`}
            >
              <input
                type="checkbox"
                value={s._id}
                checked={selectedStudent.includes(s._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedStudent([...selectedStudent, s._id]);
                  } else {
                    setSelectedStudent(
                      selectedStudent.filter((id) => id !== s._id)
                    );
                  }
                }}
              />
              <div className="checkbox-content">
                <strong>{s.name}</strong>
                <p>{s.schoolId?.name || "No School"}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Add Button */}
      <br />
      <br />
      <button className="btn btn-purple" onClick={addStudentToGroup}>
        Add Student
      </button>
    </div>
  );
}

export default AddStudentForm;
