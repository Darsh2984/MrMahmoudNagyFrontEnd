import { useState } from "react";
import api from "../services/api";
import VoiceRecorder from "./VoiceRecorder";
import "./TicketReplyBox.css";

export default function TicketReplyBox({ ticketId }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const sendText = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSending(true);
    try {
      await api.post(`/api/tickets/${ticketId}/messages`, {
        message: text,
      });
      setText("");
    } catch {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const sendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "file");

    try {
      await api.post(
        `/api/tickets/${ticketId}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    } catch {
      alert("Failed to upload file");
    }

    e.target.value = "";
  };

  return (
    <form onSubmit={sendText} className="ticket-reply-container">
      <textarea
        className="ticket-reply-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        rows={3}
        disabled={sending}
      />

      <div className="ticket-reply-actions">
        <label className="file-btn">
          📎
          <input
            type="file"
            hidden
            onChange={sendFile}
          />
        </label>

        <VoiceRecorder
          ticketId={ticketId}
          disabled={sending}
        />

        <button
          type="submit"
          className="ticket-reply-send"
          disabled={sending || !text.trim()}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
