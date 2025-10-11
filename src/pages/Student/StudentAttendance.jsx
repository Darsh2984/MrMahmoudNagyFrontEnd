import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentAttendance.css"; // ✅ new CSS file

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

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "status-present";
      case "Late":
        return "status-late";
      case "Absent":
      default:
        return "status-absent";
    }
  };

  return (
    <div className="student-layout">
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`student-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <header className="dashboard-header">
          <h2>📝 My Attendance</h2>
          <p>Track your attendance records and participation</p>
        </header>

        <section className="section-card">
          {loading && <p className="loading-msg">⏳ Loading attendance...</p>}
          {message && <p className="error-msg">{message}</p>}
          {!loading && !message && sessions.length === 0 && (
            <p className="no-data">⚠️ No attendance records found.</p>
          )}

          <div className="attendance-grid">
            {sessions.map((session) => {
              const record = session.attendance.find(
                (a) => a.studentId?._id === studentId
              );
              const status = record?.status || "Not Recorded";
              return (
                <div key={session._id} className="attendance-card">
                  <h4>{session.title}</h4>
                  <p className="attendance-meta">
                    <b>👥 Group:</b> {session.groupId?.name || "N/A"}
                  </p>
                  <span className={`attendance-status ${getStatusClass(status)}`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
