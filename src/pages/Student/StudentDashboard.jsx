import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentSidebar from "../../components/StudentSidebar";
import "../../styles/AppStyles.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [zoomLinks, setZoomLinks] = useState([]);

  // ✅ Fetch yearId for student and then zoom links
  const fetchStudentYear = async (studentId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/${studentId}/year`
      );

      if (res.data?.yearId) {
        const yearId = res.data.yearId._id;
        console.log("Resolved student year:", yearId);

        // Fetch zoom links for that year
        const zoomRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/year/${yearId}/zoom`
        );
        console.log("Zoom API response:", zoomRes.data);
        setZoomLinks(zoomRes.data.zoomLinks || []);
      } else {
        console.warn("⚠️ No year assigned to this student");
      }
    } catch (err) {
      console.error("❌ Failed to fetch student year/zoom links:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);

      // fetch year and zoom links from backend
      fetchStudentYear(storedUser.id);
    }
  }, []);

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* === Main Content === */}
      <main className="page-container">
        <h2 className="card-title">🎓 Student Dashboard</h2>

        <div className="dashboard-grid">
          {/* Built-in student features */}
          <div className="dashboard-card" onClick={() => navigate("/student-tasks")}>
            <h3>📋 My Tasks</h3>
            <p>View assigned tasks and upload submissions.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/student-quizzes")}>
            <h3>📝 My Quizzes</h3>
            <p>Take quizzes and check results.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/student-attendance")}>
            <h3>📊 My Attendance</h3>
            <p>See your attendance record.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/student-performance")}>
            <h3>📈 My Performance</h3>
            <p>Check your overall performance report.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/StudentVideoViewer")}>
            <h3>🎥 Course Videos</h3>
            <p>Watch recorded course sessions and lectures.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/MaterialViewer")}>
            <h3>📚 Course Materials</h3>
            <p>Access lecture notes, PDFs, and study resources.</p>
          </div>

          {/* ✅ Render Zoom links as extra cards */}
          {zoomLinks.length > 0 ? (
            zoomLinks.map((z, idx) => (
              <div
                key={idx}
                className="dashboard-card"
                onClick={() => window.open(z.link.startsWith("http") ? z.link : `https://${z.link}`, "_blank")}
              >
                <h3>📡 {z.title || `Zoom Class ${idx + 1}`}</h3>
                <p>Click to join this live session</p>
              </div>
            ))
          ) : (
            <div className="dashboard-card disabled">
              <h3>📡 No Zoom Links</h3>
              <p>Your teacher has not added Zoom links yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
