// src/pages/StudentPerformance.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";
import StudentSidebar from "../../components/StudentSidebar"; // import new sidebar


export default function StudentPerformance() {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
  if (user?.role === "student") {
    fetchPerformance(user.id);
  } else {
    setError("❌ Unauthorized. Please log in as a student.");
    setLoading(false);
  }
}, []);

  const fetchPerformance = async (studentId) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/performance/student/${studentId}`
    );
    setPerformance(res.data);
  } catch (err) {
    console.error("❌ Error fetching performance:", err);
    setError("❌ Could not load performance data.");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📊 My Performance</h2>
          {loading && <p>⏳ Loading...</p>}
          {error && <p className="error-text">{error}</p>}

          {performance && !loading && (
            <div style={{ marginTop: "20px", display: "grid", gap: "20px" }}>
              {/* Attendance */}
              <div className="student-tile">
                <h3>📅 Attendance</h3>
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

              {/* Tasks */}
              <div className="student-tile">
                <h3>📝 Tasks</h3>
                {performance.tasks.length === 0 ? (
                  <p>No tasks found</p>
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
                        {t.title} → {t.submitted ? "✅ Submitted" : "❌ Not Submitted"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Quizzes */}
              <div className="student-tile">
                <h3>🧾 Quiz Grades</h3>
                {performance.quizzes.length === 0 ? (
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
                      {performance.quizzes.map((q, i) => (
                        <tr key={i}>
                          <td>{q.quizTitle}</td>
                          <td style={{ color: q.score !== null ? "#2c3e50" : "red" }}>
                            {q.score !== null
                              ? `${q.score}/${q.total}`
                              : "❌ Not Attempted"}
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
