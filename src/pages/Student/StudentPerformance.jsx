// src/pages/StudentPerformance.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  NotePencil,
  ClipboardText,
  ChartBar,
} from "phosphor-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


import "../../styles/AppStyles.css";
import StudentSidebar from "../../components/StudentSidebar";

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
      setError("Unauthorized. Please log in as a student.");
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
      console.error("Error fetching performance:", err);
      setError("Could not load performance data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleDateString();
  };

  const prepareChartData = (quizzes = []) => {
  return quizzes
    .filter((q) => q.score !== null && q.total > 0)
    .map((q) => ({
      name: q.quizName || q.quizTitle,
      score: ((q.score / q.total) * 100).toFixed(1),
    }));
};

const onlineQuizData = prepareChartData(performance?.quizzes);
const inClassQuizData = prepareChartData(performance?.inClassQuizzes);

  

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">
            <ChartBar size={22} weight="duotone" /> My Performance
          </h2>

          {loading && <p>Loading...</p>}
          {error && <p className="error-text">{error}</p>}

          {performance && !loading && (
            <div style={{ marginTop: "20px", display: "grid", gap: "20px" }}>
              {/* Attendance */}
              <div className="student-tile">
                <h3>
                  <CalendarCheck size={20} weight="duotone" /> Attendance
                </h3>
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
                        {a.title} → {a.present ? "Present" : "Absent"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Tasks */}
              <div className="student-tile">
                <h3>
                  <NotePencil size={20} weight="duotone" /> Tasks
                </h3>
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
                        {t.title} → {t.submitted ? "Submitted" : "Not Submitted"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Online Quizzes */}
              <div className="student-tile">
                <h3>
                  <ClipboardText size={20} weight="duotone" /> Online Quiz Grades
                </h3>
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
                              : "Not Attempted"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* In-Class Quizzes */}
              <div className="student-tile">
                <h3>
                  <ClipboardText size={20} weight="duotone" /> In-Class Quizzes
                </h3>
                {!performance.inClassQuizzes ||
                performance.inClassQuizzes.length === 0 ? (
                  <p>No in-class quizzes found</p>
                ) : (
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Quiz Name</th>
                        <th>Date</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performance.inClassQuizzes.map((q, i) => (
                        <tr key={i}>
                          <td>{q.quizName}</td>
                          <td>{formatDate(q.date)}</td>
                          <td
                            style={{
                              color: q.score !== null ? "#2c3e50" : "red",
                            }}
                          >
                            {q.score !== null
                              ? `${q.score}/${q.total}`
                              : "Not Graded"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* === Performance Trend Charts === */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
    marginTop: "40px",
  }}
>
  {/* Online Quiz Performance */}
  <div className="student-tile" style={{ width: "500px", height: "300px" }}>
    <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
      Online Quiz Performance Trend
    </h3>
    {onlineQuizData && onlineQuizData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={onlineQuizData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <p style={{ textAlign: "center" }}>No quiz data available</p>
    )}
  </div>
  {/* In-Class Quiz Performance */}
  <div className="student-tile" style={{ width: "500px", height: "300px" }}>
    <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
      In-Class Quiz Performance Trend
    </h3>
    {inClassQuizData && inClassQuizData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={inClassQuizData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <p style={{ textAlign: "center" }}>No in-class quiz data available</p>
    )}
  </div>
</div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
