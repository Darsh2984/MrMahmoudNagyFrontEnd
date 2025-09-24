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

  const fetchPerformance = async (parentId) => {
    if (!parentId) {
      setMessage("⚠️ No parent ID provided.");
      setPerformance(null);
      return;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/performance/parent/${parentId}`
      );
      setPerformance(res.data); 
      setMessage("");
    } catch (err) {
      console.error("❌ Error fetching parent performance:", err);
      setMessage("❌ Could not load parent performance.");
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
                    fetchPerformance(user.id);  // ✅ Pass parentId, not childId
                  }}
                  className="btn btn-blue"
                >
                  🔍 View Performance
                </button>
              </div>
            ))}
          </div>

          {/* Performance Section */}
          {/* Performance Section */}
          {performance && selectedStudent && (
            <div className="section-card" style={{ marginTop: "25px" }}>
              <h3 className="card-title">Performance Report</h3>
              <br />

                {Array.isArray(performance) ? (
                (() => {
                  const childPerf = performance.find(c => c.childId === selectedStudent);
                  if (!childPerf) return <p>No performance data for this student</p>;

                  return (
                    <>
                      {/* Attendance */}
                      <div className="student-tile">
                        <h4>Attendance</h4>
                        {childPerf.attendance?.length === 0 ? (
                          <p>No attendance records</p>
                        ) : (
                          <ul style={{ listStyle: "none", padding: 0 }}>
                            {childPerf.attendance.map((a, i) => (
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
                        <h4>📝 Tasks</h4>
                        {childPerf.tasks?.length === 0 ? (
                          <p>No tasks</p>
                        ) : (
                          <ul style={{ listStyle: "none", padding: 0 }}>
                            {childPerf.tasks.map((t) => (
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
                        <h4>🧾 Quizzes</h4>
                        {childPerf.quizzes?.length === 0 ? (
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
                              {childPerf.quizzes.map((q, i) => (
                                <tr key={i}>
                                  <td>{q.quizTitle}</td>
                                  <td style={{ color: q.score !== null ? "#2c3e50" : "red" }}>
                                    {q.score !== null ? `${q.score}/${q.total}` : "❌ Not Attempted"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  );
                })()
              ) : (
                <p>No performance data</p>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default ParentDashboard;
