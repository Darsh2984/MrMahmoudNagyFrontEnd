import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { CalendarBlank, CaretDown, ListBullets, UsersThree } from "phosphor-react";
import SessionAttendance from "./SessionAttendance";
import "react-toastify/dist/ReactToastify.css";
import "./GroupSessions.css"; // ✅ new CSS file

function GroupSessions({ groupId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (groupId) fetchSessions(groupId);
  }, [groupId]);

  const fetchSessions = async (gid) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/session/group/${gid}/${user.id}`
      );
      setSessions(res.data);
    } catch (err) {
      console.error("❌ Error fetching sessions:", err);
      toast.error("❌ Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="groupsessions-card">
      <div className="groupsessions-header">
        <div className="header-title">
          <CalendarBlank size={26} weight="duotone" color="#0b3c49" />
          <h3>Group Sessions</h3>
        </div>
        <button className="btn-refresh" onClick={() => fetchSessions(groupId)}>
          <CaretDown size={18} /> Refresh
        </button>
      </div>

      {/* --- SESSION LIST --- */}
      {loading ? (
        <p className="text-muted">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-muted">No sessions created yet for this group.</p>
      ) : (
        <>
          <div className="session-select-container">
            <label className="field-label">
              <ListBullets size={18} /> Select a Session
            </label>
            <select
              className="styled-select"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="">-- Select Session --</option>
              {sessions.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* --- ATTENDANCE SECTION --- */}
          {selectedSession && (
            <div className="attendance-container">
              <div className="attendance-header">
                <UsersThree size={20} weight="duotone" color="#0b3c49" />
                <h4>Session Attendance</h4>
              </div>
              <SessionAttendance sessionId={selectedSession} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GroupSessions;
