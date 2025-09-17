import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* === Sidebar === */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">🎓 Student</h2>
        {/* Student Info */}
        <div className="sidebar-footer">
          <p>👤 {user?.name}</p>
        </div>
        <ul>
          <li onClick={() => navigate("/student-dashboard")}>🏠 Dashboard</li>
          <li onClick={() => navigate("/student-tasks")}>📋 My Tasks</li>
          <li onClick={() => navigate("/student-quizzes")}>📝 My Quizzes</li>
          <li onClick={() => navigate("/student-attendance")}>📊 My Attendance</li>
          <li onClick={() => navigate("/student-performance")}>📈 My Performance</li>
          <li onClick={() => navigate("/StudentVideoViewer")}>🎥 Course Videos</li>
          <li onClick={() => navigate("/MaterialViewer")}>📚 Course Materials</li>
        </ul>
      </aside>

      {/* === Main Content === */}
      <main className="page-container">
        <h2 className="card-title">🎓 Student Dashboard</h2>

        <div className="dashboard-grid">
          {/* My Tasks */}
          <div className="dashboard-card" onClick={() => navigate("/student-tasks")}>
            <h3>📋 My Tasks</h3>
            <p>View assigned tasks and upload submissions.</p>
          </div>

          {/* My Quizzes */}
          <div className="dashboard-card" onClick={() => navigate("/student-quizzes")}>
            <h3>📝 My Quizzes</h3>
            <p>Take quizzes and check results.</p>
          </div>

          {/* My Attendance */}
          <div className="dashboard-card" onClick={() => navigate("/student-attendance")}>
            <h3>📊 My Attendance</h3>
            <p>See your attendance record.</p>
          </div>

          {/* My Performance */}
          <div className="dashboard-card" onClick={() => navigate("/student-performance")}>
            <h3>📈 My Performance</h3>
            <p>Check your overall performance report.</p>
          </div>

          {/* Course Videos */}
          <div className="dashboard-card" onClick={() => navigate("/StudentVideoViewer")}>
            <h3>🎥 Course Videos</h3>
            <p>Watch recorded course sessions and lectures.</p>
          </div>

          {/* Course Materials */}
          <div className="dashboard-card" onClick={() => navigate("/MaterialViewer")}>
            <h3>📚 Course Materials</h3>
            <p>Access lecture notes, PDFs, and study resources.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
