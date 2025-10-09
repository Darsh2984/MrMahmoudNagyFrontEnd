import React, { useEffect, useState } from "react";
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
} from "phosphor-react";
import "../styles/AppStyles.css";

function StudentSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
        <p>
          <Student size={18} weight="duotone" /> {user?.name || "Loading..."}
        </p>
      </div>

      <br />
      <button onClick={handleLogout} className="btn btn-red">
        <SignOut size={18} weight="duotone" /> Logout
      </button>

      {/* Menu */}
      <ul>
        <li onClick={() => navigate("/student-dashboard")}>
          <House size={20} weight="duotone" /> Dashboard
        </li>
        <li onClick={() => navigate("/student-tasks")}>
          <ClipboardText size={20} weight="duotone" /> My Tasks
        </li>
        <li onClick={() => navigate("/student-quizzes")}>
          <PencilLine size={20} weight="duotone" /> My Quizzes
        </li>
        <li onClick={() => navigate("/student-attendance")}>
          <ChartBar size={20} weight="duotone" /> My Attendance
        </li>
        <li onClick={() => navigate("/student-performance")}>
          <TrendUp size={20} weight="duotone" /> My Performance
        </li>
        <li onClick={() => navigate("/StudentVideoViewer")}>
          <VideoCamera size={20} weight="duotone" /> Course Videos
        </li>
        <li onClick={() => navigate("/MaterialViewer")}>
          <BookOpen size={20} weight="duotone" /> Course Materials
        </li>
        <li
          onClick={() =>
            window.open(
              "https://chat.openai.com/g/g-68daa005e46081919fe3515f32c48f72-ask-mahmoud-nagys-mind-3-0",
              "_blank"
            )
          }
        >
          <Brain size={20} weight="duotone" /> Mahmoud Nagy's Mind
        </li>
      </ul>
    </aside>
  );
}

export default StudentSidebar;
