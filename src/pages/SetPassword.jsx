import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/AppStyles.css";

function SetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || ""; // comes from Login redirect
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Apply login-page styling
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/parent/set-password`, {
        email,
        newPassword,
      });

      setMessage("✅ Password set successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("❌ Failed to set password:", err);
      setMessage("❌ Failed to set password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">🔑 Set Password</h2>

        <form onSubmit={handleSetPassword}>
          {/* Disabled Email */}
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input type="email" value={email} disabled />
          </div>

          {/* New Password */}
          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Set Password
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

export default SetPassword;
