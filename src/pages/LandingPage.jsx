import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate
import "./LandingPage.css";
import heroImg from "../assets/images/teacherimg.png";

// Example placeholders
import cambridgeCoreImg from "../assets/images/cambridge-core.jpg";
import cambridgeOImg from "../assets/images/cambridge-olevel.jpg";
import edexcelOImg from "../assets/images/edexcel-olevel.jpg";

export default function LandingPage() {
  const navigate = useNavigate(); // ✅ initialize navigate

  return (
    <div>
      {/* === Hero Section === */}
      <div className="landing-hero">
        <div className="hero-text">
          <h1 className="hero-title">LEARN PHYSICS, THINK BIGGER</h1>
          <p className="hero-subtitle">
            Master IGCSE Physics with real-world clarity, <br />
            plus the mindset to succeed beyond the exam.
          </p>
        </div>

        <div className="hero-image">
          <img src={heroImg} alt="Hero" />
        </div>
      </div>

      {/* === Courses Section === */}
      <div className="courses-section">
        <div className="cards-row">
          <div
            className="course-card"
            style={{ backgroundImage: `url(${cambridgeCoreImg})` }}
          ></div>
          <div
            className="course-card"
            style={{ backgroundImage: `url(${cambridgeOImg})` }}
          ></div>
          <div
            className="course-card"
            style={{ backgroundImage: `url(${edexcelOImg})` }}
          ></div>
        </div>

        <div className="cards-row description-row">
          <div className="desc-card">
            <p>Physics Cambridge Core Description</p>
          </div>
          <div className="desc-card">
            <p>Physics Cambridge O Level Description</p>
          </div>
          <div className="desc-card">
            <p>Physics Edexcel O Level Description</p>
          </div>
        </div>
      </div>

      {/* === Footer Buttons === */}
      <div className="footer-actions">
        <button
          className="btn-register"
          onClick={() => navigate("/register")} // ✅ redirect
        >
          Register
        </button>
        <button
          className="btn-signin"
          onClick={() => navigate("/login")} // ✅ redirect
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
