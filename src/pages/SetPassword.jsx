import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./SetPassword.css"; // ✅ new CSS file
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Key, CheckCircle, Envelope } from "phosphor-react"; // ✅ icons

function SetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Add background layout
  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("❌ Passwords do not match.", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/parent/set-password`, {
        email,
        newPassword,
      });

      toast.success("✅ Password set successfully! Redirecting...", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("❌ Failed to set password:", err);
      toast.error("❌ Failed to set password. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-page-layout">
      <div className="set-form-card">
        {/* ✅ Title with icon */}
        <h2 className="set-title">
          <Key size={28} weight="bold" color="#0b3c49" />
          <span>Set Password</span>
        </h2>

        <form onSubmit={handleSetPassword} className="set-form">
          {/* Disabled Email Field */}
          <div className="form-group">
            <label>
              <Envelope size={18} weight="fill" color="#0b3c49" style={{ marginRight: "6px" }} />
              Email
            </label>
            <input type="email" value={email} disabled />
          </div>

          {/* New Password */}
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* ✅ Submit Button */}
          <button type="submit" className="set-btn" disabled={loading}>
            <CheckCircle size={20} weight="fill" color="#fff" />
            <span>{loading ? "Setting..." : "Set Password"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetPassword;
