import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import { ClipboardText, PlusCircle, CalendarBlank, X } from "phosphor-react";
import "./CreateQuiz.css";

function CreateQuiz() {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [years, setYears] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user.realTeacherId || user.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (teacherId) {
      fetchYears();
    }
  }, [teacherId]);

  const toUTCString = (localDateTime) => {
    if (!localDateTime) return null;
    const [date, time] = localDateTime.split("T");
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = time.split(":").map(Number);
    return new Date(y, m - 1, d, h, min).toISOString();
  };

  const fetchYears = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/year/${teacherId}`
      );
      setYears(res.data);
    } catch {
      toast.error("❌ Failed to load years");
    }
  };

  const fetchQuestionsByYear = async (yearId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/questions/${teacherId}/${yearId}`
      );
      setQuestions(res.data);
    } catch {
      toast.error("❌ Failed to load questions");
    }
  };

  const fetchUnits = async (yearId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/${teacherId}/${yearId}`
      );
      setUnits(res.data);
    } catch {
      toast.error("❌ Failed to load units");
    }
  };

  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`
      );
      setChapters(res.data);
    } catch {
      toast.error("❌ Failed to load chapters");
    }
  };

  const createQuiz = async () => {
    if (!title || !selectedYear || !selectedGroups.length || !selectedQuestions.length) {
      return toast.warn("⚠️ Please fill all required fields");
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/quiz`, {
        title,
        teacherId,
        duration,
        groups: selectedGroups,
        questions: selectedQuestions,
        startTime: toUTCString(startTime),
        endTime: toUTCString(endTime),
      });
      toast.success("✅ Quiz created!");
      setTitle("");
      setDuration(30);
      setSelectedYear("");
      setSelectedGroups([]);
      setSelectedUnit("");
      setSelectedChapter("");
      setSelectedQuestions([]);
      setUnits([]);
      setChapters([]);
      setStartTime("");
      setEndTime("");
    } catch {
      toast.error("❌ Failed to create quiz");
    }
  };

  const filteredQuestions = questions.filter((q) => {
    return (
      (!selectedUnit || q.unitId?._id === selectedUnit) &&
      (!selectedChapter || q.chapterId?._id === selectedChapter)
    );
  });

  return (
    <div className="page-layout">
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main
        className={`createquiz-container ${
          sidebarOpen ? "with-sidebar" : "full-width"
        }`}
      >
        <div className="createquiz-card">
          <h2 className="page-title">
            <ClipboardText size={26} /> Create New Quiz
          </h2>

          {/* === Quiz Details === */}
          <div className="form-section">
            <label className="field-label">Quiz Title</label>
            <input
              type="text"
              value={title}
              placeholder="Enter quiz title"
              onChange={(e) => setTitle(e.target.value)}
              className="styled-input"
            />

            <label className="field-label">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="styled-input"
            />
          </div>

          {/* === Year Selection === */}
          <label className="field-label">Select Year</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              const yearId = e.target.value;
              setSelectedYear(yearId);
              setSelectedGroups([]);
              setSelectedUnit("");
              setSelectedChapter("");
              setQuestions([]);
              setUnits([]);
              setChapters([]);
              if (yearId) {
                fetchUnits(yearId);
                fetchQuestionsByYear(yearId);
              }
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

          {/* === Group Selection === */}
          {selectedYear && (
            <div>
              <label className="field-label">Assign to Groups</label>
              <div className="checkbox-grid">
                {years.find((y) => y._id === selectedYear)?.groups?.map((g) => (
                  <label
                    key={g._id}
                    className={`checkbox-card ${
                      selectedGroups.includes(g._id) ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={g._id}
                      checked={selectedGroups.includes(g._id)}
                      onChange={(e) =>
                        setSelectedGroups((prev) =>
                          e.target.checked
                            ? [...prev, g._id]
                            : prev.filter((id) => id !== g._id)
                        )
                      }
                    />
                    {g.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* === Unit & Chapter Filters === */}
          {units.length > 0 && (
            <>
              <label className="field-label">Filter by Unit</label>
              <select
                value={selectedUnit}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedUnit(id);
                  setSelectedChapter("");
                  if (id) fetchChapters(id);
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
            </>
          )}

          {chapters.length > 0 && (
            <>
              <label className="field-label">Filter by Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="styled-select"
              >
                <option value="">-- All Chapters --</option>
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* === Question Picker === */}
          {selectedYear && (
            <>
              <label className="field-label">Select Questions</label>
              <div className="question-grid">
                {filteredQuestions.length === 0 ? (
                  <p className="no-data">
                    No questions found for this selection.
                  </p>
                ) : (
                  filteredQuestions.map((q) => (
                    <div
                      key={q._id}
                      className={`question-box ${
                        selectedQuestions.includes(q._id) ? "selected" : ""
                      }`}
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
                          src={q.imageUrl}
                          alt="question"
                          className="question-thumb"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(q.imageUrl);
                          }}
                        />
                      )}
                      <p>
                        {q.unitId?.name} → {q.chapterId?.name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* === Preview Modal === */}
          {previewImage && (
            <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <img src={previewImage} alt="Preview" className="preview-img" />
                <button
                  className="btn btn-blue small-btn"
                  onClick={() => setPreviewImage(null)}
                >
                  <X size={20} /> Close
                </button>
              </div>
            </div>
          )}

          {/* === Optional Time Settings === */}
          <div className="form-section">
            <label className="field-label">
              <CalendarBlank size={18} /> Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="styled-input"
            />

            <label className="field-label">
              <CalendarBlank size={18} /> End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="styled-input"
            />
          </div>

          <button onClick={createQuiz} className="btn btn-blue submit-btn">
            <PlusCircle size={20} /> Create Quiz
          </button>
        </div>
      </main>
    </div>
  );
}

export default CreateQuiz;
