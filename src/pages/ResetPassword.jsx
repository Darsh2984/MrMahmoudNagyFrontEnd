import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css"; // ✅ new CSS
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Key, CheckCircle } from "phosphor-react"; // ✅ icons

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Add same centered layout background
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`,
        { password }
      );
      toast.success(res.data.msg || "✅ Password reset successful!", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error("❌ Error resetting password. Try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page-layout">
      <div className="reset-form-card">
        {/* ✅ Title with icon */}
        <h2 className="reset-title">
          <Key size={28} weight="bold" color="#0b3c49" />
          <span>Reset Password</span>
        </h2>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* ✅ Button with icon */}
          <button type="submit" className="reset-btn" disabled={loading}>
            <CheckCircle size={20} weight="fill" color="#fff" />
            <span>{loading ? "Resetting..." : "Reset Password"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
