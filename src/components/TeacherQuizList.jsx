  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import { toast } from "react-toastify";
  import { useNavigate } from "react-router-dom";
  import "react-toastify/dist/ReactToastify.css";
  import "../styles/AppStyles.css";
  

  function TeacherQuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [resultsQuiz, setResultsQuiz] = useState(null);
    const [results, setResults] = useState([]);
    const [answersModal, setAnswersModal] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const teacherId = user?.id;
    const navigate = useNavigate();

    useEffect(() => {
      if (teacherId) fetchQuizzes();
    }, [teacherId]);

    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/quiz/teacher/${teacherId}`
        );
        setQuizzes(res.data);
      } catch (err) {
        console.error("❌ Error fetching quizzes:", err);
        toast.error("❌ Failed to load quizzes");
      }
    };

    const deleteQuiz = async (quizId) => {
        toast.info(
          <div>
            <p>Are you sure you want to delete this quiz?</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`${process.env.REACT_APP_API_URL}/api/quiz/${quizId}`);
                    toast.dismiss(); // close confirm toast
                    toast.success("✅ Quiz deleted");
                    fetchQuizzes();
                  } catch (err) {
                    console.error("❌ Error deleting quiz:", err);
                    toast.dismiss();
                    toast.error("❌ Failed to delete quiz");
                  }
                }}
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => toast.dismiss()}
                style={{
                  background: "#7f8c8d",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>,
          {
            autoClose: false, // keep it open until action
            closeOnClick: false,
            draggable: false,
            position: "top-center",
          }
        );
      };

    const fetchResults = async (quizId) => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/quiz/${quizId}/submissions`
        );
        setResults(res.data);
        setResultsQuiz(quizId);
      } catch (err) {
        console.error("❌ Error fetching results:", err);
        toast.error("❌ Failed to load quiz results");
      }
    };

    const fetchStudentAnswers = async (quizId, studentId) => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/quiz/${quizId}/submission/${studentId}`
        );
        setAnswersModal(res.data);
      } catch (err) {
        console.error("❌ Error fetching student answers:", err);
        toast.error("❌ Failed to load student answers");
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
        <h2 className="sidebar-title">📚 Dashboard</h2>
        <ul>
          <li onClick={() => navigate("/teacher-dashboard")}>🏠 Home</li>
          <li onClick={() => navigate("/manage-units")}>📘 Units & Chapters</li>
          <li onClick={() => navigate("/questions")}>📋 Questions</li>
          <li onClick={() => navigate("/createquiz")}>📝 Create Quiz</li>
          <li onClick={() => navigate("/quizlist")}>📑 Quiz Lists</li>
          <li onClick={() => navigate("/studentsperformance")}>📊 Performance</li>
          <li onClick={() => navigate("/teacher-tasks")}>📂 Tasks & Homework</li>
          <li onClick={() => navigate("/videomanager")}>📽 Upload Videos</li>
          <li onClick={() => navigate("/PDFManager")}>📃 Upload Course Materials</li>          
        </ul>
      </aside>

      {/* Main Content */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📚 My Quizzes</h2>

          {quizzes.length === 0 ? (
            <p style={{ textAlign: "center", color: "#555" }}>
              No quizzes created yet.
            </p>
          ) : (
            <div className="quiz-list">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="quiz-card">
                  <div className="quiz-info">
                    <h3>{quiz.title}</h3>
                    <div className="quiz-meta">
                      <p><b>Duration:</b> {quiz.duration} mins</p>
                      <p><b>Groups:</b> {quiz.groups.map((g) => g.name).join(", ") || "—"}</p>
                      <p><b>Start:</b> {quiz.startTime ? new Date(quiz.startTime).toLocaleString() : "—"}</p>
                      <p><b>End:</b> {quiz.endTime ? new Date(quiz.endTime).toLocaleString() : "—"}</p>
                      <p><b>Questions:</b> {quiz.questions.length}</p>
                    </div>
                  </div>
                  <div className="quiz-actions">
                    <button onClick={() => setSelectedQuiz(quiz)} className="btn btn-blue">👁 View Details</button>
                    <button onClick={() => fetchResults(quiz._id)} className="btn btn-green">📊 View Results</button>
                    <button onClick={() => deleteQuiz(quiz._id)} className="btn btn-purple">🗑 Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Quiz Results Modal */}
      {resultsQuiz && (
        <div className="modal-overlay" onClick={() => setResultsQuiz(null)}>
          <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📊 Quiz Results</h3>
            {results.length === 0 ? (
              <p>No submissions yet.</p>
            ) : (
              <table className="styled-table roomy-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Group</th>
                    <th>Score</th>
                    <th>Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.studentId._id}>
                      <td>{r.studentId.name}</td>
                      <td>{r.groupName}</td> {/* ✅ New Group Column */}
                      <td>{r.score}/{r.total}</td>
                      <td>
                        <button
                          onClick={() => fetchStudentAnswers(resultsQuiz, r.studentId._id)}
                          className="btn btn-blue small-btn"
                        >
                          👁 View Answers
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            )}
            <button onClick={() => setResultsQuiz(null)} className="btn btn-purple">✖ Close</button>
          </div>
        </div>
      )}

      {/* Student Answers Modal */}
      {answersModal && (
        <div className="modal-overlay" onClick={() => setAnswersModal(null)}>
          <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {answersModal.quizTitle} — {answersModal.score}/{answersModal.total}
            </h3>
            <div className="answers-list">
              {answersModal.answers.map((a, i) => (
                <div key={i} className="answer-card roomy-answer">
                  {a.questionId?.imageUrl && (
                    <img
                      src={`${process.env.REACT_APP_API_URL}${a.questionId.imageUrl}`}
                      alt="question"
                      className="question-thumb"
                    />
                  )}
                  <p><b>Student Answer:</b> {a.answer || "—"}</p>
                  <p><b>Correct Answer:</b> {a.questionId?.correctAnswer}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setAnswersModal(null)} className="btn btn-purple">✖ Close</button>
          </div>
        </div>
      )}

            {/* Quiz Details Modal */}
      {selectedQuiz && (
        <div className="modal-overlay" onClick={() => setSelectedQuiz(null)}>
          <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedQuiz.title} — Details</h3>
            <div className="answers-list">
              {selectedQuiz.questions.length === 0 ? (
                <p>No questions assigned.</p>
              ) : (
                selectedQuiz.questions.map((q, i) => (
                  <div key={q._id || i} className="answer-card roomy-answer">
                    <h4>Question {i + 1}</h4>
                    {q.imageUrl && (
                      <img
                        src={`${process.env.REACT_APP_API_URL}${q.imageUrl}`}
                        alt={`question-${i + 1}`}
                        className="question-thumb"
                      />
                    )}
                    {q.text && <p><b>Text:</b> {q.text}</p>}
                    {q.options && (
                      <ul>
                        {q.options.map((opt, idx) => (
                          <li key={idx}>{opt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setSelectedQuiz(null)} className="btn btn-purple">
              ✖ Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
  }

  export default TeacherQuizList;
