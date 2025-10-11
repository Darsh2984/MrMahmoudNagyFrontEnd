import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CalendarBlank,
  PlusCircle,
  UsersThree,
  Student,
  CaretDown,
  CaretRight,
  Trash,
  ArrowsClockwise,
  Folder,
} from "phosphor-react";
import "react-toastify/dist/ReactToastify.css";
import "./CreateYear.css";

function CreateYear({ teacherId }) {
  const [newYear, setNewYear] = useState("");
  const [years, setYears] = useState([]);
  const [newGroup, setNewGroup] = useState({});
  const [expandedYear, setExpandedYear] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    groupId: null,
    studentId: null,
    studentName: "",
  });

  useEffect(() => {
    if (teacherId) fetchYears(teacherId);
  }, [teacherId]);

  const fetchYears = async (id) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${id}`);
      setYears(res.data);
    } catch (err) {
      console.error("❌ Error fetching years:", err);
      toast.error("❌ Failed to load years");
    }
  };

  const addYear = async () => {
    if (!newYear.trim()) return toast.warn("⚠️ Enter a year name");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/year`, {
        name: newYear,
        teacherId,
      });
      setNewYear("");
      toast.success("✅ Year added successfully!");
      fetchYears(teacherId);
    } catch (err) {
      console.error("❌ Error creating year:", err);
      toast.error("❌ Failed to create year");
    }
  };

  const addGroup = async (yearId) => {
    if (!newGroup[yearId]) return toast.warn("⚠️ Enter a group name");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/group`, {
        name: newGroup[yearId],
        yearId,
      });
      setNewGroup({ ...newGroup, [yearId]: "" });
      toast.success("✅ Group added successfully!");
      fetchYears(teacherId);
    } catch (err) {
      console.error("❌ Error creating group:", err);
      toast.error("❌ Failed to create group");
    }
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const confirmRemoveStudent = (groupId, studentId, studentName) => {
    setConfirmModal({ open: true, groupId, studentId, studentName });
  };

  const removeStudent = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/group/${confirmModal.groupId}/remove-student/${confirmModal.studentId}`
      );
      toast.success(`✅ Removed ${confirmModal.studentName}`);
      setConfirmModal({ open: false, groupId: null, studentId: null, studentName: "" });
      fetchYears(teacherId);
    } catch (err) {
      console.error("❌ Error removing student:", err);
      toast.error("❌ Failed to remove student");
    }
  };

  return (
    <div className="create-year-container">
      <div className="year-header">
        <div className="title">
          <CalendarBlank size={24} color="#0b3c49" weight="duotone" />
          <h3>Manage Years, Groups & Students</h3>
        </div>
        <button className="btn-refresh" onClick={() => fetchYears(teacherId)}>
          <ArrowsClockwise size={18} /> Refresh
        </button>
      </div>

      {/* Add Year */}
      <div className="year-form">
        <input
          type="text"
          placeholder="Enter Year Name (e.g. 2024/2025)"
          value={newYear}
          onChange={(e) => setNewYear(e.target.value)}
          className="styled-input"
        />
        <button className="btn btn-add" onClick={addYear}>
          <PlusCircle size={18} /> Add Year
        </button>
      </div>

      {/* Years List */}
      <div className="years-list">
        {years.length === 0 ? (
          <p className="no-data">No years added yet.</p>
        ) : (
          years.map((y) => (
            <div key={y._id} className="year-box">
              <div
                className="year-toggle"
                onClick={() =>
                  setExpandedYear(expandedYear === y._id ? null : y._id)
                }
              >
                {expandedYear === y._id ? (
                  <CaretDown size={18} />
                ) : (
                  <CaretRight size={18} />
                )}
                <span className="year-name">{y.name}</span>
              </div>

              {expandedYear === y._id && (
                <div className="groups-container">
                  {(y.groups || []).map((g) => (
                    <div key={g._id} className="group-card">
                      <div
                        className="group-header"
                        onClick={() => toggleGroup(g._id)}
                      >
                        {expandedGroups[g._id] ? (
                          <CaretDown size={16} />
                        ) : (
                          <CaretRight size={16} />
                        )}
                        <Folder size={18} color="#0b3c49" />
                        <b>{g.name}</b>
                      </div>

                      {expandedGroups[g._id] && (
                        <ul className="student-list">
                          {g.students && g.students.length > 0 ? (
                            [...g.students]
                              .sort((a, b) =>
                                a.name.localeCompare(b.name, undefined, {
                                  sensitivity: "base",
                                })
                              )
                              .map((s) => (
                                <li key={s._id} className="student-row">
                                  <div className="student-info">
                                    <Student size={16} />
                                    <span>
                                      {s.name} <small>({s.email})</small>
                                    </span>
                                  </div>
                                  <button
                                    className="btn btn-red small-btn"
                                    onClick={() =>
                                      confirmRemoveStudent(
                                        g._id,
                                        s._id,
                                        s.name
                                      )
                                    }
                                  >
                                    <Trash size={16} /> Remove
                                  </button>
                                </li>
                              ))
                          ) : (
                            <li className="no-student">No students yet</li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}

                  {/* Add Group once per year */}
                  <div className="add-group-form">
                    <input
                      type="text"
                      placeholder="New Group Name"
                      value={newGroup[y._id] || ""}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, [y._id]: e.target.value })
                      }
                      className="styled-input"
                    />
                    <button
                      className="btn btn-green"
                      onClick={() => addGroup(y._id)}
                    >
                      <PlusCircle size={16} /> Add Group
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h4>Confirm Removal</h4>
            <p>
              Are you sure you want to remove{" "}
              <b>{confirmModal.studentName}</b> from this group?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-grey"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    groupId: null,
                    studentId: null,
                    studentName: "",
                  })
                }
              >
                Cancel
              </button>
              <button className="btn btn-purple" onClick={removeStudent}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateYear;
