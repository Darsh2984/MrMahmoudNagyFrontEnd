import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import TeacherSidebar from "../components/TeacherSidebar";
import {
  PencilSimple,
  Trash,
  FloppyDisk,
  XCircle,
  Users,
  Student,
  UserCirclePlus,
} from "phosphor-react";
import "./AllStudentsData.css";

export default function AllStudentsData() {
  const [years, setYears] = useState([]);
  const [yearId, setYearId] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [students, setStudents] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) fetchYears(user.id);
    fetchUnassigned();
  }, [user?.id]);

  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch {
      toast.error("❌ Failed to fetch years");
    }
  };

  const fetchGroups = async (yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/group/${yearId}`);
      setGroups(res.data);
    } catch {
      toast.error("❌ Failed to fetch groups");
    }
  };

  const fetchStudents = async (yearId, groupId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/students/year/${yearId}/group/${groupId}`
      );
      setStudents(res.data);
    } catch {
      toast.error("❌ Failed to fetch students");
    }
  };

  const fetchUnassigned = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/students/unassigned`);
      setUnassigned(res.data);
    } catch {
      toast.error("❌ Failed to fetch unassigned students");
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA = a[sortConfig.key] || "";
    let valB = b[sortConfig.key] || "";
    if (sortConfig.key === "parentEmail") {
      valA = a.parentId?.email || "";
      valB = b.parentId?.email || "";
    }
    return sortConfig.direction === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const startEditing = (student) => {
    setEditing(student._id);
    setEditForm({
      ...student,
      parentEmail: student.parentId?.email || "",
    });
  };

  const cancelEditing = () => {
    setEditing(null);
    setEditForm({});
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/students/${editing}`, editForm);
      toast.success("✅ Student updated");
      setEditing(null);
      setEditForm({});
      if (groupId) fetchStudents(yearId, groupId);
      fetchUnassigned();
    } catch {
      toast.error("❌ Failed to update student");
    }
  };

  const handleDelete = async (studentId) => {
    toast.info(
      <div>
        <p>⚠️ Are you sure you want to delete this student and their parent?</p>
        <div className="toast-actions">
          <button
            onClick={async () => {
              try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/students/${studentId}`);
                toast.dismiss();
                toast.success("🗑️ Student deleted");
                if (groupId) fetchStudents(yearId, groupId);
                fetchUnassigned();
              } catch {
                toast.dismiss();
                toast.error("❌ Failed to delete student");
              }
            }}
            className="toast-btn-confirm"
          >
            Confirm
          </button>
          <button onClick={() => toast.dismiss()} className="toast-btn-cancel">
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, position: "top-center" }
    );
  };

  return (
    <div className="page-layout">
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`allstudents-container ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
        <div className="section-card">
          <h2 className="page-title">
            <Users size={28} weight="fill" color="#0b3c49" /> All Registered Student Data
          </h2>

          <div className="filter-bar">
            <div className="filter-item">
              <label>Year</label>
              <select
                value={yearId}
                onChange={(e) => {
                  setYearId(e.target.value);
                  setGroupId("");
                  setStudents([]);
                  fetchGroups(e.target.value);
                }}
                className="styled-select"
              >
                <option value="">-- Select Year --</option>
                {years.map((y) => (
                  <option key={y._id} value={y._id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            {groups.length > 0 && (
              <div className="filter-item">
                <label>Group</label>
                <select
                  value={groupId}
                  onChange={(e) => {
                    setGroupId(e.target.value);
                    fetchStudents(yearId, e.target.value);
                  }}
                  className="styled-select"
                >
                  <option value="">-- Select Group --</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {students.length > 0 && (
          <div className="section-card">
            <h3 className="card-title">
              <Student size={24} weight="fill" color="#0b3c49" /> Students in Group
            </h3>
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("name")}>Name</th>
                    <th onClick={() => handleSort("email")}>Email</th>
                    <th>Phone</th>
                    <th>Parent Name</th>
                    <th>Parent Phone</th>
                    <th>Parent Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((s) =>
                    editing === s._id ? (
                      <tr key={s._id}>
                        <td>
                          <input
                            className="styled-input"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            className="styled-input"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </td>
                        <td>
                          <PhoneInput
                            country="eg"
                            value={editForm.studentPhone || ""}
                            onChange={(phone) =>
                              setEditForm({ ...editForm, studentPhone: phone })
                            }
                            inputStyle={{ width: "100%" }}
                            enableSearch
                          />
                        </td>
                        <td>
                          <input
                            className="styled-input"
                            value={editForm.parentName || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, parentName: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <PhoneInput
                            country="eg"
                            value={editForm.parentPhone || ""}
                            onChange={(phone) =>
                              setEditForm({ ...editForm, parentPhone: phone })
                            }
                            inputStyle={{ width: "100%" }}
                            enableSearch
                          />
                        </td>
                        <td>
                          <input
                            className="styled-input"
                            value={editForm.parentEmail || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, parentEmail: e.target.value })
                            }
                          />
                        </td>
                        <td className="actions-cell">
                          <button className="btn btn-green" onClick={handleUpdate}>
                            <FloppyDisk size={18} /> Save
                          </button>
                          <button className="btn btn-red" onClick={cancelEditing}>
                            <XCircle size={18} /> Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={s._id}>
                        <td>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.studentPhone ? `+${s.studentPhone}` : "-"}</td>
                        <td>{s.parentName || "-"}</td>
                        <td>{s.parentPhone ? `+${s.parentPhone}` : "-"}</td>
                        <td>{s.parentId?.email || "-"}</td>
                        <td className="actions-cell">
                          <button className="btn btn-blue" onClick={() => startEditing(s)}>
                            <PencilSimple size={18} /> Edit
                          </button>
                          <button className="btn btn-red" onClick={() => handleDelete(s._id)}>
                            <Trash size={18} /> Delete
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {unassigned.length > 0 && (
          <div className="section-card">
            <h3 className="card-title">
              <UserCirclePlus size={24} weight="fill" color="#d77e42" /> Unassigned Students
            </h3>
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Parent Name</th>
                    <th>Parent Phone</th>
                    <th>Parent Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unassigned.map((s) => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.studentPhone ? `+${s.studentPhone}` : "-"}</td>
                      <td>{s.parentName || "-"}</td>
                      <td>{s.parentPhone ? `+${s.parentPhone}` : "-"}</td>
                      <td>{s.parentId?.email || "-"}</td>
                      <td>
                        <button className="btn btn-red" onClick={() => handleDelete(s._id)}>
                          <Trash size={18} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
