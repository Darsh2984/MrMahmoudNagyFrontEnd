import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./CompleteParentDetails.css"; // ✅ new CSS
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Envelope, DeviceMobile, CheckCircle } from "phosphor-react"; // ✅ icons

function CompleteParentDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    parentName: "",
    parentEmail: "",
    parentPhone: "",
  });
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
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/student/add-parent`, {
        studentId,
        ...form,
      });

      toast.success("✅ Parent details saved! Please log in again.", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error("❌ Failed to save details. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-page-layout">
      <div className="parent-form-card">
        {/* ✅ Title with icon */}
        <h2 className="parent-title">
          <User size={28} weight="bold" color="#0b3c49" />
          <span>Complete Parent Details</span>
        </h2>

        <form onSubmit={handleSubmit} className="parent-form">
          {/* Parent Name */}
          <div className="form-group">
            <label>
              <User size={18} weight="fill" color="#0b3c49" style={{ marginRight: "6px" }} />
              Parent Full Name
            </label>
            <input
              type="text"
              placeholder="Enter parent full name"
              value={form.parentName}
              onChange={(e) => setForm({ ...form, parentName: e.target.value })}
              required
            />
          </div>

          {/* Parent Email */}
          <div className="form-group">
            <label>
              <Envelope size={18} weight="fill" color="#0b3c49" style={{ marginRight: "6px" }} />
              Parent Email
            </label>
            <input
              type="email"
              placeholder="Enter parent email"
              value={form.parentEmail}
              onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
              required
            />
          </div>

          {/* Parent Phone */}
          <div className="form-group">
            <label>
              <DeviceMobile size={18} weight="fill" color="#0b3c49" style={{ marginRight: "6px" }} />
              Parent Phone
            </label>
            <PhoneInput
              country={"eg"}
              value={form.parentPhone}
              onChange={(phone) => setForm({ ...form, parentPhone: phone })}
              inputStyle={{ width: "100%" }}
              containerStyle={{ marginBottom: "15px" }}
              enableSearch
              countryCodeEditable={false}
              required
            />
          </div>

          {/* ✅ Button with icon */}
          <button type="submit" className="parent-btn" disabled={loading}>
            <CheckCircle size={20} weight="fill" color="#fff" />
            <span>{loading ? "Saving..." : "Save Details"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteParentDetails;
