import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/AppStyles.css";

function QuestionUpload() {
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [image, setImage] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (teacherId) fetchUnits();
  }, [teacherId]);

  const fetchUnits = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/unit/${teacherId}`);
      setUnits(res.data);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
      toast.error("❌ Failed to load units");
    }
  };

  const handleUnitChange = (unitId) => {
    setSelectedUnit(unitId);
    const unit = units.find((u) => u._id === unitId);
    setChapters(unit ? unit.chapters : []);
    setSelectedChapter("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUnit || !selectedChapter || !correctAnswer || !image) {
      return toast.warn("⚠️ Please fill all fields");
    }

    try {
      const formData = new FormData();
      formData.append("unitId", selectedUnit);
      formData.append("chapterId", selectedChapter);
      formData.append("teacherId", teacherId);
      formData.append("correctAnswer", correctAnswer);
      formData.append("image", image);

      await axios.post(`${process.env.REACT_APP_API_URL}/api/question`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Question uploaded!");
      setSelectedUnit("");
      setSelectedChapter("");
      setCorrectAnswer("");
      setImage(null);
    } catch (err) {
      console.error("❌ Error uploading question:", err);
      toast.error("❌ Failed to upload question");
    }
  };

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
          <h3 className="card-title">📤 Upload MCQ Question</h3>

          <form onSubmit={handleSubmit}>
            {/* Unit */}
            <label className="field-label">Select Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="styled-select"
            >
              <option value="">-- Select Unit --</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* Chapter */}
            <label className="field-label">Select Chapter</label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="styled-select"
              disabled={!selectedUnit}
            >
              <option value="">-- Select Chapter --</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Image */}
            <label className="field-label">Upload Question Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="styled-input"
            />

            {/* Correct Answer */}
            <label className="field-label">Correct Answer</label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="styled-select"
            >
              <option value="">-- Select Answer --</option>
              {["A", "B", "C", "D"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <br />
            <br />
            {/* Submit */}
            <button type="submit" className="btn btn-blue" style={{ width: "100%" }}>
              Upload
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default QuestionUpload;
