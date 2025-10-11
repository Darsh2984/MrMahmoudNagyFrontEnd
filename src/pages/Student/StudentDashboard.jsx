import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import { toast } from "react-toastify";
import {
  ClipboardText,
  PencilSimple,
  ChartBar,
  TrendUp,
  VideoCamera,
  BookOpen,
  WifiHigh,
} from "phosphor-react";
import "react-toastify/dist/ReactToastify.css";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [zoomLinks, setZoomLinks] = useState([]);

  const fetchStudentYear = async (studentId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/${studentId}/year`
      );

      if (res.data?.yearId) {
        const yearId = res.data.yearId._id;

        const zoomRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/year/${yearId}/zoom`
        );
        setZoomLinks(zoomRes.data.zoomLinks || []);
      } else {
        toast.info("⚠️ No year assigned yet.");
      }
    } catch (err) {
      toast.error("❌ Failed to load year/Zoom links.");
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchStudentYear(storedUser.id);
    }
  }, []);

  return (
    <div className="student-layout">
      {/* Sidebar */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className={`student-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <header className="dashboard-header">
          <h2>Student Dashboard</h2>
          <p>Access all your classes, tasks, and materials in one place.</p>
        </header>

        {/* Cards Grid */}
        <section className="card-grid">
          {[
            {
              icon: <ClipboardText size={24} />,
              title: "My Tasks",
              desc: "View assigned tasks and upload your submissions.",
              path: "/student-tasks",
            },
            {
              icon: <PencilSimple size={24} />,
              title: "My Quizzes",
              desc: "Attempt quizzes and check your results.",
              path: "/student-quizzes",
            },
            {
              icon: <ChartBar size={24} />,
              title: "My Attendance",
              desc: "Check your attendance records.",
              path: "/student-attendance",
            },
            {
              icon: <TrendUp size={24} />,
              title: "My Performance",
              desc: "View your grades and performance progress.",
              path: "/student-performance",
            },
            {
              icon: <VideoCamera size={24} />,
              title: "Course Videos",
              desc: "Watch recorded classes and lessons.",
              path: "/StudentVideoViewer",
            },
            {
              icon: <BookOpen size={24} />,
              title: "Course Materials",
              desc: "Download PDFs and study resources.",
              path: "/MaterialViewer",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="dashboard-card"
              onClick={() => navigate(card.path)}
            >
              {card.icon}
              <h4>{card.title}</h4>
              <p>{card.desc}</p>
            </div>
          ))}

          {/* Zoom Links */}
          {zoomLinks.length > 0 ? (
            zoomLinks.map((z, idx) => (
              <div
                key={idx}
                className="dashboard-card"
                onClick={() =>
                  window.open(
                    z.link.startsWith("http") ? z.link : `https://${z.link}`,
                    "_blank"
                  )
                }
              >
                <WifiHigh size={24} />
                <h4>{z.title || `Zoom Class ${idx + 1}`}</h4>
                <p>Click to join your live session.</p>
              </div>
            ))
          ) : (
            <div className="dashboard-card disabled">
              <WifiHigh size={24} />
              <h4>No Zoom Links</h4>
              <p>Your teacher hasn’t added links yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
