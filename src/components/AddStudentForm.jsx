import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Student,
  ArrowsClockwise,
  UsersThree,
  GraduationCap,
  CheckSquareOffset,
  PlusCircle,
} from "phosphor-react";
import "react-toastify/dist/ReactToastify.css";
import "./AddStudentForm.css"; // ✅ separate new CSS file

function AddStudentForm({ years, onStudentAdded }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/students`);
      setStudents(res.data);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
      setError("Failed to load students");
    } finally {
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
        { studentIds: selectedStudent }
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
    <div className="addstudent-card">
      <div className="addstudent-header">
        <div className="title-area">
          <GraduationCap size={26} weight="duotone" color="#0b3c49" />
          <h3>Add Students to Groups</h3>
        </div>
        <button className="btn-refresh" onClick={fetchStudents}>
          <ArrowsClockwise size={18} /> Refresh
        </button>
      </div>

      {/* YEAR SELECTOR */}
      <div className="form-section">
        <label className="field-label">
          <UsersThree size={18} /> Select Year
        </label>
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
      </div>

      {/* GROUP SELECTOR */}
      {selectedYear && (
        <div className="form-section">
          <label className="field-label">
            <Student size={18} /> Select Group
          </label>
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
        </div>
      )}

      {/* STUDENT LIST */}
      <div className="form-section">
        <label className="field-label">
          <CheckSquareOffset size={18} /> Select Students
        </label>

        {loading ? (
          <p>Loading students...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="student-grid">
            {students.map((s) => (
              <label
                key={s._id}
                className={`student-card ${
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
                <div className="student-info">
                  <strong>{s.name}</strong>
                  <p>{s.schoolId?.name || "No School"}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* BUTTON */}
      <div className="add-btn-wrapper">
        <button className="btn btn-purple" onClick={addStudentToGroup}>
          <PlusCircle size={18} /> Add Selected Students
        </button>
      </div>
    </div>
  );
}

export default AddStudentForm;
