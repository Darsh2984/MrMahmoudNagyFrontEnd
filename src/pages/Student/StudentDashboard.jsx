import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  // 🔁 Sync with localStorage whenever it changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <aside className="sidebar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? "«" : "»"}
        </button>
        <h2 className="sidebar-title">🎓 Student</h2>
        <div className="sidebar-footer">
          <p>👤 {user?.name || "Loading..."}</p>
        </div>
        {/* ...menu items */}
      </aside>
      <main className="page-container">
        <h2 className="card-title">🎓 Student Dashboard</h2>
        {/* ...cards */}
      </main>
    </div>
  );
}


export default StudentDashboard;
