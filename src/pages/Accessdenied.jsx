import React from "react";
import "./Accessdenied.css";

export default function AccessDenied() {
  return (
    <div className="access-denied">
      <h1 className="denied-title">ACCESS DENIED</h1>
      <p className="denied-subtitle">
        CONTACT <span className="highlight">Mr Mahmoud's Team</span> <br />
        in order to get access
      </p>

      {/* 📞 Phone Number */}
      <p className="denied-contact">
        📞 Call: <a href="tel:+201066770745">+20 106 677 0745</a>
      </p>

      {/* 💬 WhatsApp Link */}
      <p className="denied-contact">
        💬 Need quick help?{" "}
        <a
          href="https://wa.link/lx46no"
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
