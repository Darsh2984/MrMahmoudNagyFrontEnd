import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import StudentSidebar from "../../components/StudentSidebar";
import "./CreateTicket.css";

export default function CreateTicket() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await api.get("/api/ticket-categories/public");
    setCategories(res.data);
  };

  const selectedCategory = categories.find(
    (c) => c._id === categoryId
  );

  const submitTicket = async (e) => {
    e.preventDefault();

    if (!categoryId || !subject.trim() || !message.trim()) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/tickets", {
        category: categoryId,
        subject,
        message,
      });

      navigate(`/tickets/${res.data._id}`);
    } catch {
      alert("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-create-layout">
      {/* Sidebar */}
      <StudentSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main */}
      <main
        className={`student-create-main ${
          sidebarOpen ? "expanded" : "collapsed"
        }`}
      >
        <header className="student-create-header">
          <h2>Open Support Ticket</h2>
          <p>Describe your issue and our team will assist you</p>
        </header>

        <section className="student-create-card">
          <form onSubmit={submitTicket} className="create-ticket-form">
            <label>Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {selectedCategory && (
              <p className="category-description">
                {selectedCategory.description}
              </p>
            )}

            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary of the issue"
              required
            />

            <label>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail"
              rows={5}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
