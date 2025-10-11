import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  UsersThree,
  PlusCircle,
  Folder,
  Eye,
} from "phosphor-react";
import "react-toastify/dist/ReactToastify.css";
import "./ManageGroups.css"; 

function ManageGroups({ year, onGroupCreated, onViewSessions }) {
  const [newGroup, setNewGroup] = useState("");

  const addGroup = async () => {
    if (!newGroup.trim()) {
      toast.warn("⚠️ Please enter a group name!");
      return;
    }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/group`, {
        name: newGroup,
        yearId: year._id,
      });
      onGroupCreated(year._id, res.data);
      setNewGroup("");
      toast.success("✅ Group created successfully!");
    } catch (err) {
      console.error("❌ Error creating group:", err);
      toast.error("❌ Failed to create group");
    }
  };

  return (
    <div className="manage-groups-container">
      {/* Header */}
      <div className="groups-header">
        <div className="header-title">
          <UsersThree size={22} color="#0b3c49" weight="duotone" />
          <h4>Groups for {year.name}</h4>
        </div>
      </div>

      {/* Existing Groups */}
      <div className="groups-list">
        {(year.groups || []).length === 0 ? (
          <p className="no-groups">No groups yet.</p>
        ) : (
          (year.groups || []).map((g) => (
            <div key={g._id} className="group-card">
              <div className="group-info">
                <Folder size={18} color="#0b3c49" />
                <b>{g.name}</b>
              </div>
              <button
                className="btn btn-view"
                onClick={() => onViewSessions(g._id)}
              >
                <Eye size={16} /> View Sessions
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add New Group */}
      <div className="group-form">
        <input
          type="text"
          placeholder="Enter New Group Name"
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
          className="styled-input"
        />
        <button className="btn btn-add" onClick={addGroup}>
          <PlusCircle size={18} /> Add Group
        </button>
      </div>
    </div>
  );
}

export default ManageGroups;
