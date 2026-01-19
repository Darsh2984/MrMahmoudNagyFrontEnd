import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import StudentSidebar from "../../components/StudentSidebar";
import "./MyTickets.css";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await api.get("/api/tickets/my");
    setTickets(res.data);
    setLoading(false);
  };

  return (
    <div className="student-support-layout">
      {/* Sidebar */}
      <StudentSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main */}
      <main
        className={`student-support-main ${
          sidebarOpen ? "expanded" : "collapsed"
        }`}
      >
        <header className="student-support-header">
          <h2>My Support Tickets</h2>
          <p>Track and continue your support conversations</p>
        </header>

        <section className="student-support-card">
          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p>You have no support tickets.</p>
          ) : (
            <table className="student-support-table">
              <thead>
                <tr>
                  <th>Subject</th>
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
                    <td>{t.assignedTo?.name || "—"}</td>
                    <td>
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`ticket-status-badge ${
                          t.status === "closed"
                            ? "badge-closed"
                            : "badge-open"
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
