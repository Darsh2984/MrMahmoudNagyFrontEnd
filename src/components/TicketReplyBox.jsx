import { useState } from "react";
import api from "../services/api";
import VoiceRecorder from "./VoiceRecorder";
import "./TicketReplyBox.css";

export default function TicketReplyBox({ ticketId }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const sendText = async () => {
    if (!text.trim() || sending) return;

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

  const handleKeyDown = (e) => {
    // Enter = send | Shift+Enter = new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  const sendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

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
    <form
      className="ticket-reply-container"
      onSubmit={(e) => e.preventDefault()}
    >
      <textarea
        className="ticket-reply-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        rows={3}
        disabled={sending}
      />

      <div className="ticket-reply-actions">
        <label className="file-btn" title="Attach file">
          📎
          <input type="file" hidden onChange={sendFile} />
        </label>

        <VoiceRecorder ticketId={ticketId} disabled={sending} />

        <button
          type="button"
          className="ticket-reply-send"
          onClick={sendText}
          disabled={sending || !text.trim()}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
