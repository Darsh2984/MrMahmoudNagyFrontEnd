import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  ChartBar,
  PlayCircle,
  CheckCircle,
  ArrowClockwise,
  XCircle,
} from "phosphor-react";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentQuizList.css";

function StudentQuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [startingQuizId, setStartingQuizId] = useState(null);
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

  const formatLocalDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-GB", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartQuiz = async (quizId) => {
    if (startingQuizId) return;
    setStartingQuizId(quizId);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/quiz-student/${quizId}/start`,
        { studentId }
      );
      navigate(`/student/take-quiz/${quizId}`);
    } catch (err) {
      console.error("❌ Error starting quiz:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Failed to start quiz. Please try again.");
    } finally {
      setStartingQuizId(null);
    }
  };

  return (
    <div className="student-layout">
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`student-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <header className="dashboard-header">
          <h2>My Quizzes</h2>
          <p>View available quizzes, track scores, and start new ones</p>
        </header>

        <section className="section-card">
          {loading ? (
            <p>⏳ Loading quizzes...</p>
          ) : quizzes.length === 0 ? (
            <p>No quizzes available yet.</p>
          ) : (
            <ul className="quiz-list">
              {quizzes.map((quiz) => {
                const now = new Date();
                const startTime = quiz.startTime ? new Date(quiz.startTime) : null;
                const endTime = quiz.endTime ? new Date(quiz.endTime) : null;


                let label, colorClass, icon, onClick, isMissed = false;
                const hasLocalProgress = localStorage.getItem(`quizStart_${quiz._id}`);
                const hasSubmitted =
                  quiz.alreadySubmitted ||
                  quiz.score !== undefined ||
                  quiz.submissionId ||
                  quiz.hasSubmitted;

                /* ===========================================================
                🔥 1) Highest priority: Student already started locally
                =========================================================== */
                if (hasLocalProgress && !hasSubmitted && endTime && now < endTime) {
                  label = "Continue Quiz";
                  colorClass = "btn-yellow";
                  icon = <ArrowClockwise size={18} />;
                  onClick = () => navigate(`/student/take-quiz/${quiz._id}`);
                }

                /* ===========================================================
                🔥 2) If student submitted → DO NOT override Continue Quiz
                =========================================================== */
                else if (hasSubmitted) {
                  label = "View Results";
                  colorClass = "btn-green";
                  icon = <ChartBar size={18} />;
                  onClick = () => navigate(`/student/quiz-result/${quiz._id}`);
                }

                /* ===========================================================
                🔥 3) Quiz not open yet
                =========================================================== */
                else if (startTime && now < startTime) {
                  label = "Opening Soon";
                  colorClass = "btn-gray";
                  icon = <Clock size={18} />;
                  onClick = null;
                }

                /* ===========================================================
                🔥 4) Quiz can START NOW
                =========================================================== */
                else if (now >= startTime && now <= endTime) {
                  label = startingQuizId === quiz._id ? "Starting..." : "Start Quiz";
                  colorClass = "btn-blue";
                  icon = <PlayCircle size={18} />;
                  onClick = () => handleStartQuiz(quiz._id);
                }

                /* ===========================================================
                🔥 5) Quiz missed
                =========================================================== */
                else {
                  label = "Quiz Not Attended";
                  isMissed = true;
                  icon = <XCircle size={18} color="#999" />;
                }


                return (
                  <li key={quiz._id} className="quiz-card">
                    <div className="quiz-header">
                      <BookOpen size={22} color="#0b3c49" />
                      <div>
                        <h3>{quiz.title}</h3>
                        <p>Duration: {quiz.duration} min</p>
                      </div>
                    </div>

                    <div className="quiz-info">
                      {quiz.startTime && (
                        <p>
                          <Clock size={16} /> <b>Starts:</b>{" "}
                          {formatLocalDate(quiz.startTime)}
                        </p>
                      )}
                      {quiz.endTime && (
                        <p>
                          <Clock size={16} /> <b>Ends:</b>{" "}
                          {formatLocalDate(quiz.endTime)}
                        </p>
                      )}
                    </div>

                    {/* ✅ Always show score if available */}
                    {hasSubmitted && quiz.score !== undefined && (
                      <p className="quiz-score">
                        <CheckCircle size={16} /> Score:{" "}
                        <b>
                          {quiz.score} / {quiz.total}
                        </b>
                      </p>
                    )}

                    {/* 🧠 Missed quiz message */}
                    {isMissed ? (
                      <p className="missed-message">
                        <XCircle size={18} color="#999" /> Quiz Not Attended
                      </p>
                    ) : (
                      <button
                        className={`btn ${colorClass}`}
                        onClick={onClick}
                        disabled={!onClick || startingQuizId === quiz._id}
                      >
                        {icon} <span>{label}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentQuizList;
