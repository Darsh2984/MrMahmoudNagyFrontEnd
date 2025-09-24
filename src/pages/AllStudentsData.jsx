import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../styles/AppStyles.css";
import TeacherSidebar from "../components/TeacherSidebar";

export default function AllStudentsData() {
  const [years, setYears] = useState([]);
  const [yearId, setYearId] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [students, setStudents] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editing, setEditing] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // Sorting handler
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sorted students list
  const sortedStudents = [...students].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valA, valB;

    switch (sortConfig.key) {
      case "parentEmail":
        valA = a.parentId?.email || "";
        valB = b.parentId?.email || "";
        break;
      default:
        valA = a[sortConfig.key] || "";
        valB = b[sortConfig.key] || "";
        break;
    }

    valA = valA.toString().toLowerCase();
    valB = valB.toString().toLowerCase();

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Load years + unassigned students
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

  // ✅ Update student + parent
  const handleUpdate = async (student) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/students/${student._id}`, student);
      toast.success("✅ Student updated");
      setEditing(null);
      if (groupId) fetchStudents(yearId, groupId);
      fetchUnassigned();
    } catch {
      toast.error("❌ Failed to update student");
    }
  };

  // ✅ Delete student + parent
  const handleDelete = async (studentId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this student and their parent?")) {
      return;
    }
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/students/${studentId}`);
      toast.success("🗑️ Student deleted");
      if (groupId) fetchStudents(yearId, groupId);
      fetchUnassigned();
    } catch {
      toast.error("❌ Failed to delete student");
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📋 All Registered Student Data</h2>

          {/* Year & Group Selectors */}
          <div className="filter-box">
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

        {/* Students in Group */}
        {students.length > 0 && (
          <div className="section-card">
            <h3 className="card-title">👥 Students in Group</h3>
            <table className="styled-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")}>
                    Name {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("email")}>
                    Email {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("studentPhone")}>
                    Phone {sortConfig.key === "studentPhone" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("parentName")}>
                    Parent Name {sortConfig.key === "parentName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("parentPhone")}>
                    Parent Phone {sortConfig.key === "parentPhone" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("parentEmail")}>
                    Parent Email {sortConfig.key === "parentEmail" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
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
                          value={s.name}
                          onChange={(e) =>
                            setStudents((prev) =>
                              prev.map((x) => (x._id === s._id ? { ...x, name: e.target.value } : x))
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="styled-input"
                          value={s.email}
                          onChange={(e) =>
                            setStudents((prev) =>
                              prev.map((x) => (x._id === s._id ? { ...x, email: e.target.value } : x))
                            )
                          }
                        />
                      </td>
                      <td>
                        <PhoneInput
                          country={"eg"}
                          value={s.studentPhone || ""}
                          onChange={(phone) =>
                            setStudents((prev) =>
                              prev.map((x) =>
                                x._id === s._id ? { ...x, studentPhone: phone } : x
                              )
                            )
                          }
                          inputStyle={{ width: "100%" }}
                          enableSearch={true}
                          countryCodeEditable={false}
                        />
                      </td>
                      <td>
                        <input
                          className="styled-input"
                          value={s.parentName || ""}
                          onChange={(e) =>
                            setStudents((prev) =>
                              prev.map((x) =>
                                x._id === s._id ? { ...x, parentName: e.target.value } : x
                              )
                            )
                          }
                        />
                      </td>
                      <td>
                        <PhoneInput
                          country={"eg"}
                          value={s.parentPhone || ""}
                          onChange={(phone) =>
                            setStudents((prev) =>
                              prev.map((x) =>
                                x._id === s._id ? { ...x, parentPhone: phone } : x
                              )
                            )
                          }
                          inputStyle={{ width: "100%" }}
                          enableSearch={true}
                          countryCodeEditable={false}
                        />
                      </td>
                      <td>
                        <input
                          className="styled-input"
                          value={s.parentId?.email || ""}
                          onChange={(e) =>
                            setStudents((prev) =>
                              prev.map((x) =>
                                x._id === s._id
                                  ? { ...x, parentId: { ...x.parentId, email: e.target.value } }
                                  : x
                              )
                            )
                          }
                        />
                      </td>
                      <td>
                        <button className="btn btn-green" onClick={() => handleUpdate(s)}>
                          💾 Save
                        </button>
                        <button className="btn btn-red" onClick={() => setEditing(null)}>
                          Cancel
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
                      <td>
                    <div className="action-buttons">
                        <button className="btn btn-blue" onClick={() => setEditing(s._id)}>
                        ✏️ Edit
                        </button>
                        <button className="btn btn-red" onClick={() => handleDelete(s._id)}>
                        🗑️ Delete
                        </button>
                    </div>
                    </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Unassigned Students */}
        {unassigned.length > 0 && (
          <div className="section-card">
            <h3 className="card-title">⚠️ Unassigned Students</h3>
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
                        <div className="action-buttons">
                            <button className="btn btn-red" onClick={() => handleDelete(s._id)}>
                            🗑️ Delete
                            </button>
                        </div>
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
