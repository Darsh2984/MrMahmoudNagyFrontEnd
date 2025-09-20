import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../src/styles/AppStyles.css";

function CreateYear({ teacherId }) {
  const [newYear, setNewYear] = useState("");
  const [years, setYears] = useState([]);
  const [newGroup, setNewGroup] = useState({});
  const [expandedYear, setExpandedYear] = useState(null);

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
    if (!newYear) return toast.warn("⚠️ Enter a year name");
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/year`, {
        name: newYear,
        teacherId,
      });
      setNewYear("");
      toast.success("✅ Year added");
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
      toast.success("✅ Group added");
      fetchYears(teacherId);
    } catch (err) {
      console.error("❌ Error creating group:", err);
      toast.error("❌ Failed to create group");
    }
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
    <div className="section-card">
      <h3 className="section-title">🏫 Manage Years, Groups & Students</h3>

      <button className="btn btn-purple" onClick={() => fetchYears(teacherId)}>
        🔄 Refresh
      </button>

      {/* Add Year */}
      <div className="form-inline">
        <input
          type="text"
          placeholder="Enter Year Name (e.g. 2024/2025)"
          value={newYear}
          onChange={(e) => setNewYear(e.target.value)}
          className="styled-input"
        />
        <button onClick={addYear} className="btn btn-purple">
          Add Year
        </button>
      </div>

      {/* Years List (scrollable like schools) */}
      <div className="years-list">
        <ul className="list-unstyled">
          {years.map((y) => (
            <li key={y._id} className="list-item">
              <span
                className={`expand-toggle ${expandedYear === y._id ? "expanded" : ""}`}
                onClick={() => setExpandedYear(expandedYear === y._id ? null : y._id)}
              >
                {y.name} {expandedYear === y._id ? "▼" : "▶"}
              </span>

              {expandedYear === y._id && (
                <div className="nested-box">
                  {/* Groups */}
                  <ul className="list-unstyled">
                    {(y.groups || []).map((g) => (
                      <li key={g._id} className="group-box">
                        <b>{g.name}</b>
                        <ul className="list-unstyled nested-students">
                          {g.students && g.students.length > 0 ? (
                            g.students.map((s) => (
                              <li key={s._id} className="student-row">
                                <span>
                                  {s.name} <small>({s.email})</small>
                                </span>
                                <button
                                  className="btn btn-purple btn-small"
                                  onClick={() =>
                                    confirmRemoveStudent(g._id, s._id, s.name)
                                  }
                                >
                                  Remove
                                </button>
                              </li>
                            ))
                          ) : (
                            <li>
                              <i>No students in this group yet</i>
                            </li>
                          )}
                        </ul>
                      </li>
                    ))}
                  </ul>

                  {/* Add Group */}
                  <div className="form-inline">
                    <input
                      type="text"
                      placeholder="New Group Name"
                      value={newGroup[y._id] || ""}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, [y._id]: e.target.value })
                      }
                      className="styled-input"
                    />
                    <button onClick={() => addGroup(y._id)} className="btn btn-purple">
                      Add Group
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>


      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h4>Confirm Removal</h4>
            <p>
              Are you sure you want to remove <b>{confirmModal.studentName}</b> from
              this group?
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
