import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/AppStyles.css";

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [units, setUnits] = useState([]);
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (teacherId) {
      fetchQuestions();
      fetchUnits();
    }
  }, [teacherId]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/questions/${teacherId}`);
      setQuestions(res.data);
    } catch (err) {
      console.error("❌ Error fetching questions:", err);
      toast.error("❌ Failed to load questions");
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/unit/${teacherId}`);
      setUnits(res.data);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/question/${id}`);
      toast.success("✅ Question deleted");
      fetchQuestions();
    } catch (err) {
      console.error("❌ Error deleting question:", err);
      toast.error("❌ Failed to delete question");
    }
  };

  // 🔹 Filtering
  const filteredQuestions = questions.filter((q) => {
    if (filterUnit !== "all" && q.unitId?._id !== filterUnit) return false;
    if (filterChapter !== "all" && q.chapterId?._id !== filterChapter) return false;
    return true;
  });

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* === Sidebar === */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
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

      {/* === Main Content === */}
      <main className="page-container">
        <div className="section-card">
          <h3 className="card-title">📋 Uploaded Questions</h3>

          {/* Filters */}
          <div className="form-inline" style={{ justifyContent: "center" }}>
            <select
              value={filterUnit}
              onChange={(e) => {
                setFilterUnit(e.target.value);
                setFilterChapter("all");
              }}
              className="styled-select"
            >
              <option value="all">All Units</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="styled-select"
              disabled={filterUnit === "all"}
            >
              <option value="all">All Chapters</option>
              {filterUnit !== "all" &&
                units
                  .find((u) => u._id === filterUnit)
                  ?.chapters?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
            </select>
          </div>

          {/* List */}
          {filteredQuestions.length === 0 ? (
            <p style={{ textAlign: "center", color: "#555" }}>No questions found.</p>
          ) : (
            <ul className="list-unstyled">
              {filteredQuestions.map((q) => (
                <li key={q._id} className="list-item" style={{ display: "flex", alignItems: "center" }}>
                  {/* Image */}
                  {q.imageUrl && (
                    <img
                      src={`${process.env.REACT_APP_API_URL}${q.imageUrl}`}
                      alt="question"
                      className="question-thumb"
                      onClick={() => setPreviewImage(`${process.env.REACT_APP_API_URL}${q.imageUrl}`)}
                    />
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, marginLeft: "15px" }}>
                    <p>
                      <b>Correct Answer:</b> {q.correctAnswer}
                    </p>
                    <p>
                      <b>Unit:</b> {q.unitId?.name} | <b>Chapter:</b> {q.chapterId?.name}
                    </p>
                  </div>

                  {/* Delete */}
                  <button onClick={() => deleteQuestion(q._id)} className="btn btn-purple small-btn">
                    🗑 Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* === Preview Modal === */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="preview" style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: "8px" }} />
            <button className="btn btn-blue small-btn" style={{ marginTop: "10px" }} onClick={() => setPreviewImage(null)}>
              ✖ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionList;
