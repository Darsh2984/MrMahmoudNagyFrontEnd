import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/AppStyles.css";
import TeacherSidebar from "./TeacherSidebar"; // ✅ import new sidebar


function QuestionUpload() {
  const [years, setYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [image, setImage] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.id;
  const navigate = useNavigate();

  // 🔹 Fetch teacher's years
  useEffect(() => {
    if (teacherId) fetchYears();
  }, [teacherId]);

  const fetchYears = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/year/${teacherId}`
      );
      setYears(res.data);
    } catch (err) {
      console.error("❌ Error fetching years:", err);
      toast.error("❌ Failed to load years");
    }
  };

  const fetchUnits = async (yearId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/${teacherId}/${yearId}`
      );
      setUnits(res.data);
    } catch (err) {
      console.error("❌ Error fetching units:", err);
      toast.error("❌ Failed to load units");
    }
  };

  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`
      );
      setChapters(res.data);
    } catch (err) {
      console.error("❌ Error fetching chapters:", err);
      toast.error("❌ Failed to load chapters");
    }
  };

  const handleYearChange = (yearId) => {
    setSelectedYear(yearId);
    setSelectedUnit("");
    setSelectedChapter("");
    setUnits([]);
    setChapters([]);
    if (yearId) fetchUnits(yearId);
  };

  const handleUnitChange = (unitId) => {
    setSelectedUnit(unitId);
    setSelectedChapter("");
    setChapters([]);
    if (unitId) fetchChapters(unitId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedYear || !selectedUnit || !selectedChapter || !correctAnswer || !image) {
      return toast.warn("⚠️ Please fill all fields");
    }

    try {
      const formData = new FormData();
      formData.append("yearId", selectedYear);   // ✅ include year
      formData.append("unitId", selectedUnit);
      formData.append("chapterId", selectedChapter);
      formData.append("teacherId", teacherId);
      formData.append("correctAnswer", correctAnswer);
      formData.append("image", image);

      await axios.post(`${process.env.REACT_APP_API_URL}/api/question`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Question uploaded!");
      // reset fields
      setSelectedYear("");
      setSelectedUnit("");
      setSelectedChapter("");
      setCorrectAnswer("");
      setImage(null);
      setUnits([]);
      setChapters([]);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("❌ Error uploading question:", err);
      toast.error("❌ Failed to upload question");
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
       {/* ✅ Sidebar extracted */}
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* === Main Content === */}
      <main className="page-container">
        <div className="section-card">
          <h3 className="card-title">📤 Upload MCQ Question</h3>

          <form onSubmit={handleSubmit}>
            {/* Year */}
            <label className="field-label">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="styled-select"
            >
              <option value="">-- Select Year --</option>
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name}
                </option>
              ))}
            </select>

            {/* Unit */}
            <label className="field-label">Select Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="styled-select"
              disabled={!selectedYear}
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
