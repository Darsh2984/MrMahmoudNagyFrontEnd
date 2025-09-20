import React from "react";
import "./AccessDenied.css";

export default function AccessDenied() {
  return (
    <div className="access-denied">
      <h1 className="denied-title">Pending  Access</h1>
      <p className="denied-subtitle">
        CONTACT <span className="highlight">ENG Mahmoud's Team</span> <br />
        in order to get access
      </p>

      {/* 📞 Phone Number */}
      <p className="denied-contact">
        📞 Call: <a href="tel:+201030400674">+201030400674</a>
      </p>

      {/* 💬 WhatsApp Link */}
      <p className="denied-contact">
        💬 Need quick help?{" "}
        <a
          href="https://wa.link/ejd459"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-link"
        >
          Chat with us on WhatsApp
        </a>
      </p>
    </div>
  );
}
