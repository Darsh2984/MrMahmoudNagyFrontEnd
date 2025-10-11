import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css"; // ✅ same layout structure as Register.css
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, SignIn } from "phosphor-react"; // ✅ icons

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { email: email.toLowerCase(), password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("✅ Login successful!", {
        position: "top-center",
        autoClose: 1500,
      });

      if (res.data.user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (res.data.user.role === "student") {
        if (res.data.parentDetailsRequired) {
          navigate(`/complete-parent/${res.data.studentId}`);
        } else if (!res.data.user.groupId) {
          navigate("/accessdenied");
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

      if (err.response?.data?.parentDetailsRequired) {
        navigate(`/complete-parent/${err.response.data.studentId}`);
        return;
      }

      toast.error("❌ Invalid credentials. Please try again.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="login-page-layout">
      <div className="login-form-card">
        {/* ✅ Title with icon (same as Register) */}
        <h2 className="login-title">
          <Lock size={28} weight="bold" color="#0b3c49" />
          <span>Login</span>
        </h2>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            <SignIn size={20} weight="fill" color="#fff" />
            <span>Login</span>
          </button>
        </form>

        <p className="login-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <p className="login-link">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
