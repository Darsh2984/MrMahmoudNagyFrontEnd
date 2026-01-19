import { useEffect, useState } from "react";
import TeacherSidebar from "../../components/TeacherSidebar";
import api from "../../services/api";
import "./TicketAnalytics.css";

export default function TicketAnalytics() {
  const [data, setData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const res = await api.get("/api/ticket-analytics/assistants");
    setData(res.data);
  };

  return (
    <div className="ticket-analytics-layout">
      <TeacherSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main
        className={`ticket-analytics-main ${
          sidebarOpen ? "expanded" : "collapsed"
        }`}
      >
        <header className="ticket-analytics-header">
          <h2>Support Assistants Analytics</h2>
          <p>Detailed ticket activity per assistant</p>
        </header>

        {data.map((block) => (
          <section key={block.assistant.id} className="assistant-analytics-card">
            {/* SUMMARY */}
            <div
              className="assistant-summary"
              onClick={() =>
                setExpanded(
                  expanded === block.assistant.id
                    ? null
                    : block.assistant.id
                )
              }
            >
              <div>
                <h3>{block.assistant.name}</h3>
                <small>{block.assistant.email}</small>
              </div>

              <div className="summary-stats">
                <span>Total: {block.summary.total}</span>
                <span className="open">Open: {block.summary.open}</span>
                <span className="closed">
                  Closed: {block.summary.closed}
                </span>
              </div>
            </div>

            {/* DETAILS */}
            {expanded === block.assistant.id && (
              <table className="assistant-tickets-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {block.tickets.map((t) => (
                    <tr key={t.id}>
                      <td>{t.subject}</td>
                      <td>{t.studentName}</td>
                      <td
                        className={
                          t.status === "closed" ? "closed" : "open"
                        }
                      >
                        {t.status}
                      </td>
                      <td>
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td>
                        {t.closedAt
                          ? new Date(t.closedAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
