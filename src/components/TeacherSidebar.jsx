import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AppStyles.css"; // adjust path if needed

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
  );
}

export default TeacherSidebar;
