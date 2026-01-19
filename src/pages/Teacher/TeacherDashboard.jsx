import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CreateYear from "../../components/CreateYear";
import AddStudentForm from "../../components/AddStudentForm";
import CreateSchool from "../../components/CreateSchool";
import TeacherSidebar from "../../components/TeacherSidebar";
import {
  BookOpen,
  PencilSimple,
  PlusCircle,
  ClipboardText,
  FolderSimple,
  Student,
  FileArrowDown,
  LinkSimple,
  ChartBar,
} from "phosphor-react";
import "react-toastify/dist/ReactToastify.css";
import "./TeacherDashboard.css";

function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoomLinks, setZoomLinks] = useState({});
  const navigate = useNavigate();
 const user = JSON.parse(localStorage.getItem("user"));
  const isAdminTeacher =
    user?.role === "teacher" && user?.assistantOf === null;


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
      res.data.forEach(async (y) => {
        try {
          const linkRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${y._id}/zoom`);
          setZoomLinks((prev) => ({
            ...prev,
            [y._id]: linkRes.data.zoomLinks || [],
          }));
        } catch {}
      });
    } catch {
      toast.error("❌ Failed to load years");
    }
  };

  const saveZoomLinks = async (yearId) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/year/${yearId}/zoom`, {
        zoomLinks: zoomLinks[yearId],
      });
      toast.success("✅ Zoom links saved!");
    } catch {
      toast.error("❌ Failed to save Zoom links");
    }
  };

  return (
    <div className="teacher-layout">
      {/* SIDEBAR */}
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN CONTENT */}
      <main className={`teacher-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <header className="dashboard-header">
          <h2>Teacher Dashboard</h2>
          <p>Manage your classes, quizzes, and students</p>
        </header>

        {/* QUICK ACTIONS */}
          <section className="card-grid">
            {[
              { icon: <BookOpen size={24} />, title: "Manage Units", path: "/manage-units" },
              { icon: <PencilSimple size={24} />, title: "Upload MCQs", path: "/upload-question" },
              { icon: <PencilSimple size={24} />, title: "Upload Video Stop Questions", path: "/quizstopupload-question" },
              { icon: <PlusCircle size={24} />, title: "Create Quiz", path: "/createquiz" },
              { icon: <ClipboardText size={24} />, title: "Quiz Lists", path: "/quizlist" },
              { icon: <FolderSimple size={24} />, title: "Tasks & Homework", path: "/teacher-tasks" },
              { icon: <Student size={24} />, title: "Student Data", path: "/all-students" },

              // ✅ Visible for BOTH teacher & assistants
              {
                icon: <ClipboardText size={24} />,
                title: "System Support Chats",
                path: "/teacher/tickets",
              },

              // ✅ Visible ONLY for admin teacher
              ...(isAdminTeacher
                ? [
                    {
                      icon: <FolderSimple size={24} />,
                      title: "System Support Categories",
                      path: "/teacher/ticket-categories",
                    },

                    {
                      icon: <ChartBar size={24} />,
                      title: "Support Analytics",
                      path: "/teacher/ticket-analytics",
                    }
                  ]
                : []),
            ].map((card, i) => (
              <div
                key={i}
                className="dashboard-card"
                onClick={() => navigate(card.path)}
              >
                {card.icon}
                <h4>{card.title}</h4>
              </div>
            ))}
          </section>

        {/* EXPORT BUTTON */}
        <div className="export-container">
          <button
            className="btn-export"
            onClick={() =>
              window.open(`${process.env.REACT_APP_API_URL}/api/admin/export-users`, "_blank")
            }
          >
            <FileArrowDown size={20} /> Export Users
          </button>
        </div>

        {/* MAIN CONTENT SECTIONS */}
        <section className="section-card"><CreateSchool teacherId={teacherId} /></section>
        <section className="section-card"><CreateYear teacherId={teacherId} years={years} fetchYears={fetchYears} /></section>

        {/* ZOOM LINKS */}
        <section className="section-card">
          <h3><LinkSimple size={20} /> Manage Zoom Links</h3>
          {years.map((y) => (
            <div key={y._id} className="zoom-block">
              <h4>{y.name}</h4>
              {(zoomLinks[y._id] || []).map((z, idx) => (
                <div key={idx} className="zoom-row">
                  <input
                    type="text"
                    placeholder="Title"
                    className="styled-input"
                    value={z.title}
                    onChange={(e) => {
                      const updated = [...zoomLinks[y._id]];
                      updated[idx].title = e.target.value;
                      setZoomLinks((p) => ({ ...p, [y._id]: updated }));
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Zoom Link"
                    className="styled-input"
                    value={z.link}
                    onChange={(e) => {
                      const updated = [...zoomLinks[y._id]];
                      updated[idx].link = e.target.value;
                      setZoomLinks((p) => ({ ...p, [y._id]: updated }));
                    }}
                  />
                  <button
                    className="btn btn-red"
                    onClick={() => {
                      const updated = [...zoomLinks[y._id]];
                      updated.splice(idx, 1);
                      setZoomLinks((p) => ({ ...p, [y._id]: updated }));
                      toast.info("🗑 Deleted link");
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              <div className="zoom-actions">
                <button
                  className="btn btn-green"
                  onClick={() =>
                    setZoomLinks((p) => ({
                      ...p,
                      [y._id]: [...(p[y._id] || []), { title: "", link: "" }],
                    }))
                  }
                >
                  + Add Link
                </button>
                <button className="btn btn-purple" onClick={() => saveZoomLinks(y._id)}>
                  💾 Save
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="section-card">
          <AddStudentForm years={years} onStudentAdded={() => fetchYears(teacherId)} />
        </section>
      </main>
    </div>
  );
}

export default TeacherDashboard;
