import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { Title, Meta, Link } from "react-head";


const heroImg = require("../assets/images/teacherimg.png");
const cambridgeCoreImg = require("../assets/images/cambridge-core.jpg");
const cambridgeOImg = require("../assets/images/cambridge-olevel.jpg");
const edexcelOImg = require("../assets/images/edexcel-olevel.jpg");
const logoImg = require("../assets/images/logo.png");


export default function LandingPage() {
  const navigate = useNavigate();


return (
  <>
   <>
  <Title>Mahmoud Nagy Physics | IGCSE & O Level Teacher</Title>
  <Meta
    name="description"
    content="Learn Physics with Eng. Mahmoud Nagy. Master Cambridge IGCSE, O Level, and Edexcel Physics with clear lessons, quizzes, and real-world explanations."
  />
  <Meta
    name="keywords"
    content="Mahmoud Nagy Physics, Layth-EG, Physics IGCSE, Physics O Level, Cambridge Physics, Edexcel Physics, Online Physics Teacher"
  />
  <Meta property="og:title" content="Mahmoud Nagy Physics | IGCSE & O Level Teacher" />
  <Meta
    property="og:description"
    content="Physics courses with Eng. Mahmoud Nagy – IGCSE, O Level, and Edexcel. Learn smarter, think bigger."
  />
  <Meta property="og:image" content={heroImg} />
  <Meta property="og:url" content="https://layth-eg.com" />
  <Meta property="og:type" content="website" />
  <Link rel="canonical" href="https://layth-eg.com" />

</>


    <div>
      {/* === Hero Section === */}
      <div className="landing-hero">
        <div className="hero-text">
          <h1 className="hero-title">
            LEARN PHYSICS, THINK BIGGER
          </h1>
          <p className="hero-subtitle">
            Master IGCSE Physics with real-world clarity, <br />
            plus the mindset to succeed beyond the exam.
          </p>
        </div>

        <div className="hero-image">
          <img src={heroImg} alt="Mahmoud Nagy Physics Teacher" />
        </div>
      </div>

      {/* === Courses Section === */}
      <div className="courses-section">
        {/* ✅ Logo at top */}
        <div className="courses-logo">
          <img src={logoImg} alt="Layth-EG Platform Logo" />
        </div>
        <div className="cards-row">
          <div className="course-block">
            <div className="course-card">
              <img src={cambridgeCoreImg} alt="Cambridge Core Physics Course" />
            </div>
            <div className="desc-card">
              <p>Physics Cambridge Core Description</p>
            </div>
          </div>

          <div className="course-block">
            <div className="course-card">
              <img src={cambridgeOImg} alt="Cambridge O Level Physics Course" />
            </div>
            <div className="desc-card">
              <p>Physics Cambridge O Level Description</p>
            </div>
          </div>

          <div className="course-block">
            <div className="course-card">
              <img src={edexcelOImg} alt="Edexcel O Level Physics Course" />
            </div>
            <div className="desc-card">
              <p>Physics Edexcel O Level Description</p>
            </div>
          </div>
        </div>
      </div>

      {/* === Register / Sign In Section (under courses) === */}
      <div className="footer-actions">
        <button className="btn-register" onClick={() => navigate("/register")}>
          Register
        </button>
        <button className="btn-signin" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </div>

      {/* === Contact Section (last part) === */}
      <div className="contact-section">
        <h2 className="contact-title">Get in Touch</h2>
        <p className="contact-message">
          Have questions or need help? Reach out directly 👇
        </p>
        <div className="contact-buttons">
          <a href="tel:+201030400674" className="contact-btn call-btn">
            📞 Call ENG Mahmoud Nagy
          </a>
          <a
            href="https://wa.link/ejd459"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-btn whatsapp-btn"
          >
            💬 Message on WhatsApp
          </a>
        </div>
      </div>
    </div>
  </>
);

}
