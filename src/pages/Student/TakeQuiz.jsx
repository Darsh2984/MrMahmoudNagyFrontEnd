import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id;

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/quiz/id/${quizId}`
      );
      setQuiz(res.data);
      setTimeLeft(res.data.duration * 60); // convert minutes to seconds
    } catch (err) {
      console.error("❌ Error fetching quiz:", err);
    }
  };

  // ⏳ Timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [timeLeft]);

  const handleAnswer = (qId, ans) => {
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  const handleSubmit = async () => {
    if (submitting) return; // prevent double submission
    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/quiz-student/${quizId}/submit`,
        {
          studentId,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }
      );
      navigate(`/student/quiz-result/${quizId}`);
    } catch (err) {
      console.error("❌ Error submitting quiz:", err);
      setSubmitting(false);
    }
  };

  if (!quiz) return <p style={{ textAlign: "center" }}>⏳ Loading quiz...</p>;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
      }}
    >
      <h2>{quiz.title}</h2>
      <p>
        ⏳ Time left:{" "}
        {timeLeft !== null
          ? `${Math.max(Math.floor(timeLeft / 60), 0)}:${String(
              Math.max(timeLeft % 60, 0)
            ).padStart(2, "0")}`
          : "--:--"}
      </p>

      {quiz.questions && quiz.questions.length > 0 ? (
        quiz.questions.map((q, index) => (
          <div
            key={q._id}
            style={{
              marginBottom: "20px",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            <h4>Q{index + 1}</h4>
            {q.imageUrl && (
              <img
                src={`${process.env.REACT_APP_API_URL}${q.imageUrl}`}
                alt="question"
                style={{ maxWidth: "100%", marginBottom: "10px" }}
              />
            )}
            <div style={{ marginTop: "10px" }}>
              {["A", "B", "C", "D"].map((opt) => (
                <label
                  key={opt}
                  style={{ display: "block", marginBottom: "5px" }}
                >
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={() => handleAnswer(q._id, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>No questions found for this quiz.</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          background: submitting ? "#95a5a6" : "#27ae60",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: submitting ? "not-allowed" : "pointer",
        }}
      >
        {submitting ? "Submitting..." : "✅ Submit Quiz"}
      </button>
    </div>
  );
}

export default TakeQuiz;
