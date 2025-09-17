import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../src/styles/AppStyles.css";

function SessionAttendance({ sessionId }) {
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (sessionId) fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/session/${sessionId}`
      );
      setSession(res.data);
      setAttendance(res.data.attendance || []);
    } catch (err) {
      toast.error("❌ Failed to fetch session");
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.studentId._id === studentId
          ? { ...a, status: a.status === "Present" ? "Absent" : "Present" }
          : a
      )
    );
  };

  const saveAttendance = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/session/${session._id}/attendance`,
        {
          attendance: attendance.map((a) => ({
            studentId: a.studentId._id,
            status: a.status,
          })),
        }
      );
      toast.success("✅ Attendance updated");
    } catch (err) {
      toast.error("❌ Failed to update attendance");
    }
  };

  if (!session) return <p className="text-muted">Loading session...</p>;

  return (
    <div className="section-card">
      <h3 className="section-title">{session.title}</h3>
      <p className="text-muted">Group: {session.groupId.name}</p>

      <ul className="list-unstyled">
        {attendance.map((a) => (
          <li key={a.studentId._id} className="list-item student-row">
            <label>
              <input
                type="checkbox"
                checked={a.status === "Present"}
                onChange={() => toggleAttendance(a.studentId._id)}
                className="attendance-checkbox"
              />
              {a.studentId.name}{" "}
              <small style={{ color: "#666" }}>({a.studentId.email})</small>
            </label>
            <span
              className={`status-tag ${
                a.status === "Present" ? "tag-green" : "tag-red"
              }`}
            >
              {a.status}
            </span>
          </li>
        ))}
      </ul>

      <button onClick={saveAttendance} className="btn btn-purple">
        💾 Save Attendance
      </button>
    </div>
  );
}

export default SessionAttendance;
