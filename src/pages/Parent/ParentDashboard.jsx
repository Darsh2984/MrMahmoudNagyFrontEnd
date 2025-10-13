import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ParentDashboard.css";
import {
  Users,
  ClipboardText,
  BookOpen,
  MagnifyingGlass,
  Student,
  ChalkboardTeacher,
  ChartBar,
} from "phosphor-react";

function ParentDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error fetching children:", err);
      setMessage("❌ Could not load students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async (parentId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/performance/parent/${parentId}`
      );
      setPerformance(res.data);
      setMessage("");
    } catch (err) {
      console.error("❌ Error fetching parent performance:", err);
      setMessage("❌ Could not load performance data.");
      setPerformance(null);
    }
  };

  const getColor = (condition) => (condition ? "green" : "red");

  return (
    <div className="parent-dashboard">
      <header className="dashboard-header">
        <h2>
          <Users size={22} /> Parent Dashboard
        </h2>
        <p>Monitor your children’s attendance, tasks, and quiz performance</p>
      </header>

      <section className="section-card">
        {loading && <p className="loading-msg">⏳ Loading...</p>}
        {message && <p className="error-msg">{message}</p>}

        {!loading && students.length === 0 && (
          <p className="no-data">No children linked to this parent account.</p>
        )}

        {/* === Children List === */}
        <div className="children-grid">
          {Array.isArray(students) &&
            students.map((child) => (
              <div key={child._id} className="child-card">
                <div className="child-icon">
                  <Student size={26} />
                </div>
                <h4>{child.name}</h4>
                <p>
                  <strong>Group:</strong> {child.groupId?.name || "Not Assigned"}
                </p>
                <p>
                  <strong>Year:</strong> {child.yearId?.name || "Not Assigned"}
                </p>
                <button
                  className="btn-view"
                  onClick={() => {
                    setSelectedStudent(child._id);
                    fetchPerformance(user.id);
                  }}
                >
                  <MagnifyingGlass size={18} /> View Performance
                </button>
              </div>
            ))}
        </div>

        {/* === Performance Section === */}
        {performance && selectedStudent && (
          <div className="section-card performance-section">
            <h3 className="card-title">
              <ChartBar size={20} /> Performance Report
            </h3>

            {Array.isArray(performance) ? (
              (() => {
                const childPerf = performance.find(
                  (c) => c.childId === selectedStudent
                );
                if (!childPerf)
                  return <p>No performance data for this student.</p>;

                return (
                  <>
                    {/* === Attendance === */}
                    <div className="performance-block">
                      <h4>
                        <ChalkboardTeacher size={18} /> Attendance
                      </h4>
                      {!Array.isArray(childPerf.attendance) ||
                      childPerf.attendance.length === 0 ? (
                        <p>No attendance records</p>
                      ) : (
                        <ul className="status-list">
                          {childPerf.attendance.map((a, i) => (
                            <li key={i} style={{ color: getColor(a.present) }}>
                              {a.title} → {a.present ? "Present" : "Absent"}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* === Tasks === */}
                    <div className="performance-block">
                      <h4>
                        <ClipboardText size={18} /> Tasks
                      </h4>
                      {!Array.isArray(childPerf.tasks) ||
                      childPerf.tasks.length === 0 ? (
                        <p>No tasks</p>
                      ) : (
                        <ul className="status-list">
                          {childPerf.tasks.map((t) => (
                            <li
                              key={t._id}
                              style={{
                                color: getColor(t.submitted),
                              }}
                            >
                              {t.title} →{" "}
                              {t.submitted ? "Submitted" : "Not Submitted"}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* === Quizzes === */}
                    <div className="performance-block">
                      <h4>
                        <BookOpen size={18} /> Quizzes
                      </h4>
                      {!Array.isArray(childPerf.quizzes) ||
                      childPerf.quizzes.length === 0 ? (
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
                                <td
                                  style={{
                                    color:
                                      q.score !== null ? "#0b3c49" : "red",
                                  }}
                                >
                                  {q.score !== null
                                    ? `${q.score}/${q.total}`
                                    : "Not Attempted"}
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
              <p>No performance data available</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default ParentDashboard;
