import { useEffect, useRef } from "react";
import "./TicketMessageList.css";

export default function TicketMessageList({ messages }) {
  const bottomRef = useRef(null);

  // 🔽 Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="ticket-messages-container">
      {messages.map((msg) => {
        const isStudent = msg.senderType === "student";

        return (
          <div
            key={msg._id}
            className={`ticket-message-row ${
              isStudent ? "from-student" : "from-teacher"
            }`}
          >
            <div className="ticket-message-bubble">
              <div className="ticket-message-meta">
                <span className="sender-name">
                  {msg.sender?.name}
                </span>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="ticket-message-content">
                {msg.message}
              </div>
            </div>
          </div>
        );
      })}

      {/* 👇 Invisible anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
