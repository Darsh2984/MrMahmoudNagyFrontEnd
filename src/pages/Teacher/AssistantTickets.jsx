import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import TeacherSidebar from "../../components/TeacherSidebar";
import "./AssistantTickets.css";

export default function AssistantTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await api.get("/api/tickets/teacher");
    setTickets(res.data);
    setLoading(false);
  };

  return (
    <div className="support-layout">
      {/* SIDEBAR */}
      <TeacherSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN */}
      <main
        className={`support-main ${
          sidebarOpen ? "support-expanded" : "support-collapsed"
        }`}
      >
        <header className="support-header">
          <h2>Support Tickets</h2>
          <p>View and manage all support conversations</p>
        </header>

        <section className="support-card">
          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            <table className="support-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Student</th>
                  <th>Assigned To</th>
                  <th>Created At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => navigate(`/tickets/${t._id}`)}
                  >
                    <td>{t.subject}</td>
                    <td>{t.createdBy?.name}</td>
                    <td>{t.assignedTo?.name || "Unassigned"}</td>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          t.status === "closed"
                            ? "status-closed"
                            : "status-open"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
