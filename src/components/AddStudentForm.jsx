import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../src/styles/AppStyles.css";

function AddStudentForm({ years, onStudentAdded }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchStudents();
  }, []);

  const addStudentToGroup = async () => {
    if (!selectedYear || !selectedGroup || !selectedStudent) {
      toast.warn("⚠️ Please select a Year, Group, and Student");
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/group/${selectedGroup}/add-student`,
        { studentId: selectedStudent }
      );
      toast.success("✅ Student added successfully");
      setSelectedStudent("");
      if (onStudentAdded) onStudentAdded();
    } catch (err) {
      console.error("❌ Error adding student:", err);
      if (err.response?.data?.msg?.includes("already exists")) {
        toast.error("❌ This student is already in another group");
      } else {
        toast.error("❌ Failed to add student");
      }
    }
  };

  return (
    <div className="section-card">
      <h3 className="section-title">👨‍🎓 Add Student to Group</h3>

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
      <label className="field-label">Select Student</label>
      {loading ? (
        <p>Loading students...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <select
          className="styled-select"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">-- Select Student --</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>
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
