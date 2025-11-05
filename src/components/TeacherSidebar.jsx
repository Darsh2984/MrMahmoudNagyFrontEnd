import React from "react";
import { useNavigate } from "react-router-dom";
import {
  House,
  BookOpen,
  FileText,
  ListChecks,
  ClipboardText,
  Calculator,
  ChartBar,
  UsersThree,
  VideoCamera,
  File,
  UserPlus,
  X,
  List,
} from "phosphor-react";
import "./TeacherSidebar.css";

function TeacherSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`teacher-sidebar ${sidebarOpen ? "" : "closed"}`}>
        <div className="sidebar-header">
          <h2>📚 Teacher</h2>
        </div>

        <div className="sidebar-menu">
          <ul>
            <li onClick={() => navigate("/teacher-dashboard")}>
              <House size={20} weight="duotone" /> <span>Home</span>
            </li>
            <li onClick={() => navigate("/manage-units")}>
              <BookOpen size={20} weight="duotone" /> <span>Units & Chapters</span>
            </li>
            <li onClick={() => navigate("/questions")}>
              <FileText size={20} weight="duotone" /> <span>Questions</span>
            </li>
            <li onClick={() => navigate("/createquiz")}>
              <ListChecks size={20} weight="duotone" /> <span>Create Quiz</span>
            </li>
            <li onClick={() => navigate("/quizlist")}>
              <ClipboardText size={20} weight="duotone" /> <span>Quiz Lists</span>
            </li>
            <li onClick={() => navigate("/teacher/inclassquizzes")}>
              <Calculator size={20} weight="duotone" /> <span>In-Class Quizzes</span>
            </li>
            <li onClick={() => navigate("/studentsperformance")}>
              <ChartBar size={20} weight="duotone" /> <span>Performance</span>
            </li>
            <li onClick={() => navigate("/teacher/attendance")}>
              <UsersThree size={20} weight="duotone" /> <span>Attendance</span>
            </li>
            <li onClick={() => navigate("/teacher-tasks")}>
              <FileText size={20} weight="duotone" /> <span>Homework / Exams</span>
            </li>
            <li onClick={() => navigate("/videomanager")}>
              <VideoCamera size={20} weight="duotone" /> <span>Upload Videos</span>
            </li>
            <li onClick={() => navigate("/PDFManager")}>
              <File size={20} weight="duotone" /> <span>Course Materials</span>
            </li>
            <li onClick={() => navigate("/teacher/add-assistant")}>
              <UserPlus size={20} weight="duotone" /> <span>Add Assistant</span>
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            Logout
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

export default TeacherSidebar;
