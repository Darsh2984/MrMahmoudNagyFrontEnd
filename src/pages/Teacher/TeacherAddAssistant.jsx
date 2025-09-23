import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../styles/AppStyles.css";
import TeacherSidebar from "../../components/TeacherSidebar";

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
    const user = JSON.parse(localStorage.getItem("user"));
    const teacherId = user?.id;

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
        const user = JSON.parse(localStorage.getItem("user")); // get logged-in teacher
        const teacherId = user?.id;

        if (!teacherId) {
        toast.error("❌ Teacher ID not found. Please log in again.");
        return;
        }

        await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/teacher/add-assistant`,
        { ...form, teacherId } // ✅ include teacherId
        );

        toast.success("✅ Assistant added successfully");
        setForm({ name: "", email: "", password: "" });
        fetchAssistants(); // refresh list
    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.msg || "❌ Error adding assistant");
    }
    };


  const handleDelete = async (id) => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const teacherId = user?.id;

        await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/auth/teacher/delete-assistant/${teacherId}/${id}`
        );

        toast.success("🗑️ Assistant deleted successfully");
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
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="page-container">
        {/* ✅ Section Card for Adding Assistant */}
        <div className="section-card">
          <h2>Add Assistant</h2>
          <form onSubmit={handleSubmit} className="styled-form">
            <label>Name</label>
            <input
              className="styled-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              className="styled-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>
            <input
              className="styled-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="btn btn-purple">
            Add Assistant
            </button>
          </form>
        </div>

        {/* ✅ Section Card for Listing Assistants */}
        <div className="section-card">
        <h2>👥 My Assistants</h2>
        {assistants.length === 0 ? (
            <p>No assistants added yet.</p>
        ) : (
            <div className="submission-table">
            {/* Header */}
            <div className="submission-header">
                <span>Name</span>
                <span>Email</span>
                <span>Actions</span>
            </div>

            {/* Rows */}
            {assistants.map((a) => (
                <div key={a._id} className="submission-row">
                <span>{a.name}</span>
                <span>{a.email}</span>
                <span>
                    <button
                    className="btn btn-red"
                    onClick={() => handleDelete(a._id)}
                    >
                    Delete
                    </button>
                </span>
                </div>
            ))}
            </div>
        )}
        </div>

      </main>
    </div>
  );
}
