import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "phosphor-react";
import "./SpecialStudentQuizResult.css";

export default function SpecialStudentQuizResult() {
  const { quizId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      setError("❌ Failed to load quiz results.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading-msg">⏳ Loading results...</p>;
  if (error) return <p className="error-msg">{error}</p>;
  if (!submission) return <p className="error-msg">❌ No result found.</p>;

  return (
    <div className="special-student-quizresult">
      <header className="special-header">
        <div className="back-btn" onClick={() => navigate("/specialstudent-dashboard")}>
          <ArrowLeft size={20} /> <span>Back to Dashboard</span>
        </div>
        <h1>📊 Quiz Results</h1>
        <p>Review your answers and see the correct ones</p>
        <div className="header-underline"></div>
      </header>

      <section className="quiz-section">
        <div className="quiz-card">
          <div className="score-box">
            ✅ Score: <b>{submission.score}</b> / {submission.total}
          </div>

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
                  <span className={a.isCorrect ? "correct" : "wrong"}>
                    {a.answer || "Not answered"}
                  </span>{" "}
                  {a.isCorrect ? "✅ Correct" : "❌ Wrong"}
                </p>
                {!a.isCorrect && (
                  <p>
                    <b>Correct Answer:</b>{" "}
                    <span className="correct">{a.questionId.correctAnswer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
