import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar"; // import new sidebar
import "../../styles/AppStyles.css";


function StudentDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  // ✅ Always stay in sync with localStorage
  useEffect(() => {
    const updateUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
      }
    };

    updateUser(); // load immediately on mount
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* === Main Content === */}
      <main className="page-container">
        <h2 className="card-title">🎓 Student Dashboard</h2>

        <div className="dashboard-grid">
          <div
            className="dashboard-card"
            onClick={() => navigate("/student-tasks")}
          >
            <h3>📋 My Tasks</h3>
            <p>View assigned tasks and upload submissions.</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/student-quizzes")}
          >
            <h3>📝 My Quizzes</h3>
            <p>Take quizzes and check results.</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/student-attendance")}
          >
            <h3>📊 My Attendance</h3>
            <p>See your attendance record.</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/student-performance")}
          >
            <h3>📈 My Performance</h3>
            <p>Check your overall performance report.</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/StudentVideoViewer")}
          >
            <h3>🎥 Course Videos</h3>
            <p>Watch recorded course sessions and lectures.</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/MaterialViewer")}
          >
            <h3>📚 Course Materials</h3>
            <p>Access lecture notes, PDFs, and study resources.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
