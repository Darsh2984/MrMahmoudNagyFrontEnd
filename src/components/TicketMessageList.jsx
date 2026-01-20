import { useEffect, useRef } from "react";
import "./TicketMessageList.css";

export default function TicketMessageList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="ticket-messages-container">
      {messages.map((msg) => {
        const isStudent = msg.senderType === "student";

        return (
          <div
            key={msg._id}
            className={`ticket-message-row ${isStudent ? "from-student" : "from-teacher"}`}
          >
            <div className="ticket-message-bubble">
              <div className="ticket-message-meta">
                <span className="sender-name">{msg.sender?.name}</span>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>

              {/* ✅ TEXT */}
              {msg.type === "text" && (
                <div className="ticket-message-content">{msg.message}</div>
              )}

              {/* ✅ IMAGE */}
              {msg.type === "image" && msg.fileUrl && (
                <div className="ticket-attachment">
                  <img
                    className="ticket-image"
                    src={msg.fileUrl}
                    alt={msg.fileName || "attachment"}
                  />
                  <a className="ticket-download" href={msg.fileUrl} target="_blank" rel="noreferrer">
                    Open / Download
                  </a>
                </div>
              )}

              {/* ✅ AUDIO (voice notes like WhatsApp) */}
              {msg.type === "audio" && msg.fileUrl && (
                <div className="ticket-attachment">
                  <audio className="ticket-audio" controls src={msg.fileUrl} />
                </div>
              )}

              {/* ✅ FILE (pdf/doc/etc) */}
              {msg.type === "file" && msg.fileUrl && (
                <div className="ticket-attachment">
                  <a className="ticket-file" href={msg.fileUrl} target="_blank" rel="noreferrer">
                    📎 {msg.fileName || "Download file"}
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
