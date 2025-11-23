import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarCheck,
  NotePencil,
  ClipboardText,
  ChartBar,
  ArrowLeft,
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
import { useNavigate } from "react-router-dom";
import "./SpecialStudentPerformance.css";

export default function SpecialStudentPerformance() {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <div className="special-student-performance">
      <header className="special-header">
        <div className="back-btn" onClick={() => navigate("/specialstudent-dashboard")}>
          <ArrowLeft size={20} /> <span>Back to Dashboard</span>
        </div>
        <h1>My Performance</h1>
        <p>Track your progress across attendance, tasks, and quizzes</p>
        <div className="header-underline"></div>
      </header>

      <section className="performance-section">
        {loading && <p className="loading-msg">⏳ Loading...</p>}
        {error && <p className="error-msg">{error}</p>}

        {performance && !loading && (
          <div className="performance-grid">
            {/* Tasks */}
            <div className="perf-card">
              <h3>
                <NotePencil size={20} /> Tasks
              </h3>
              {performance.tasks.length === 0 ? (
                <p>No tasks found</p>
              ) : (
                <ul>
                  {performance.tasks.map((t) => (
                    <li key={t._id} className={t.submitted ? "submitted" : "missed"}>
                      {t.title} → {t.submitted ? "Submitted" : "Not Submitted"}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Online Quizzes */}
            <div className="perf-card">
              <h3>
                <ClipboardText size={20} /> Online Quiz Grades
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
                        <td>{q.score !== null ? `${q.score}/${q.total}` : "Not Attempted"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {/* Charts */}
            <div className="charts-container">
              {/* Online Quiz Performance */}
              <div className="chart-card">
                <h3>Online Quiz Performance Trend</h3>
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
                  <p>No quiz data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
