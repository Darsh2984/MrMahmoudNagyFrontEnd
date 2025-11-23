import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardText,
  PencilSimple,
  ChartBar,
  TrendUp,
  VideoCamera,
  BookOpen,
} from "phosphor-react";
import "./SpecialStudentDashboard.css";

function SpecialStudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const cards = [
    {
      icon: <ClipboardText size={26} />,
      title: "My Tasks",
      desc: "View assigned tasks and upload your submissions.",
      path: "/specialstudent-tasks",
    },
    {
      icon: <PencilSimple size={26} />,
      title: "My Quizzes",
      desc: "Attempt quizzes and review your results.",
      path: "/specialstudent-quizzes",
    },
    {
      icon: <TrendUp size={26} />,
      title: "My Performance",
      desc: "Track your grades and overall progress.",
      path: "/specialstudent-performance",
    },
    {
      icon: <VideoCamera size={26} />,
      title: "Course Videos",
      desc: "Access and watch recorded lessons.",
      path: "/SpecialStudentVideoViewer",
    },
    {
      icon: <BookOpen size={26} />,
      title: "Course Materials",
      desc: "Download PDFs and study resources.",
      path: "/SpecialStudentMaterialViewer",
    },
  ];

  return (
    <div className="special-student-dashboard">
      {/* --- Header --- */}
      <header className="special-header">
        <h1>Private Student Dashboard</h1>
        <p>
          Welcome back, {user?.name || "Student"} — your learning hub awaits.
        </p>
        <div className="header-underline"></div>
      </header>

      {/* --- Card Grid --- */}
      <section className="special-card-grid">
        {cards.map((card, i) => (
          <div
            key={i}
            className="special-dashboard-card"
            onClick={() => navigate(card.path)}
          >
            <div className="icon-container">{card.icon}</div>
            <h4>{card.title}</h4>
            <p>{card.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default SpecialStudentDashboard;
