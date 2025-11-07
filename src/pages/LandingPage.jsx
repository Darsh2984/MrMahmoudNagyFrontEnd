import React from "react";
import { useNavigate } from "react-router-dom";
import { Title, Meta, Link } from "react-head";
import "./LandingPage.css";

import heroImg from "../assets/images/teacherimg.png";
import cambridgeCoreImg from "../assets/images/cambridge-core.jpg";
import cambridgeOImg from "../assets/images/cambridge-olevel.jpg";
import edexcelOImg from "../assets/images/edexcel-olevel.jpg";
import logoImg from "../assets/images/logo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* ================= SEO & META TAGS ================= */}
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

      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <div className="hero-content">
          <img src={logoImg} alt="Layth-EG Logo" className="hero-logo" />
          <h1>Learn Physics, Think Bigger.</h1>
          <p>
            Master IGCSE and O Level Physics with real-world clarity <br />
            and the mindset to succeed beyond the exam.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/register")}>
              Register
            </button>
            <button className="btn-outline" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="btn-secondary" onClick={() => navigate("/specialregister")}>
              Register as Private Student
            </button>
          </div>
        </div>

        <div className="hero-image-container">
          <img src={heroImg} alt="Eng. Mahmoud Nagy Physics" className="hero-image" />
        </div>
      </section>

      {/* ================= COURSES SECTION ================= */}
      <section className="courses">
        <h2>Explore Our Courses</h2>
        <p className="section-subtitle">
          Choose your path — Cambridge Core, O Level, or Edexcel Physics.
        </p>

        <div className="course-grid">
          <div className="course-card">
            <img src={cambridgeCoreImg} alt="Cambridge Core Physics" />
            <div className="course-info">
              <h3>Cambridge Core</h3>
              <p>Build a strong foundation for advanced physics learning.</p>
            </div>
          </div>

          <div className="course-card">
            <img src={cambridgeOImg} alt="Cambridge O Level Physics" />
            <div className="course-info">
              <h3>Cambridge O Level</h3>
              <p>Master theory and problem-solving for top exam results.</p>
            </div>
          </div>

          <div className="course-card">
            <img src={edexcelOImg} alt="Edexcel O Level Physics" />
            <div className="course-info">
              <h3>Edexcel O Level</h3>
              <p>Learn modern exam-based techniques with clear explanations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRIVATE STUDENT SECTION ================= */}
      <section className="private-section">
        <h2>Private Student Access</h2>
        <p>
          For exclusive lessons, personalized follow-up, and private groups — join as a
          Private Student.
        </p>

        <div className="private-buttons">
          <button className="btn-secondary" onClick={() => navigate("/specialregister")}>
            Register as Private Student
          </button>
          <button className="btn-outline" onClick={() => navigate("/login")}>
            Login as Private Student
          </button>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <footer className="contact-footer">
        <h2>Get in Touch</h2>
        <p>
          Have questions or need assistance? Reach out directly to Eng. Mahmoud Nagy:
        </p>
        <div className="contact-actions">
          <a href="tel:+201030400674" className="contact-link call">
            📞 Call
          </a>
          <a
            href="https://wa.link/ejd459"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link whatsapp"
          >
            💬 WhatsApp
          </a>
        </div>
        <p className="footer-note">© 2025 Layth-EG | All Rights Reserved</p>
      </footer>
    </>
  );
}
