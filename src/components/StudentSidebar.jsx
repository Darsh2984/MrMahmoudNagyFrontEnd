import React from "react";
import { useNavigate } from "react-router-dom";
import {
  House,
  ClipboardText,
  PencilLine,
  ChartBar,
  TrendUp,
  VideoCamera,
  BookOpen,
  Brain,
  Student,
  SignOut,
  X,
  List,
  ChatCircle,
  Chat,
} from "phosphor-react";
import "./StudentSidebar.css";

function StudentSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`student-sidebar ${sidebarOpen ? "" : "closed"}`}>
        <div className="sidebar-header">
          <h2>🎓 Student</h2>
        </div>

        <div className="sidebar-menu">
          <ul>
            <li onClick={() => navigate("/student-dashboard")}>
              <House size={20} weight="duotone" /> <span>Dashboard</span>
            </li>
            <li onClick={() => navigate("/student-tasks")}>
              <ClipboardText size={20} weight="duotone" /> <span>Homework / Exams</span>
            </li>
            <li onClick={() => navigate("/student-quizzes")}>
              <PencilLine size={20} weight="duotone" /> <span>My Quizzes</span>
            </li>
            <li onClick={() => navigate("/student-attendance")}>
              <ChartBar size={20} weight="duotone" /> <span>My Attendance</span>
            </li>
            <li onClick={() => navigate("/student-performance")}>
              <TrendUp size={20} weight="duotone" /> <span>My Performance</span>
            </li>
            <li onClick={() => navigate("/StudentVideoViewer")}>
              <VideoCamera size={20} weight="duotone" /> <span>Course Videos</span>
            </li>
            <li onClick={() => navigate("/MaterialViewer")}>
              <BookOpen size={20} weight="duotone" /> <span>Course Materials</span>
            </li>
            <li onClick={() => navigate("/student/create-ticket")}>
              <Chat size={20} weight="duotone" /> <span>Contact Support Team</span>
            </li>
            
            <li
              onClick={() =>
                window.open(
                  "https://chat.openai.com/g/g-68daa005e46081919fe3515f32c48f72-ask-mahmoud-nagys-mind-3-0",
                  "_blank"
                )
              }
            >
              <Brain size={20} weight="duotone" /> <span>Mahmoud Nagy's Mind</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            <SignOut size={18} weight="duotone" /> Logout
          </button>
        </div>
      </aside>

      {/* Floating Toggle Button */}
      <button
        className="toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {sidebarOpen ? <X size={22} weight="bold" /> : <List size={24} weight="bold" />}
      </button>
    </>
  );
}

export default StudentSidebar;
