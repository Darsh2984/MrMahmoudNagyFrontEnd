import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/AppStyles.css";
import StudentSidebar from "../../components/StudentSidebar"; // import new sidebar


function QuizResult() {
  const { quizId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id;

  useEffect(() => {
    if (quizId && studentId) fetchSubmission();
  }, [quizId, studentId]);

  const fetchSubmission = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/quiz-student/${quizId}/submission/${studentId}`
      );
      setSubmission(res.data);
    } catch (err) {
      console.error("❌ Error fetching submission:", err.response?.data || err.message);
    }
  };

  if (!submission) return <p>⏳ Loading results...</p>;

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📊 Quiz Results</h2>
          <p style={{ fontSize: "18px", marginBottom: "20px" }}>
            ✅ Score: <b>{submission.score}</b> / {submission.total}
          </p>

          <div className="answers-list">
            {submission.answers.map((a, index) => (
              <div key={a.questionId._id} className="answer-card">
                <h4>Q{index + 1}</h4>
                {a.questionId.imageUrl && (
                  <img
                  src={a.questionId.imageUrl}
                  alt="question"
                  className="answer-image"
                />

                )}
                <p>
                  <b>Your Answer:</b>{" "}
                  <span style={{ color: a.isCorrect ? "green" : "red" }}>
                    {a.answer || "Not answered"}
                  </span>{" "}
                  {a.isCorrect ? "✅ Correct" : "❌ Wrong"}
                </p>
                {!a.isCorrect && (
                  <p>
                    <b>Correct Answer:</b>{" "}
                    <span style={{ color: "green" }}>{a.questionId.correctAnswer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default QuizResult;
