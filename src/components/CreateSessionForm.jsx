import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../src/styles/AppStyles.css";

function CreateSessionForm({ teacherId, years, onSessionCreated }) {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");

  const createSession = async () => {
    if (!selectedYear || !selectedGroup || !sessionTitle) {
      toast.warn("⚠️ Please select a Year, a Group, and enter a Session Title");
      return;
    }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/session`, {
        title: sessionTitle,
        teacherId,
        yearId: selectedYear,
        groupId: selectedGroup,
      });

      toast.success("✅ Session created!");
      setSessionTitle("");
      setSelectedYear("");
      setSelectedGroup("");
      onSessionCreated(selectedGroup, res.data);
    } catch (err) {
      console.error("❌ Error creating session:", err);
      toast.error("❌ Failed to create session");
    }
  };

  return (
    <div className="section-card">
      <h3 className="section-title">Create Session</h3>

      {/* Year Selector */}
      <label className="field-label">Select Year</label>
      <select
        className="styled-select"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        <option value="">-- Select Year --</option>
        {years.map((y) => (
          <option key={y._id} value={y._id}>
            {y.name}
          </option>
        ))}
      </select>

      {/* Group Selector */}
      {selectedYear && (
        <>
          <label className="field-label">Select Group</label>
          <select
            className="styled-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">-- Select Group --</option>
            {years
              .find((y) => y._id === selectedYear)
              ?.groups?.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
          </select>
        </>
      )}

      {/* Session Title */}
      <label className="field-label">Session Title</label>
      <input
        type="text"
        className="styled-input"
        placeholder="Enter session title"
        value={sessionTitle}
        onChange={(e) => setSessionTitle(e.target.value)}
      />
      <br />
      <br />
      {/* Create Button */}
      <button className="btn btn-purple" onClick={createSession}>
        Create Session
      </button>
    </div>
  );
}

export default CreateSessionForm;
