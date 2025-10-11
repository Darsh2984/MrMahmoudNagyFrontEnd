import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, CheckCircle } from "phosphor-react";
import "./TakeQuiz.css";

function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id;

  // === Fetch Quiz ===
  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/quiz/id/${quizId}`);
      const q = res.data;
      setQuiz(q);

      // Check if timer already started in localStorage
      const savedStart = localStorage.getItem(`quizStart_${quizId}`);
      const now = Date.now();
      let remaining;

      if (savedStart) {
        const elapsed = Math.floor((now - parseInt(savedStart)) / 1000);
        remaining = q.duration * 60 - elapsed;
      } else {
        localStorage.setItem(`quizStart_${quizId}`, now.toString());
        remaining = q.duration * 60;
      }

      setTimeLeft(remaining > 0 ? remaining : 0);
    } catch (err) {
      console.error("❌ Error fetching quiz:", err);
    }
  };

  // === Timer (persists across refresh) ===
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

  // === Select Answer ===
  const handleAnswer = (qId, ans) => {
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  // === Submit ===
  const handleSubmit = async () => {
    if (submitting) return;
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
      localStorage.removeItem(`quizStart_${quizId}`);
      navigate(`/student/quiz-result/${quizId}`);
    } catch (err) {
      console.error("❌ Error submitting quiz:", err);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (!quiz)
    return <p className="loading-msg">⏳ Loading quiz...</p>;

  return (
    <div className="quiz-layout">
      <div className="quiz-container">
        <header className="quiz-header">
          <h2>{quiz.title}</h2>
          <div className="timer-box">
            <Clock size={20} />
            <span>Time Left: {formatTime(timeLeft || 0)}</span>
          </div>
        </header>

        {quiz.questions && quiz.questions.length > 0 ? (
          quiz.questions.map((q, index) => (
            <div key={q._id} className="question-card">
              <h4>Q{index + 1}</h4>
              {q.imageUrl && (
                <img
                  src={q.imageUrl}
                  alt="question"
                  className="question-image"
                />
              )}
              <div className="options-list">
                {["A", "B", "C", "D"].map((opt) => (
                  <div key={opt} className="option-row">
                    <input
                      type="radio"
                      id={`${q._id}_${opt}`}
                      name={q._id}
                      value={opt}
                      checked={answers[q._id] === opt}
                      onChange={() => handleAnswer(q._id, opt)}
                    />
                    <label htmlFor={`${q._id}_${opt}`} className="option-label">
                      {opt}
                    </label>
                  </div>
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
          className={`btn-submit ${submitting ? "disabled" : ""}`}
        >
          {submitting ? "Submitting..." : (
            <>
              <CheckCircle size={18} /> Submit Quiz
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default TakeQuiz;
