import React, { useState, useEffect } from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./SpecialRegister.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Atom, CheckCircle } from "phosphor-react";

function SpecialRegister() {
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

  // Fetch School/Group List on component load
  useEffect(() => {
  const fetchSchools = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/school/all`);
      const filtered = res.data.filter((s) =>
        [
          "Private Group Cambridge Core",
          "Private Group Cambridge O-Level",
          "Private Group Edexcel O-level",
        ].includes(s.name)
      );
      const sorted = filtered.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      setSchools(sorted);
    } catch {
      toast.error("❌ Failed to load groups.");
    }
  };
  fetchSchools();
}, []);

  // Handle Form Submission
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
    <div className="physics-register-layout">
      <div className="physics-register-card fade-up">
        {/* Title Block */}
        <div className="physics-title-block">
          <Atom size={32} weight="fill" color="#f5f1eb" className="floating-atom" /> 
          <h2 className="physics-title-text">STUDENT REGISTRATION</h2>
        </div>

        
        <form onSubmit={handleRegister} className="physics-register-form">
          <div className="form-grid">
            {/* Student Details (Left Column) */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              {/* Group/School Dropdown */}
              <div className="form-group">
                <label htmlFor="school">Select Group</label>
                <select
                  id="school"
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
                    // ✅ Egypt-specific validation: no leading zero after +20
                    if (country.countryCode === "eg" && phone.startsWith("20") && phone[2] === "0") {
                      toast.warn("⚠️ For Egypt (+20), do not include 0 after the country code.", {
                        position: "top-center",
                        autoClose: 3000,
                      });
                      return;
                    }
                    setForm({ ...form, studentPhone: phone });
                  }}
                  inputStyle={{ width: "100%", border: "1px solid #8baa91" }} // Sage Green Border
                  buttonStyle={{
                    backgroundColor: "transparent",
                    borderRight: "1px solid #8baa91",
                  }}
                  enableSearch
                  countryCodeEditable={false}
                  inputProps={{ required: true }}
                />
              </div>
            </div>

            {/* Parent Details (Right Column) */}
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="parentName">Parent Full Name</label>
                <input
                  id="parentName"
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
                      toast.warn("⚠️ For Egypt (+20), do not include 0 after the country code.", {
                        position: "top-center",
                        autoClose: 3000,
                      });
                      return;
                    }
                    setForm({ ...form, parentPhone: phone });
                  }}
                  inputStyle={{ width: "100%", border: "1px solid #8baa91" }} // Sage Green Border
                  buttonStyle={{
                    backgroundColor: "transparent",
                    borderRight: "1px solid #8baa91",
                  }}
                  enableSearch
                  countryCodeEditable={false}
                  inputProps={{ required: true }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="parentEmail">Parent Email</label>
                <input
                  id="parentEmail"
                  type="email"
                  value={form.parentEmail}
                  onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Registration Button - Terracotta Red */}
          <button type="submit" className="physics-register-btn">
            {/* CheckCircle Icon: Cream White */}
            <CheckCircle size={24} weight="fill" color="#f5f1eb" />
            <span>Register Now</span>
          </button>
        </form>

        <p className="physics-register-link">
          Already have an account? <Link to="/login" className="login-link">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SpecialRegister;