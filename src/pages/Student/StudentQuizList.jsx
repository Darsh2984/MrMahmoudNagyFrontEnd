import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";
import StudentSidebar from "../../components/StudentSidebar"; // import new sidebar

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

  // ✅ Helper: format to local timezone
  const formatLocalDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-GB", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
              {quizzes.map((quiz) => {
                const now = new Date();
                const startTime = quiz.startTime ? new Date(quiz.startTime) : null;
                const endTime = quiz.endTime ? new Date(quiz.endTime) : null;

                let buttonLabel = "";
                let buttonClass = "btn";
                let buttonDisabled = false;
                let onClickAction = null;

                if (quiz.alreadySubmitted) {
                  // ✅ Already taken
                  buttonLabel = "📊 View Results";
                  buttonClass = "btn-green";
                  onClickAction = () => navigate(`/student/quiz-result/${quiz._id}`);
                } else if (startTime && now < startTime) {
                  // ⏳ Not started yet
                  buttonLabel = "⏳ Opening Soon";
                  buttonClass = "btn-gray";
                  buttonDisabled = true;
                } else if (endTime && now > endTime) {
                  // ❌ Quiz closed
                  buttonLabel = "🚫 Quiz Closed";
                  buttonClass = "btn-red";
                  buttonDisabled = true;
                } else {
                  // 🚀 Quiz is active
                  buttonLabel = "🚀 Start Quiz";
                  buttonClass = "btn-blue";
                  onClickAction = () => navigate(`/student/take-quiz/${quiz._id}`);
                }

                return (
                  <li key={quiz._id} className="quiz-card">
                    <h3 style={{ marginBottom: "8px", color: "#2c3e50" }}>{quiz.title}</h3>
                    <p>⏳ Duration: {quiz.duration} minutes</p>

                    {quiz.startTime && (
                      <p>📅 Starts: {formatLocalDate(quiz.startTime)}</p>
                    )}
                    {quiz.endTime && (
                      <p>📅 Ends: {formatLocalDate(quiz.endTime)}</p>
                    )}

                    {/* Show score if already submitted */}
                    {quiz.alreadySubmitted && (
                      <p style={{ marginTop: "8px", color: "#27ae60", fontWeight: "bold" }}>
                        ✅ Score: {quiz.score} / {quiz.total}
                      </p>
                    )}

                    <button
                      className={`btn ${buttonClass}`}
                      style={{ marginTop: "12px" }}
                      disabled={buttonDisabled}
                      onClick={onClickAction}
                    >
                      {buttonLabel}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentQuizList;
