import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SessionAttendance from "./SessionAttendance";
import "../../src/styles/AppStyles.css";

function GroupSessions({ groupId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (groupId) fetchSessions(groupId);
  }, [groupId]);

  const fetchSessions = async (gid) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/session/group/${gid}/${user.id}`
    );
    setSessions(res.data);
  } catch (err) {
    console.error("❌ Error fetching sessions:", err);
    toast.error("❌ Failed to fetch sessions");
  }
};

  return (
    <div className="section-card">
      <h3 className="section-title">📅 Group Sessions</h3>

      {sessions.length === 0 ? (
        <p className="text-muted">No sessions created yet for this group.</p>
      ) : (
        <>
          <label className="field-label">Select a Session</label>
          <select
            className="styled-select"
            value={selectedSession || ""}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">-- Select Session --</option>
            {sessions.map((s) => (
              <option key={s._id} value={s._id}>
                {s.title}
              </option>
            ))}
          </select>

          {selectedSession && (
            <div style={{ marginTop: "20px" }}>
              <SessionAttendance sessionId={selectedSession} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GroupSessions;
