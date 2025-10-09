import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AppStyles.css"; // adjust path if needed
import {
  House,
  BookOpen,
  FileText,
  ListChecks,
  ClipboardText,
  Calculator,
  ChartBar,
  UsersThree,
  ChalkboardTeacher,
  VideoCamera,
  File,
  UserPlus,
} from "phosphor-react";



function TeacherSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // redirect
  };

  return (
    <aside className="sidebar">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "«" : "»"}
      </button>
      <h2 className="sidebar-title">📚 Teacher</h2>
      <br />
      <button onClick={handleLogout} className="btn btn-red">
      Logout
      </button>
      <ul>
        <li onClick={() => navigate("/teacher-dashboard")}>
          <House size={20} weight="duotone" /> Home
        </li>
        <li onClick={() => navigate("/manage-units")}>
          <BookOpen size={20} weight="duotone" /> Units & Chapters
        </li>
        <li onClick={() => navigate("/questions")}>
          <FileText size={20} weight="duotone" /> Questions
        </li>
        <li onClick={() => navigate("/createquiz")}>
          <ListChecks size={20} weight="duotone" /> Create Quiz
        </li>
        <li onClick={() => navigate("/quizlist")}>
          <ClipboardText size={20} weight="duotone" /> Quiz Lists
        </li>
        <li onClick={() => navigate("/teacher/inclassquizzes")}>
          <Calculator size={20} weight="duotone" /> In-Class Quizzes
        </li>
        <li onClick={() => navigate("/studentsperformance")}>
          <ChartBar size={20} weight="duotone" /> Performance
        </li>
        <li onClick={() => navigate("/teacher/attendance")}>
          <UsersThree size={20} weight="duotone" /> Attendance
        </li>
        <li onClick={() => navigate("/teacher-tasks")}>
          <FileText size={20} weight="duotone" /> Tasks & Homework
        </li>
        <li onClick={() => navigate("/videomanager")}>
          <VideoCamera size={20} weight="duotone" /> Upload Videos
        </li>
        <li onClick={() => navigate("/PDFManager")}>
          <File size={20} weight="duotone" /> Upload Course Materials
        </li>
        <li onClick={() => navigate("/teacher/add-assistant")}>
          <UserPlus size={20} weight="duotone" /> Add Assistant
        </li>
      </ul>
    </aside>
  );
}

export default TeacherSidebar;
