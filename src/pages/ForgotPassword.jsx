import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ForgotPassword.css"; // ✅ new CSS file
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Envelope, PaperPlaneRight } from "phosphor-react"; // ✅ icons

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        { email }
      );

      toast.success(res.data.msg || "✅ Reset link sent to your email.", {
        position: "top-center",
        autoClose: 2500,
      });

      setEmail("");
    } catch (err) {
      console.error("❌ Error sending reset link:", err);
      toast.error("❌ Error sending reset link. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page-layout">
      <div className="forgot-form-card">
        {/* ✅ Title with icon */}
        <h2 className="forgot-title">
          <Envelope size={28} weight="bold" color="#0b3c49" />
          <span>Forgot Password</span>
        </h2>

        <p className="forgot-subtext">
          Enter your email address and we’ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* ✅ Button with icon */}
          <button type="submit" className="forgot-btn" disabled={loading}>
            <PaperPlaneRight size={20} weight="fill" color="#fff" />
            <span>{loading ? "Sending..." : "Send Reset Link"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
