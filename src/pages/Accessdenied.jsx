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
    </div>
  );
}
