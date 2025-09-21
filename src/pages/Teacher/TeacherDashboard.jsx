import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateYear from "../../components/CreateYear";
import AddStudentForm from "../../components/AddStudentForm";
import CreateSessionForm from "../../components/CreateSessionForm";
import SessionAttendance from "../../components/SessionAttendance";
import GroupSessions from "../../components/GroupSessions";
import CreateSchool from "../../components/CreateSchool";
import "../../styles/AppStyles.css"; // ✅ unified global CSS
import TeacherSidebar from "../../components/TeacherSidebar"; // ✅ import new sidebar


function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

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
      console.error("❌ Error fetching years:", err);
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* ✅ Sidebar extracted */}
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* === Main Content === */}
      <main className="page-container">
        {/* 🔹 Action Cards */}
        <div className="card-grid">
          <div className="dashboard-card" onClick={() => navigate("/manage-units")}>
            <h3>📘 Manage Units & Chapters</h3>
            <p>Create, edit and manage units and chapters.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/upload-question")}>
            <h3>📝 Upload MCQ Questions</h3>
            <p>Upload and organize your MCQ questions.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/createquiz")}>
            <h3>➕ Create Quiz</h3>
            <p>Generate quizzes from your uploaded questions.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/quizlist")}>
            <h3>📑 Quiz Lists</h3>
            <p>View and manage your created quizzes.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/teacher-tasks")}>
            <h3>📂 Create Tasks & Homework</h3>
            <p>Assign tasks and homework to students.</p>
          </div>
        </div>
        
        <div className="section-card">
          <CreateSchool teacherId={teacherId} />
        </div>

        {/* Manage Years & Groups */}
        <div className="section-card">
          <CreateYear teacherId={teacherId} years={years} fetchYears={fetchYears} />
        </div>

        <div className="section-card">
          <CreateSessionForm
            teacherId={teacherId}
            years={years}
            onSessionCreated={(groupId, session) => {
              setSelectedGroup(groupId);
              setActiveSessionId(session._id);
            }}
          />
        </div>

        {/* Group Sessions */}
        <div className="section-card" style={{ textAlign: "center" }}>
          <h3>👥 View Group Sessions</h3>
          <select
            className="styled-select"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setActiveSessionId(null);
            }}
          >
            <option value="">-- Select Group --</option>
            {years.flatMap((y) =>
              y.groups?.map((g) => (
                <option key={g._id} value={g._id}>
                  {y.name} - {g.name}
                </option>
              ))
            )}
          </select>
        </div>

        {selectedGroup && (
          <div className="section-card">
            <GroupSessions groupId={selectedGroup} onSelectSession={(sessionId) => setActiveSessionId(sessionId)} />
          </div>
        )}

        {activeSessionId && (
          <div className="section-card" style={{ textAlign: "center" }}>
            <SessionAttendance sessionId={activeSessionId} />
          </div>
        )}

         <div className="section-card">
          <AddStudentForm years={years} onStudentAdded={() => fetchYears(teacherId)} />
        </div>
        
      </main>
    </div>
  );
}

export default TeacherDashboard;
