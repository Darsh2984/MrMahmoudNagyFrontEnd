import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateYear from "../../components/CreateYear";
import AddStudentForm from "../../components/AddStudentForm";
import CreateSessionForm from "../../components/CreateSessionForm";
import SessionAttendance from "../../components/SessionAttendance";
import GroupSessions from "../../components/GroupSessions";
import CreateSchool from "../../components/CreateSchool";
import "../../styles/AppStyles.css"; // ✅ unified global CSS
import TeacherSidebar from "../../components/TeacherSidebar"; // ✅ import new sidebar
import {
  BookOpen,
  PencilSimple,
  PlusCircle,
  ClipboardText,
  FolderSimple,
  Student,
  FileArrowDown,
  VideoCamera,
  ChartBar,
  FileText,
} from "phosphor-react";


function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomLinks, setZoomLinks] = useState({}); // ✅ per yearId

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      setTeacherId(user.id);
      fetchYears(user.id);
    }
  }, []);

  const fetchYears = async (id) => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${id}`);
    setYears(res.data);

    // fetch zoom links for each year
    res.data.forEach(async (y) => {
      try {
        const linkRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/year/${y._id}/zoom`
        );
        setZoomLinks((prev) => ({
          ...prev,
          [y._id]: linkRes.data.zoomLinks || [],
        }));
      } catch (err) {
        console.error("❌ Error fetching zoom links for", y.name, err);
      }
    });
  } catch (err) {
    console.error("❌ Error fetching years:", err);
  }
};

  const saveZoomLinks = async (yearId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/year/${yearId}/zoom`, {
        zoomLinks: zoomLinks[yearId],
      });
      alert("✅ Zoom links saved!");
    } catch (err) {
      console.error("❌ Error saving Zoom links:", err);
    }
  };

  

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* ✅ Sidebar extracted */}
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* === Main Content === */}
      <main className="page-container">
        {/* 🔹 Action Cards */}
        <div className="card-grid">
          <div className="dashboard-card" onClick={() => navigate("/manage-units")}>
            <h3><BookOpen size={22} weight="duotone" /> Manage Units & Chapters</h3>
            <p>Create, edit and manage units and chapters.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/upload-question")}>
            <h3><PencilSimple size={22} weight="duotone" /> Upload MCQ Questions</h3>
            <p>Upload and organize your MCQ questions.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/createquiz")}>
            <h3><PlusCircle size={22} weight="duotone" /> Create Quiz</h3>
            <p>Generate quizzes from your uploaded questions.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/quizlist")}>
            <h3><ClipboardText size={22} weight="duotone" /> Quiz Lists</h3>
            <p>View and manage your created quizzes.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/teacher-tasks")}>
            <h3><FolderSimple size={22} weight="duotone" /> Create Tasks & Homework</h3>
            <p>Assign tasks and homework to students.</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/all-students")}>
            <h3><Student size={22} weight="duotone" /> All Registered Student Data</h3>
            <p>View and manage all student & parent records.</p>
          </div>

          <button
            className="btn btn-purple"
            onClick={() =>
              window.open(
                `${process.env.REACT_APP_API_URL}/api/admin/export-users`,
                "_blank"
              )
            }
          >
            <FileArrowDown size={20} weight="duotone" /> Export Users to Excel
          </button>
        </div>
        
        <div className="section-card">
          <CreateSchool teacherId={teacherId} />
        </div>
        {/* Manage Years & Groups */}
        <div className="section-card">
          <CreateYear teacherId={teacherId} years={years} fetchYears={fetchYears} />
        </div>
        <div className="section-card">
          <h3>🔗 Manage Zoom Links</h3>
          {years.map((y) => (
            <div key={y._id} style={{ marginBottom: "20px" }}>
              <strong>{y.name}</strong>
              <br />
              {/* Existing links loaded from DB */}
              {(zoomLinks[y._id] || []).map((z, idx) => (
                <div key={idx} style={{ display: "flex", marginBottom: "6px" }}>
                  <input
                    type="text"
                    className="styled-input"
                    placeholder="Title (e.g. Math Class)"
                    value={z.title}
                    onChange={(e) => {
                      const updated = [...zoomLinks[y._id]];
                      updated[idx].title = e.target.value;
                      setZoomLinks((prev) => ({ ...prev, [y._id]: updated }));
                    }}
                  />
                  <input
                    type="text"
                    className="styled-input"
                    placeholder="Zoom link"
                    value={z.link}
                    onChange={(e) => {
                      const updated = [...zoomLinks[y._id]];
                      updated[idx].link = e.target.value;
                      setZoomLinks((prev) => ({ ...prev, [y._id]: updated }));
                    }}
                  />
                  <button
                    className="btn btn-red"
                    onClick={() => {
                      const updated = [...zoomLinks[y._id]];
                      updated.splice(idx, 1);
                      setZoomLinks((prev) => ({ ...prev, [y._id]: updated }));
                    }}
                  >
                    Delete
                  </button>
          </div>
      ))}

      {/* Add new link */}
      <br />
      <button
        className="btn btn-purple"
        onClick={() =>
          setZoomLinks((prev) => ({
            ...prev,
            [y._id]: [...(prev[y._id] || []), { title: "", link: "" }],
          }))
        }
      >
        Add Zoom Link
      </button>

      {/* Save to backend */}
      <button
        className="btn btn-purple"
        style={{ marginLeft: "8px" }}
        onClick={() => saveZoomLinks(y._id)}
      >
        💾 Save All
      </button>
    </div>
  ))}
        </div>
        
         <div className="section-card">
          <AddStudentForm years={years} onStudentAdded={() => fetchYears(teacherId)} />
        </div>
        
      </main>
    </div>
  );
}

export default TeacherDashboard;
