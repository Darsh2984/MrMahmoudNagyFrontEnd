import React, { useState } from "react";
import axios from "axios";

function ManageGroups({ year, onGroupCreated, onViewSessions }) {
  const [newGroup, setNewGroup] = useState("");

  const addGroup = async () => {
    if (!newGroup) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/group`, {
        name: newGroup,
        yearId: year._id
      });
      onGroupCreated(year._id, res.data);
      setNewGroup("");
    } catch (err) {
      console.error("❌ Error creating group:", err);
    }
  };

  return (
    <div style={{ marginLeft: "20px" }}>
      <h4>Groups</h4>
      <ul>
        {(year.groups || []).map((g) => (
          <li key={g._id}>
            <b>{g.name}</b>
            <button onClick={() => onViewSessions(g._id)}>View Sessions</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Group Name"
        value={newGroup}
        onChange={(e) => setNewGroup(e.target.value)}
      />
      <button onClick={addGroup}>Add Group</button>
    </div>
  );
}

export default ManageGroups;
