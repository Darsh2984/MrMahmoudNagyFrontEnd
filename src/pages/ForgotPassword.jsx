import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AppStyles.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Add login-page class to body for background + centering
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        { email }
      );
      setMsg(res.data.msg || "✅ Reset link sent to your email.");
    } catch (err) {
      setMsg("❌ Error sending reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">🔑 Forgot Password</h2>
        <p style={{ textAlign: "center", marginBottom: "15px", color: "#555" }}>
          Enter your email address and we’ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "⏳ Sending..." : "📧 Send Reset Link"}
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
