// ResetPassword.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AppStyles.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Add login-page background + centering
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMsg("❌ Passwords do not match!");
    }

    setLoading(true);
    setMsg("");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`,
        { password }
      );
      setMsg(res.data.msg || "✅ Password reset successful!");

      // redirect to login after 2 seconds
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMsg("❌ Error resetting password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">🔑 Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "⏳ Resetting..." : "✅ Reset Password"}
          </button>
        </form>

        {msg && (
          <p className={`message ${msg.includes("✅") ? "success" : "error"}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
