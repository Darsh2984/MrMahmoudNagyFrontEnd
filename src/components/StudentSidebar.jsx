import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AppStyles.css"; // adjust path if needed

function StudentSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // redirect
  };

  // ✅ Sync with localStorage
  useEffect(() => {
    const updateUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    };

    updateUser(); // load immediately
    window.addEventListener("storage", updateUser);
    return () => window.removeEventListener("storage", updateUser);
  }, []);

  return (
    <aside className="sidebar">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "«" : "»"}
      </button>
      <h2 className="sidebar-title">🎓 Student</h2>

      {/* Student Info */}
      <div className="sidebar-footer">
        <p>👤 {user?.name || "Loading..."}</p>
      </div>
      <br />
      <button onClick={handleLogout} className="btn btn-red">
        Logout
      </button>
      {/* Menu */}
      <ul>
        <li onClick={() => navigate("/student-dashboard")}>🏠 Dashboard</li>
        <li onClick={() => navigate("/student-tasks")}>📋 My Tasks</li>
        <li onClick={() => navigate("/student-quizzes")}>📝 My Quizzes</li>
        <li onClick={() => navigate("/student-attendance")}>📊 My Attendance</li>
        <li onClick={() => navigate("/student-performance")}>📈 My Performance</li>
        <li onClick={() => navigate("/StudentVideoViewer")}>🎥 Course Videos</li>
        <li onClick={() => navigate("/MaterialViewer")}>📚 Course Materials</li>
        <li onClick={() => window.open("https://chatgpt.com/g/g-68daa005e46081919fe3515f32c48f72-ask-mahmoud-nagys-mind-3-0", "_blank")}>
          🧠Mahmoud Nagy's Mind
        </li>
      </ul>
    </aside>
  );
}

export default StudentSidebar;
