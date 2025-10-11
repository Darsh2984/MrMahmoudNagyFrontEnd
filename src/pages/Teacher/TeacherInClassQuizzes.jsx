import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { PlusCircle, PencilSimple, FloppyDisk } from "phosphor-react";
import TeacherSidebar from "../../components/TeacherSidebar";
import "./TeacherInClassQuizzes.css";

export default function TeacherInClassQuizzes() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ quizName: "", date: "", gradeOutOf: "" });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [grades, setGrades] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      setTeacherId(user.id);
      fetchYears(user.id);
    }
  }, []);

  const fetchYears = async (id) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${id}`);
      setYears(res.data);
    } catch (err) {
      toast.error("❌ Failed to fetch years");
    }
  };

  const fetchQuizzes = async (groupId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/inclassquiz/${groupId}`);
      setQuizzes(res.data);
    } catch (err) {
      toast.error("❌ Failed to fetch quizzes");
    }
  };

  const handleCreateQuiz = async () => {
    if (!form.quizName || !form.date || !form.gradeOutOf) {
      toast.warning("⚠️ Please fill in all fields");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/inclassquiz`, {
        teacherId,
        yearId: selectedYear,
        groupId: selectedGroup,
        ...form,
      });
      setShowForm(false);
      setForm({ quizName: "", date: "", gradeOutOf: "" });
      fetchQuizzes(selectedGroup);
      toast.success("✅ Quiz created successfully");
    } catch (err) {
      toast.error("❌ Failed to create quiz");
    }
  };

  const handleSaveGrades = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/inclassquiz/${activeQuiz._id}/grades`,
        { studentGrades: grades }
      );
      toast.success("✅ Grades saved successfully");
      setActiveQuiz(null);
    } catch (err) {
      toast.error("❌ Failed to save grades");
    }
  };

  const openGradesEditor = (quiz) => {
    setActiveQuiz(quiz);
    setGrades(quiz.studentGrades || []);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className={`teacher-inclass-page ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="teacher-inclass-container">
        {/* === Select Year === */}
        <div className="inclass-card">
          <h2 className="inclass-title">Select Year</h2>
          <select
            className="inclass-select"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedGroup("");
              setQuizzes([]);
            }}
          >
            <option value="">-- Select Year --</option>
            {years.map((y) => (
              <option key={y._id} value={y._id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>

        {/* === Select Group === */}
        {selectedYear && (
          <div className="inclass-card">
            <h2 className="inclass-title">Select Group</h2>
            <select
              className="inclass-select"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                fetchQuizzes(e.target.value);
              }}
            >
              <option value="">-- Select Group --</option>
              {years
                .find((y) => y._id === selectedYear)
                ?.groups?.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* === Quizzes List === */}
        {selectedGroup && (
          <div className="inclass-card">
            <div className="inclass-header">
              <h2 className="inclass-title">Existing In-Class Quizzes</h2>
              <button
                className="inclass-btn inclass-btn-blue"
                onClick={() => setShowForm(!showForm)}
              >
                <PlusCircle size={18} /> {showForm ? "Close" : "Create Quiz"}
              </button>
            </div>

            {showForm && (
              <div className="inclass-form-grid">
                <input
                  type="text"
                  placeholder="Quiz Name"
                  value={form.quizName}
                  onChange={(e) => setForm({ ...form, quizName: e.target.value })}
                  className="inclass-input"
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="inclass-input"
                />
                <input
                  type="number"
                  placeholder="Grade Out Of"
                  value={form.gradeOutOf}
                  onChange={(e) =>
                    setForm({ ...form, gradeOutOf: e.target.value })
                  }
                  className="inclass-input"
                />
                <button
                  className="inclass-btn inclass-btn-green"
                  onClick={handleCreateQuiz}
                >
                  <FloppyDisk size={18} /> Save
                </button>
              </div>
            )}

            <table className="inclass-table">
              <thead>
                <tr>
                  <th>Quiz Name</th>
                  <th>Date</th>
                  <th>Grade Out Of</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q._id}>
                    <td>{q.quizName}</td>
                    <td>{formatDate(q.date)}</td>
                    <td>{q.gradeOutOf}</td>
                    <td>
                      <button
                        className="inclass-btn inclass-btn-orange"
                        onClick={() => openGradesEditor(q)}
                      >
                        <PencilSimple size={18} /> Enter Grades
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* === Grade Editor === */}
        {activeQuiz && (
          <div className="inclass-card">
            <h2 className="inclass-title">
              Grades for {activeQuiz.quizName}
            </h2>
            {grades.map((s, idx) => (
              <div key={idx} className="inclass-form-grid">
                <span>{s.studentId?.name || "Unnamed Student"}</span>
                <input
                  type="number"
                  placeholder="Grade"
                  value={s.grade || ""}
                  onChange={(e) => {
                    const updated = [...grades];
                    updated[idx].grade = e.target.value;
                    setGrades(updated);
                  }}
                  className="inclass-input"
                />
              </div>
            ))}

            <button
              className="inclass-btn inclass-btn-blue"
              onClick={handleSaveGrades}
            >
              <FloppyDisk size={18} /> Save Grades
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
