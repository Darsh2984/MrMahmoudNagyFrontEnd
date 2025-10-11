import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import { Funnel, Trash, ArrowsClockwise, X } from "phosphor-react";
import "./QuestionList.css";

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [years, setYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [filterYear, setFilterYear] = useState("all");
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterChapter, setFilterChapter] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user.realTeacherId || user.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (teacherId) {
      fetchQuestions();
      fetchYears(teacherId);
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

  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch (err) {
      console.error("❌ Error fetching years:", err);
      toast.error("❌ Failed to load years");
    }
  };

  const fetchUnits = async (yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/unit/${teacherId}/${yearId}`);
      setUnits(res.data);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
      toast.error("❌ Failed to load units");
    }
  };

  const deleteQuestion = async (id) => {
    toast.info(
      <div className="toast-confirm">
        <p>🗑 Are you sure you want to delete this question?</p>
        <div className="toast-actions">
          <button
            onClick={async () => {
              try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/question/${id}/${teacherId}`);
                toast.dismiss();
                toast.success("✅ Question deleted");
                fetchQuestions();
              } catch (err) {
                console.error("❌ Error deleting question:", err);
                toast.error("❌ Failed to delete question");
              }
            }}
            className="toast-btn-confirm"
          >
            Confirm
          </button>
          <button onClick={() => toast.dismiss()} className="toast-btn-cancel">
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterYear !== "all" && q.yearId?._id !== filterYear) return false;
    if (filterUnit !== "all" && q.unitId?._id !== filterUnit) return false;
    if (filterChapter !== "all" && q.chapterId?._id !== filterChapter) return false;
    return true;
  });

  return (
    <div className="page-layout">
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`questionlist-container ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
        {/* === Header === */}
        <header className="questionlist-header">
          <h2>🧾 Uploaded Questions</h2>
          <button onClick={fetchQuestions} className="btn-refresh">
            <ArrowsClockwise size={18} /> Refresh
          </button>
        </header>

        {/* === Filters === */}
        <div className="filter-bar">
          <Funnel size={20} color="#0b3c49" />
          <select
            value={filterYear}
            onChange={(e) => {
              const yearId = e.target.value;
              setFilterYear(yearId);
              setFilterUnit("all");
              setFilterChapter("all");
              setUnits([]);
              if (yearId !== "all") fetchUnits(yearId);
            }}
            className="styled-select"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y._id} value={y._id}>
                {y.name}
              </option>
            ))}
          </select>

          <select
            value={filterUnit}
            onChange={(e) => {
              setFilterUnit(e.target.value);
              setFilterChapter("all");
            }}
            className="styled-select"
            disabled={filterYear === "all"}
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
              units.find((u) => u._id === filterUnit)?.chapters?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* === Questions === */}
        <div className="questions-list">
          {filteredQuestions.length === 0 ? (
            <p className="no-data">No questions found.</p>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q._id} className="question-card">
                {q.imageUrl && (
                  <img
                    src={q.imageUrl}
                    alt="question"
                    className="question-thumb"
                    onClick={() => setPreviewImage(q.imageUrl)}
                  />
                )}

                <div className="question-info">
                  <p>
                    <b>Correct Answer:</b> {q.correctAnswer}
                  </p>
                  <p>
                    <b>Year:</b> {q.yearId?.name} | <b>Unit:</b> {q.unitId?.name} |{" "}
                    <b>Chapter:</b> {q.chapterId?.name}
                  </p>
                </div>

                <button onClick={() => deleteQuestion(q._id)} className="btn btn-red small-btn">
                  <Trash size={18} /> Delete
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* === Modal Preview === */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="preview" className="preview-img" />
            <button className="btn btn-blue small-btn" onClick={() => setPreviewImage(null)}>
              <X size={20} /> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionList;
