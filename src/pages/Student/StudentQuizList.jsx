import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  ChartBar,
  PlayCircle,
  LockSimple,
  CheckCircle,
  ArrowClockwise,
} from "phosphor-react";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentQuizList.css";

function StudentQuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [startingQuizId, setStartingQuizId] = useState(null); // prevent double click
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

  // 🔹 Handle Start Quiz click
  const handleStartQuiz = async (quizId) => {
    if (startingQuizId) return; // prevent multiple clicks
    setStartingQuizId(quizId);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/quiz-student/${quizId}/start`,
        { studentId }
      );

      console.log("✅ Quiz start recorded:", res.data);
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

                let status, label, colorClass, icon, disabled, onClick;

                // 🟢 Completed quiz
                if (quiz.alreadySubmitted) {
                  status = "completed";
                  label = "View Results";
                  colorClass = "btn-green";
                  icon = <ChartBar size={18} />;
                  onClick = () => navigate(`/student/quiz-result/${quiz._id}`);
                }

                // 🔒 Closed quiz (always overrides)
                else if (endTime && now > endTime) {
                  status = "closed";
                  label = "Quiz Closed";
                  colorClass = "btn-red";
                  icon = <LockSimple size={18} />;
                  disabled = true;
                }

                // 🕒 Upcoming quiz
                else if (startTime && now < startTime) {
                  status = "upcoming";
                  label = "Opening Soon";
                  colorClass = "btn-gray";
                  icon = <Clock size={18} />;
                  disabled = true;
                }

                // 🟡 Continue quiz (started but not submitted)
                else if (quiz.hasStarted && !quiz.alreadySubmitted) {
                  status = "in-progress";
                  label = "Continue Quiz";
                  colorClass = "btn-yellow";
                  icon = <ArrowClockwise size={18} />;
                  onClick = () => navigate(`/student/take-quiz/${quiz._id}`);
                }

                // 🔵 Not started
                else {
                  status = "active";
                  label = startingQuizId === quiz._id ? "Starting..." : "Start Quiz";
                  colorClass = "btn-blue";
                  icon = <PlayCircle size={18} />;
                  onClick = () => handleStartQuiz(quiz._id);
                }

                return (
                  <li key={quiz._id} className={`quiz-card ${status}`}>
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

                    {quiz.alreadySubmitted && (
                      <p className="quiz-score">
                        <CheckCircle size={16} /> Score:{" "}
                        <b>
                          {quiz.score} / {quiz.total}
                        </b>
                      </p>
                    )}

                    <button
                      className={`btn ${colorClass}`}
                      onClick={onClick}
                      disabled={disabled || startingQuizId === quiz._id}
                    >
                      {icon} <span>{label}</span>
                    </button>
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
