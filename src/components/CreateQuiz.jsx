import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/AppStyles.css";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [years, setYears] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [filterUnit, setFilterUnit] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (teacherId) {
      fetchYears();
      fetchQuestions();
      fetchUnits();
    }
  }, [teacherId]);

  const fetchYears = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch (err) {
      console.error("❌ Error fetching years:", err);
      toast.error("❌ Failed to load years");
    }
  };

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
      toast.error("❌ Failed to load units");
    }
  };

  const createQuiz = async () => {
    if (!title || !selectedYear || !selectedGroups.length || !duration || !selectedQuestions.length) {
      return toast.warn("⚠️ Title, year, groups, duration, and questions are required");
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/quiz`, {
        title,
        teacherId,
        groups: selectedGroups,
        duration,
        questions: selectedQuestions,
        startTime: startTime || null,
        endTime: endTime || null,
      });

      toast.success("✅ Quiz created!");
      setTitle("");
      setDuration(30);
      setSelectedYear("");
      setSelectedGroups([]);
      setSelectedQuestions([]);
      setFilterUnit("");
      setFilterChapter("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error("❌ Error creating quiz:", err);
      toast.error("❌ Failed to create quiz");
    }
  };

  // 🔹 Filter questions
  const filteredQuestions = questions.filter((q) => {
    return (
      (!filterUnit || q.unitId?._id === filterUnit) &&
      (!filterChapter || q.chapterId?._id === filterChapter)
    );
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
          <h2 className="card-title">📝 Create New Quiz</h2>

          {/* Quiz Title */}
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="styled-input"
          />

          {/* Duration */}
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="styled-input"
          />

          {/* Year Selector */}
          <label className="form-label">Select Year</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedGroups([]);
            }}
            className="styled-select"
          >
            <option value="">-- Select Year --</option>
            {years.map((y) => (
              <option key={y._id} value={y._id}>
                {y.name}
              </option>
            ))}
          </select>

          {/* Groups */}
          {selectedYear && (
            <div>
              <label className="form-label">Assign to Groups</label>
              <div className="checkbox-grid">
                {years.find((y) => y._id === selectedYear)?.groups?.map((g) => (
                  <label
                    key={g._id}
                    className={`checkbox-card ${selectedGroups.includes(g._id) ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      value={g._id}
                      checked={selectedGroups.includes(g._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGroups([...selectedGroups, g._id]);
                        } else {
                          setSelectedGroups(selectedGroups.filter((id) => id !== g._id));
                        }
                      }}
                    />
                    {g.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <label className="form-label">Filter by Unit</label>
          <select
            value={filterUnit}
            onChange={(e) => {
              setFilterUnit(e.target.value);
              setFilterChapter("");
            }}
            className="styled-select"
          >
            <option value="">-- All Units --</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <label className="form-label">Filter by Chapter</label>
          <select
            value={filterChapter}
            onChange={(e) => setFilterChapter(e.target.value)}
            className="styled-select"
            disabled={!filterUnit}
          >
            <option value="">-- All Chapters --</option>
            {units
              .find((u) => u._id === filterUnit)
              ?.chapters?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>

          {/* Questions */}
          <label className="form-label">Select Questions</label>
          <div className="question-grid">
            {filteredQuestions.map((q) => (
              <div
                key={q._id}
                className={`question-card ${selectedQuestions.includes(q._id) ? "selected" : ""}`}
                onClick={() =>
                  setSelectedQuestions((prev) =>
                    prev.includes(q._id)
                      ? prev.filter((id) => id !== q._id)
                      : [...prev, q._id]
                  )
                }
              >
                {q.imageUrl && (
                  <img
                    src={`${process.env.REACT_APP_API_URL}${q.imageUrl}`}
                    alt="question"
                    className="question-thumb"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(`${process.env.REACT_APP_API_URL}${q.imageUrl}`);
                    }}
                  />
                )}
                <p className="question-meta">
                  {q.unitId?.name} → {q.chapterId?.name}
                </p>
              </div>
            ))}
          </div>

          {/* Image Preview */}
          {previewImage && (
            <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <img src={previewImage} alt="Full Preview" style={{ maxWidth: "100%", maxHeight: "90vh" }} />
                <button className="btn btn-blue small-btn" style={{ marginTop: "10px" }} onClick={() => setPreviewImage(null)}>
                  ✖ Close
                </button>
              </div>
            </div>
          )}

          {/* Optional Times */}
          <label className="form-label">Start Time (optional)</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="styled-input"
          />

          <label className="form-label">End Time (optional)</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="styled-input"
          />

          {/* Submit */}
          <button onClick={createQuiz} className="btn btn-purple">
            Create Quiz
          </button>
        </div>
      </main>
    </div>
  );
}

export default CreateQuiz;
