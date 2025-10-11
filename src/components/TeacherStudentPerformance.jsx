import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChartBar, Download, MagnifyingGlass } from "phosphor-react";
import TeacherSidebar from "./TeacherSidebar";
import "./TeacherStudentPerformance.css";

export default function TeacherStudentPerformance() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [year, setYear] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "teacher") {
      setTeacherId(user.id);
      fetchYears(user.id);
    }
  }, []);

  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch (err) {
      setError("❌ Failed to load years.");
    }
  };

  const fetchGroups = async (yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/group/${yearId}`);
      setGroups(res.data);
      setGroupId("");
      setStudents([]);
      setStudentId("");
      setData(null);
    } catch (err) {
      setError("❌ Failed to load groups.");
    }
  };

  const fetchStudents = async (groupId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/group/${groupId}/students`);
      setStudents(res.data);
      setStudentId("");
      setData(null);
    } catch (err) {
      setError("❌ Failed to load students.");
    }
  };

  const fetchPerformance = async () => {
    if (!groupId || !studentId) return;
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/performance/${groupId}/${studentId}/teacher/${user.id}`
      );
      setData(res.data);
    } catch (err) {
      setError("❌ Failed to load performance data.");
    } finally {
      setLoading(false);
    }
  };

  const exportGroupPerformance = async () => {
    if (!groupId) {
      alert("⚠️ Please select a group first");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/performance/export/${groupId}/teacher/${user.id}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${groupId}_performance.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Export failed:", err);
      alert("❌ Failed to export group performance data");
    }
  };

  return (
    <div className="page-layout">
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`teacherperformance-container ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
        <div className="teacherperformance-card">
          <h2 className="page-title">
            <ChartBar size={24} /> Student Performance
          </h2>

          {error && <p className="error-text">{error}</p>}

          {/* === Filters === */}
          <div className="filter-bar">
            {/* Year Selector */}
            <div className="filter-item">
              <label>Year</label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  fetchGroups(e.target.value);
                }}
                className="styled-select"
              >
                <option value="">-- Select Year --</option>
                {years.map((y) => (
                  <option key={y._id} value={y._id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Selector */}
            {groups.length > 0 && (
              <div className="filter-item">
                <label>Group</label>
                <select
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value);
                    fetchStudents(e.target.value);
                  }}
                  className="styled-select"
                >
                  <option value="">-- Select Group --</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Student Selector */}
            {students.length > 0 && (
              <div className="filter-item">
                <label>Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="styled-select"
                >
                  <option value="">-- Select Student --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {students.length > 0 && (
              <button className="btn btn-blue" onClick={fetchPerformance}>
                <MagnifyingGlass size={18} /> View
              </button>
            )}

            {groupId && (
              <button className="btn btn-green" onClick={exportGroupPerformance}>
                <Download size={18} /> Export
              </button>
            )}
          </div>
        </div>

        {/* === Results === */}
        {loading && <p className="loading-text">⏳ Loading results...</p>}

        {data && !loading && (
          <div className="results-grid">
            {/* Attendance */}
            <div className="section-card">
              <h3 className="card-title">📅 Attendance</h3>
              {data.attendance.length === 0 ? (
                <p>No attendance records</p>
              ) : (
                <ul className="styled-list">
                  {data.attendance.map((a, i) => (
                    <li key={i} className={a.present ? "present" : "absent"}>
                      {a.title} → {a.present ? "✅ Present" : "❌ Absent"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tasks */}
            <div className="section-card">
              <h3 className="card-title">📝 Tasks</h3>
              {data.tasks.length === 0 ? (
                <p>No tasks found</p>
              ) : (
                <ul className="styled-list">
                  {data.tasks.map((t) => (
                    <li key={t._id} className={t.submitted ? "present" : "absent"}>
                      {t.title} → {t.submitted ? "✅ Submitted" : "❌ Not Submitted"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quizzes */}
            <div className="section-card">
              <h3 className="card-title">🧾 Quiz Grades</h3>
              {data.quizzes.length === 0 ? (
                <p>No quizzes found</p>
              ) : (
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.quizzes.map((q, i) => (
                      <tr key={i}>
                        <td>{q.quizTitle}</td>
                        <td className={q.score !== null ? "present" : "absent"}>
                          {q.score !== null ? `${q.score}/${q.total}` : "❌ Not Attempted"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
