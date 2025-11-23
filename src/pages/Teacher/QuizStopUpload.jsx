import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UploadSimple } from "phosphor-react";
import TeacherSidebar from "./../../components/TeacherSidebar";
import "./QuizStopUpload.css";

export default function QuizStopUpload() {
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
  const teacherId = user.realTeacherId || user.id;

  useEffect(() => {
    if (teacherId) fetchYears();
  }, [teacherId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedYear || !selectedUnit || !selectedChapter || !correctAnswer || !image) {
      return toast.warn("⚠️ Please fill all fields");
    }

    try {
      const formData = new FormData();
      formData.append("yearId", selectedYear);
      formData.append("unitId", selectedUnit);
      formData.append("chapterId", selectedChapter);
      formData.append("teacherId", teacherId);
      formData.append("correctAnswer", correctAnswer);
      formData.append("image", image);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/quizstop/question`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("✅ Quiz Stop Question uploaded!");
    } catch {
      toast.error("❌ Upload failed");
    }
  };

  return (
    <div className="page-layout">
    <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`upload-container ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
        <div className="upload-card">
          <h2 className="upload-title">
            <UploadSimple size={22} /> Upload Quiz Stop Question
          </h2>

          <form onSubmit={handleSubmit} className="upload-form">
            {/* Year */}
            <label className="field-label">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedUnit("");
                setSelectedChapter("");
                fetchUnits(e.target.value);
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

            {/* Unit */}
            <label className="field-label">Select Unit</label>
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                fetchChapters(e.target.value);
              }}
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
            >
              <option value="">-- Select Chapter --</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Image Upload */}
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

            <button type="submit" className="btn btn-blue submit-btn">
              Upload Quiz Stop Question
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
