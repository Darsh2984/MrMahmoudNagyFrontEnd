import React, { useState, useEffect } from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AppStyles.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    studentPhone: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    schoolId: "", // ✅ new
  });

  const [schools, setSchools] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch schools
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/school/all`);
        setSchools(res.data);
      } catch (err) {
        console.error("❌ Error fetching schools:", err);
      }
    };
    fetchSchools();
  }, []);

  // ✅ Page style
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, form);
      setMessage("✅ Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("❌ Registration failed:", err);
      setMessage("❌ Registration failed! Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">📝 Register</h2>

        <form onSubmit={handleRegister}>
          {/* Name */}
          <div className="input-group">
            <i className="fas fa-user"></i>
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* 🔹 School Selection */}
          <label className="field-label">Select School</label>
          <select
            className="styled-select"
            value={form.schoolId}
            onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
            required
          >
            <option value="">-- Choose a School --</option>
            {schools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Student phone */}
          <label className="field-label">Student Phone</label>
          <PhoneInput
            country={"eg"}
            value={form.studentPhone}
            onChange={(phone) => setForm({ ...form, studentPhone: phone })}
            inputStyle={{ width: "100%" }}
            containerStyle={{ marginBottom: "15px" }}
          />

          {/* Parent Name */}
          <div className="input-group">
            <i className="fas fa-user"></i>
            <input
              type="text"
              placeholder="Parent Full Name"
              value={form.parentName}
              onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              required
            />
          </div>

          {/* Parent Phone */}
          <label className="field-label">Parent Phone</label>
          <PhoneInput
            country={"eg"}
            value={form.parentPhone}
            onChange={(phone) => setForm({ ...form, parentPhone: phone })}
            inputStyle={{ width: "100%" }}
            containerStyle={{ marginBottom: "15px" }}
          />

          {/* Parent Email */}
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Parent Email"
              value={form.parentEmail}
              onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" className="login-btn">
            {message.includes("✅") ? "⏳ Redirecting..." : "✅ Register"}
          </button>
        </form>

        <p className="forgot-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        {message && (
          <p className={`message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;
