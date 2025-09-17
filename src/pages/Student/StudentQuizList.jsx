import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";

function StudentQuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id;

  useEffect(() => {
    if (studentId) fetchQuizzes();
  }, [studentId]);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/quiz-student/${studentId}`
      );
      setQuizzes(res.data);
    } catch (err) {
      console.error("❌ Error fetching quizzes:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">🎓 Student</h2>
        <div className="sidebar-footer">
          <p>👤 {user?.name}</p>
        </div>
        <ul>
          <li onClick={() => navigate("/student-dashboard")}>🏠 Dashboard</li>
          <li onClick={() => navigate("/student-tasks")}>📋 My Tasks</li>
          <li onClick={() => navigate("/student-quizzes")}>📝 My Quizzes</li>
          <li onClick={() => navigate("/student-attendance")}>📊 My Attendance</li>
          <li onClick={() => navigate("/student-performance")}>📈 My Performance</li>
          <li onClick={() => navigate("/StudentVideoViewer")}>🎥 Course Videos</li>
          <li onClick={() => navigate("/MaterialViewer")}>📚 Course Materials</li>

        </ul>
      </aside>

      {/* Main */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📘 My Quizzes</h2><br />

          {loading ? (
            <p>⏳ Loading quizzes...</p>
          ) : quizzes.length === 0 ? (
            <p>No quizzes available</p>
          ) : (
            <ul className="quiz-list">
              {quizzes.map((quiz) => (
                <li key={quiz._id} className="quiz-card">
                  <h3 style={{ marginBottom: "8px", color: "#2c3e50" }}>{quiz.title}</h3>
                  <p>⏳ Duration: {quiz.duration} minutes</p>
                  {quiz.startTime && (
                    <p>📅 Starts: {new Date(quiz.startTime).toLocaleString()}</p>
                  )}
                  {quiz.endTime && (
                    <p>📅 Ends: {new Date(quiz.endTime).toLocaleString()}</p>
                  )}

                  {/* Show score if already submitted */}
                  {quiz.alreadySubmitted && (
                    <p style={{ marginTop: "8px", color: "#27ae60", fontWeight: "bold" }}>
                      ✅ Score: {quiz.score} / {quiz.total}
                    </p>
                  )}

                  <button
                    className={`btn ${quiz.alreadySubmitted ? "btn-green" : "btn-blue"}`}
                    style={{ marginTop: "12px" }}
                    onClick={() =>
                      quiz.alreadySubmitted
                        ? navigate(`/student/quiz-result/${quiz._id}`)
                        : navigate(`/student/take-quiz/${quiz._id}`)
                    }
                  >
                    {quiz.alreadySubmitted ? "📊 View Results" : "🚀 Start Quiz"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentQuizList;
