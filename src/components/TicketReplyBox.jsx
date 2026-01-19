import { useState } from "react";
import api from "../services/api";
import "./TicketReplyBox.css";

export default function TicketReplyBox({ ticketId }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);

    try {
      await api.post(`/api/tickets/${ticketId}/messages`, {
        message: text,
      });

      setText(""); // socket will update messages
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={send} className="ticket-reply-container">
      <textarea
        className="ticket-reply-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message here..."
        rows={3}
        disabled={sending}
      />

      <button
        type="submit"
        className="ticket-reply-send"
        disabled={sending || !text.trim()}
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
