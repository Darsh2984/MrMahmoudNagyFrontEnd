import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

// ✅ Use const with require for images
const heroImg = require("../assets/images/teacherimg.png");
const cambridgeCoreImg = require("../assets/images/cambridge-core.jpg");
const cambridgeOImg = require("../assets/images/cambridge-olevel.jpg");
const edexcelOImg = require("../assets/images/edexcel-olevel.jpg");

export default function LandingPage() {
  const navigate = useNavigate();

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
          <div className="course-block">
            <div className="course-card">
              <img src={cambridgeCoreImg} alt="Cambridge Core" />
            </div>
            <div className="desc-card">
              <p>Physics Cambridge Core Description</p>
            </div>
          </div>

          <div className="course-block">
            <div className="course-card">
              <img src={cambridgeOImg} alt="Cambridge O Level" />
            </div>
            <div className="desc-card">
              <p>Physics Cambridge O Level Description</p>
            </div>
          </div>

          <div className="course-block">
            <div className="course-card">
              <img src={edexcelOImg} alt="Edexcel O Level" />
            </div>
            <div className="desc-card">
              <p>Physics Edexcel O Level Description</p>
            </div>
          </div>
        </div>
      </div>

      {/* === Footer Buttons === */}
      <div className="footer-actions">
        <button className="btn-register" onClick={() => navigate("/register")}>
          Register
        </button>
        <button className="btn-signin" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>
    </div>
  );
}
