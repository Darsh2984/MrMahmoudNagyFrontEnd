import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherSidebar from "../../components/TeacherSidebar";
import "../../styles/AppStyles.css";

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
      console.error("Error fetching years", err);
    }
  };

  const fetchQuizzes = async (groupId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/inclassquiz/${groupId}`);
      setQuizzes(res.data);
    } catch (err) {
      console.error("Error fetching quizzes", err);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/inclassquiz`, {
        teacherId,
        yearId: selectedYear,
        groupId: selectedGroup,
        ...form,
      });
      setShowForm(false);
      setForm({ quizName: "", date: "", gradeOutOf: "" });
      fetchQuizzes(selectedGroup);
      alert("✅ Quiz created successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create quiz");
    }
  };

  const handleSaveGrades = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/inclassquiz/${activeQuiz._id}/grades`, {
        studentGrades: grades,
      });
      alert("✅ Grades saved");
      setActiveQuiz(null);
    } catch (err) {
      console.error("Error saving grades", err);
    }
  };

  const openGradesEditor = (quiz) => {
    setActiveQuiz(quiz);
    setGrades(quiz.studentGrades || []);
  };

  // 🔹 Format a date as DD MM YYYY
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-GB", { month: "short" }); // "Jan", "Feb", "Mar"...
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="page-container">
        {/* Year Selection */}
        <div className="section-card" style={{ textAlign: "center" }}>
          <h3>Select Year</h3>
          <select
            className="styled-select"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedGroup("");
              setQuizzes([]);
            }}
          >
            <option value="">-- Select Year --</option>
            {years.map((y) => (
              <option key={y._id} value={y._id}>{y.name}</option>
            ))}
          </select>
        </div>

        {/* Group Selection */}
        {selectedYear && (
          <div className="section-card" style={{ textAlign: "center" }}>
            <h3>Select Group</h3>
            <select
              className="styled-select"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                fetchQuizzes(e.target.value);
              }}
            >
              <option value="">-- Select Group --</option>
              {years.find((y) => y._id === selectedYear)?.groups?.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Quiz List */}
        {selectedGroup && (
          <div className="section-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Existing In-Class Quizzes</h3>
              <button className="btn btn-purple" onClick={() => setShowForm(!showForm)}>
                Create Quiz
              </button>
            </div>

            {showForm && (
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Quiz Name"
                  value={form.quizName}
                  onChange={(e) => setForm({ ...form, quizName: e.target.value })}
                  className="styled-input"
                />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="styled-input"
                />
                <input
                  type="number"
                  placeholder="Grade Out Of"
                  value={form.gradeOutOf}
                  onChange={(e) => setForm({ ...form, gradeOutOf: e.target.value })}
                  className="styled-input"
                />
                <button className="btn btn-purple" onClick={handleCreateQuiz}>Save</button>
              </div>
            )}

            <table className="styled-table">
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
                      <button className="btn btn-blue" onClick={() => openGradesEditor(q)}>
                        ✏️ Enter Grades
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grade Entry Section */}
        {activeQuiz && (
          <div className="section-card">
            <h3>Grades for {activeQuiz.quizName}</h3>
            {grades.map((s, idx) => (
              <div key={idx} className="form-grid">
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
                  className="styled-input"
                />
              </div>
            ))}

            <button className="btn btn-purple" onClick={handleSaveGrades}>
              💾 Save Grades
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
