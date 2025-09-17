// src/pages/ParentDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";

function ParentDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "parent") {
      setMessage("❌ Unauthorized. Please log in as a parent.");
      setLoading(false);
      return;
    }
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/parent/${user.id}/students`,
        { headers: { Authorization: token } }
      );
      setStudents(res.data);
    } catch (err) {
      console.error("❌ Error fetching children:", err);
      setMessage("❌ Could not load students.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async (groupId, studentId) => {
    if (!groupId || groupId === "null") {
      setMessage("⚠️ This student is not assigned to any group.");
      setPerformance(null);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/performance/${groupId}/${studentId}`
      );
      setPerformance(res.data);
      setMessage(""); // clear old errors
    } catch (err) {
      console.error("❌ Error fetching performance:", err);
      setMessage("❌ Could not load performance.");
      setPerformance(null);
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">👪 Parent</h2>
        <ul>
          <li onClick={() => navigate("/parent-dashboard")}>🏠 Dashboard</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">👪 Parent Dashboard</h2>
          {loading && <p>⏳ Loading...</p>}
          {message && <p className="error-text">{message}</p>}

          {!loading && students.length === 0 && (
            <p>⚠️ No children linked to this parent account.</p>
          )}

          {/* Children List */}
          <div className="student-dashboard-vertical">
            {students.map((child) => (
              <div key={child._id} className="student-tile">
                <h3 style={{ padding: "10px 0" }}> 🎓 {child.name}</h3>
                <p style={{ padding: "10px 0" }}>👥 Group: {child.groupId?.name || "Not Assigned"}</p>
                <p style={{ padding: "10px 0" }}>
                  Year: {child.yearId?.name || "Not Assigned"}
                </p>

                <button
                  onClick={() => {
                    setSelectedStudent(child._id);
                    fetchPerformance(child.groupId?._id || child.groupId, child._id);
                  }}
                  className="btn btn-blue"
                >
                  🔍 View Performance
                </button>
              </div>
            ))}
          </div>

          {/* Performance Section */}
          {performance && selectedStudent && (
            <div className="section-card" style={{ marginTop: "25px" }}>
              <h3 className="card-title">Performance Report</h3>
              <br />
              {/* Attendance */}
              <div className="student-tile">
                <h4>Attendance</h4>
                {performance.attendance.length === 0 ? (
                  <p>No attendance records</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {performance.attendance.map((a, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: "8px",
                          color: a.present ? "green" : "red",
                        }}
                      >
                        {a.title} → {a.present ? "✅ Present" : "❌ Absent"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <br />
              {/* Tasks */}
              <div className="student-tile">
                <h4>📝 Tasks</h4>
                {performance.tasks.length === 0 ? (
                  <p>No tasks</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {performance.tasks.map((t) => (
                      <li
                        key={t._id}
                        style={{
                          marginBottom: "8px",
                          color: t.submitted ? "green" : "red",
                        }}
                      >
                        {t.title} →{" "}
                        {t.submitted ? "✅ Submitted" : "❌ Not Submitted"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <br />
              {/* Quizzes */}
              <div className="student-tile">
                <h4>🧾 Quizzes</h4>
                {performance.quizzes.length === 0 ? (
                  <p>No quizzes</p>
                ) : (
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Quiz</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performance.quizzes.map((q, i) => (
                        <tr key={i}>
                          <td style={{ paddingRight: "20px" }}>{q.quizTitle}</td>
                          <td style={{ color: q.score !== null ? "#2c3e50" : "red", paddingLeft: "20px" }}>
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
        </div>
      </main>
    </div>
  );
}

export default ParentDashboard;
