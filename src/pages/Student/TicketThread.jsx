import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import socket from "../../services/socket";

import TeacherSidebar from "../../components/TeacherSidebar";
import StudentSidebar from "../../components/StudentSidebar";
import TicketMessageList from "../../components/TicketMessageList";
import TicketReplyBox from "../../components/TicketReplyBox";

import "./TicketThread.css";

export default function TicketThread() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // join / leave socket room
  useEffect(() => {
    if (!id || !user) return;

    socket.emit("join-ticket", {
      ticketId: id,
      userId: user.id,
    });

    socket.on("new-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leave-ticket", {
        ticketId: id,
        userId: user.id,
      });
      socket.off("new-message");
    };
  }, [id]);

  const fetchTicket = async () => {
    const res = await api.get(`/api/tickets/${id}`);
    setTicket(res.data);
  };

  const fetchMessages = async () => {
    const res = await api.get(`/api/tickets/${id}/messages`);
    setMessages(res.data);
  };

  useEffect(() => {
    Promise.all([fetchTicket(), fetchMessages()]).finally(() =>
      setLoading(false)
    );
  }, [id]);

  const closeTicket = async () => {
    if (!window.confirm("Close this ticket?")) return;
    await api.post(`/api/tickets/${id}/close`);
    fetchTicket();
  };

  if (loading) return <p>Loading ticket...</p>;
  if (!ticket) return <p>Ticket not found</p>;

  return (
    <div className="ticket-layout">
      {/* Sidebar */}
      {isTeacher && (
        <TeacherSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      {isStudent && (
        <StudentSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      {/* Main Content */}
      <main
        className={`ticket-main ${
          sidebarOpen ? "ticket-expanded" : "ticket-collapsed"
        }`}
      >
        <header className="ticket-header">
          <h2>{ticket.subject}</h2>
          <span
            className={`ticket-status ${
              ticket.status === "closed" ? "closed" : "open"
            }`}
          >
            {ticket.status}
          </span>
        </header>

        <section className="ticket-chat-card">
          <TicketMessageList messages={messages} />

          {ticket.status !== "closed" && (
            <TicketReplyBox ticketId={id} />
          )}
        </section>

        {ticket.status !== "closed" && ticket.canClose && (
          <button className="ticket-close-btn" onClick={closeTicket}>
            Close Ticket
          </button>
        )}
      </main>
    </div>
  );
}
