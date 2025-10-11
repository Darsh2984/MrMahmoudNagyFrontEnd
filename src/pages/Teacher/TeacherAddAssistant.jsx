import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import TeacherSidebar from "../../components/TeacherSidebar";
import { UserPlus, Users, Trash } from "phosphor-react";
import "./TeacherAddAssistant.css";

export default function TeacherAddAssistant() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [assistants, setAssistants] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.id;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchAssistants = async () => {
    try {
      if (!teacherId) return;
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/teacher/assistants/${teacherId}`
      );
      setAssistants(res.data);
    } catch (err) {
      console.error("❌ Error fetching assistants:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!teacherId) {
        toast.error("❌ Teacher ID not found. Please log in again.");
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/teacher/add-assistant`,
        { ...form, teacherId }
      );

      toast.success("✅ Assistant added successfully");
      setForm({ name: "", email: "", password: "" });
      fetchAssistants();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "❌ Error adding assistant");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/auth/teacher/delete-assistant/${teacherId}/${id}`
      );

      toast.success("Assistant deleted successfully");
      fetchAssistants();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "❌ Error deleting assistant");
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  return (
    <div
      className={`assistant-page-layout ${
        sidebarOpen ? "with-sidebar" : "full-width"
      }`}
    >
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="assistant-container">
        {/* === Add Assistant Section === */}
        <div className="assistant-section-card">
          <h2 className="assistant-page-title">
            <UserPlus size={26} weight="fill" color="#0b3c49" />
            Add Assistant
          </h2>

          <form onSubmit={handleSubmit} className="assistant-styled-form">
            <div className="assistant-form-group">
              <label>Name</label>
              <input
                className="assistant-styled-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="assistant-form-group">
              <label>Email</label>
              <input
                className="assistant-styled-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="assistant-form-group">
              <label>Password</label>
              <input
                className="assistant-styled-input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="assistant-btn assistant-btn-blue">
              Add Assistant
            </button>
          </form>
        </div>

        {/* === Assistants List === */}
        <div className="assistant-section-card">
          <h2 className="assistant-card-title">
            <Users size={24} weight="fill" color="#8baa91" />
            My Assistants
          </h2>

          {assistants.length === 0 ? (
            <p className="assistant-empty-msg">No assistants added yet.</p>
          ) : (
            <div className="assistant-cards-grid">
              {assistants.map((a) => (
                <div key={a._id} className="assistant-card">
                  <div className="assistant-info">
                    <h4>{a.name}</h4>
                    <p>{a.email}</p>
                  </div>
                  <button
                    className="assistant-btn assistant-btn-red"
                    onClick={() => handleDelete(a._id)}
                  >
                    <Trash size={18} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
