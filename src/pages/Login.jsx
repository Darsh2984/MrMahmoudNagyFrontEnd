import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/AppStyles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // ✅ Add login-page class to body when this page is active
  useEffect(() => {
    document.body.classList.add("login-page");

    // ✅ If already remembered, tick the box
    if (localStorage.getItem("token")) {
      setRememberMe(true);
    }

    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { email: email.toLowerCase(), password }
      );

      // ✅ Save based on Remember Me
      if (rememberMe) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      }

      setMessage("✅ Login successful!");

      if (res.data.user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (res.data.user.role === "student") {
        // ✅ Check if student must complete parent details first
        if (res.data.parentDetailsRequired) {
          navigate(`/complete-parent/${res.data.studentId}`);
        }
        // ✅ Check if student is assigned to a group
        else if (!res.data.user.groupId) {
          navigate("/Accessdenied");
        } else {
          navigate("/student-dashboard");
        }
      } else if (res.data.user.role === "parent") {
        navigate("/parent-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Login failed:", err);

      if (err.response?.data?.activationRequired) {
        navigate("/set-password", { state: { email: err.response.data.email } });
        return;
      }

      // ✅ Handle missing parent details returned as an error
      if (err.response?.data?.parentDetailsRequired) {
        navigate(`/complete-parent/${err.response.data.studentId}`);
        return;
      }

      setMessage("❌ Login failed! Please check credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">🔐 Welcome Back</h2>

        <form onSubmit={handleLogin}>
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

          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ✅ Remember Me */}
          <div className="input-group remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        {/* 🔹 Forgot password link */}
        <p className="forgot-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        {/* 🔹 Register link */}
        <p className="forgot-link">
          Don’t have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>

        {message && (
          <p
            className={`message ${
              message.includes("✅") ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
