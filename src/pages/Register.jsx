import React, { useState, useEffect } from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserPlus, CheckCircle } from "phosphor-react"; // ✅ icons

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
    schoolId: "",
  });

  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/school/all`);
        // Exclude specific groups by name
        const excludedGroups = [
          "Private Group Cambridge Core",
          "Private Group Cambridge O-Level",
          "Private Group Edexcel O-level",
        ];

        const filtered = res.data.filter((s) => !excludedGroups.includes(s.name));

        const sorted = filtered.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );

        setSchools(sorted);
      } catch {
        toast.error("❌ Failed to load schools");
      }
    };
    fetchSchools();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.email.trim() && form.parentEmail.trim() && form.email === form.parentEmail) {
      toast.error("❌ Student email cannot be the same as parent email.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, form);
      toast.success("✅ Registration successful! Redirecting...", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg =
        err.response?.data?.msg?.includes("User already exists")
          ? "❌ User already exists. Please log in."
          : "❌ Registration failed. Try again.";
      toast.error(msg, { position: "top-center" });
    }
  };

  return (
    <div className="register-page-layout">
      <div className="register-form-card">
        {/* ✅ Title with icon */}
        <h2 className="register-title">
          <UserPlus size={28} weight="bold" color="#0b3c49" />
          <span>Register</span>
        </h2>

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Group</label>
            <select
              value={form.schoolId}
              onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
              required
            >
              <option value="">-- Select Group --</option>
              {schools.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Student Phone</label>
            <PhoneInput
              country={"eg"}
              value={form.studentPhone}
              onChange={(phone, country) => {
                if (country.countryCode === "eg" && phone.startsWith("20") && phone[2] === "0") {
                  toast.warn("⚠️ For Egypt, do not include 0 after the country code (+20).", {
                    position: "top-center",
                    autoClose: 3000,
                  });
                  return; // ❌ prevent saving invalid number
                }
                setForm({ ...form, studentPhone: phone });
              }}
              inputStyle={{ width: "100%" }}
              enableSearch
              countryCodeEditable={false}
              inputProps={{ required: true }}
            />
          </div>

          <div className="form-group">
            <label>Parent Full Name</label>
            <input
              type="text"
              value={form.parentName}
              onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Parent Phone</label>
            <PhoneInput
              country={"eg"}
              value={form.parentPhone}
              onChange={(phone, country) => {
                if (country.countryCode === "eg" && phone.startsWith("20") && phone[2] === "0") {
                  toast.warn("⚠️ For Egypt, do not include 0 after the country code (+20).", {
                    position: "top-center",
                    autoClose: 3000,
                  });
                  return;
                }
                setForm({ ...form, parentPhone: phone });
              }}
              inputStyle={{ width: "100%" }}
              enableSearch
              countryCodeEditable={false}
              inputProps={{ required: true }}
            />
          </div>

          <div className="form-group">
            <label>Parent Email</label>
            <input
              type="email"
              value={form.parentEmail}
              onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
              required
            />
          </div>

          {/* ✅ Button with icon */}
          <button type="submit" className="register-btn">
            <CheckCircle size={20} weight="fill" color="#fff" />
            <span>Register</span>
          </button>
        </form>

        <p className="register-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
