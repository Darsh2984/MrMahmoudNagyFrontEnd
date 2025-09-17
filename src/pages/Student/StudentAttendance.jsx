// src/pages/StudentAttendance.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";

export default function StudentAttendance() {
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId) {
      setMessage("❌ Not logged in. Please log in again.");
      setLoading(false);
      return;
    }
    fetchAttendance();
  }, [studentId]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/sessions/student/${studentId}`,
        { headers: { Authorization: token } }
      );
      setSessions(res.data);
    } catch (err) {
      console.error("❌ Error fetching attendance:", err);
      setMessage("❌ Could not load attendance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">🎓 Student</h2>
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

      {/* Main Content */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📝 My Attendance</h2>
          <br />
          {loading && <p>⏳ Loading attendance...</p>}
          {message && <p>{message}</p>}
          {!loading && !message && sessions.length === 0 && (
            <p>⚠️ No attendance records found.</p>
          )}

          <div className="student-dashboard-vertical">
            {sessions.map((session) => {
              const record = session.attendance.find(
                (a) => a.studentId?._id === studentId
              );
              return (
                <div key={session._id} className="student-tile">
                  <h3>{session.title}</h3>
                  <p>
                    Status:{" "}
                    <strong
                      style={{
                        color:
                          record?.status === "Present"
                            ? "green"
                            : record?.status === "Late"
                            ? "orange"
                            : "red",
                      }}
                    >
                      {record?.status || "Not Recorded"}
                    </strong>
                  </p>
                  <p>👥 Group: {session.groupId?.name || "N/A"}</p>
                  <br />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
