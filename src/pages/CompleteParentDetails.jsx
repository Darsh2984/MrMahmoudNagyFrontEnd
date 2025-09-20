import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../styles/AppStyles.css";

function CompleteParentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ parentName: "", parentEmail: "", parentPhone: "" });
  const [message, setMessage] = useState("");

  // ✅ Page style (same as Register & Login)
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/student/add-parent`, {
        studentId,
        ...form,
      });
      setMessage("✅ Parent details saved! Please log in again.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage("❌ Failed to save details.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">📋 Complete Parent Details</h2>

        <form onSubmit={handleSubmit}>
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

          {/* Parent Phone with Dropdown */}
          <label className="field-label">Parent Phone</label>
          <PhoneInput
            country={"eg"} // default country Egypt
            value={form.parentPhone}
            onChange={(phone) => setForm({ ...form, parentPhone: phone })}
            inputStyle={{ width: "100%" }}
            containerStyle={{ marginBottom: "15px" }}
            required
          />

          {/* Submit */}
          <button type="submit" className="login-btn">
            💾 Save
          </button>
        </form>

        {message && (
          <p className={`message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default CompleteParentDetails;
