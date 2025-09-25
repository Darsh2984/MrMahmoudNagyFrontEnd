import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";
import TeacherSidebar from "../../components/TeacherSidebar"; // ✅ import new sidebar

function TeacherTasks() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [gradeOutOf, setGradeOutOf] = useState("");

  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const [expandedTask, setExpandedTask] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null); 
  const [submissions, setSubmissions] = useState({});
  const [groupStudents, setGroupStudents] = useState([]);

  const [grades, setGrades] = useState({});
  const [comments, setComments] = useState({});
  const [correctedFiles, setCorrectedFiles] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) fetchYears(user.id);
  }, [user?.id]);

// ✅ Convert datetime-local string to UTC ISO string correctly
function toUTCString(localDateTime) {
  if (!localDateTime) return null;

  const [datePart, timePart] = localDateTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // This builds a date in LOCAL time (Cairo = UTC+2/+3)
  const localDate = new Date(year, month - 1, day, hour, minute);

  // Convert to UTC ISO string
  return localDate.toISOString();
}

// Convert UTC from DB → datetime-local string (local)
function toLocalInputValue(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);

  // Pad values for datetime-local format
  const pad = (n) => n.toString().padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

  
  // 🔹 Fetch years + groups
  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/year/${teacherId}`
      );
      setYears(res.data);
    } catch {
      toast.error("❌ Failed to fetch years");
    }
  };

  // 🔹 Fetch tasks for a group and merge with current tasks
    const fetchTasks = async (groupId) => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/tasks/group/${groupId}`
        );

        setTasks((prev) => {
          // merge old + new tasks
          const merged = [...prev, ...res.data];

          // remove duplicates by task _id
          const unique = Array.from(new Map(merged.map(t => [t._id, t])).values());
          return unique;
        });

        // ✅ fetch group students for submissions display
        const year = years.find((y) => y.groups.some((g) => g._id === groupId));
        const group = year?.groups.find((g) => g._id === groupId);
        setGroupStudents((prev) => {
          const merged = [...prev, ...(group?.students || [])];
          const unique = Array.from(new Map(merged.map(s => [s._id, s])).values());
          return unique;
        });
      } catch {
        toast.error("❌ Failed to fetch tasks");
      }
    };

  const updateTask = async () => {
  if (!editingTask) return;
  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/api/tasks/task/${editingTask._id}`,
      editingTask,
    );
    toast.success("✅ Task updated");

    setTasks((prev) =>
      prev.map((t) => (t._id === editingTask._id ? editingTask : t))
    );
    setEditingTask(null);
  } catch {
    toast.error("❌ Failed to update task");
  }
};

const deleteTask = async (taskId) => {
  if (!window.confirm("⚠️ Are you sure you want to delete this task?")) return;
  try {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/tasks/task/${taskId}`
    );
    toast.success("✅ Task deleted");
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  } catch {
    toast.error("❌ Failed to delete task");
  }
};


  // 🔹 Fetch submissions
  const fetchSubmissions = async (taskId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/tasks/submission/${taskId}`
      );
      setSubmissions((prev) => ({ ...prev, [taskId]: res.data }));
    } catch {
      toast.error("❌ Failed to fetch submissions");
    }
  };

  // 🔹 Create task (multi-group)
const createTask = async () => {
  if (!selectedYear || !selectedGroups.length || !title || !deadline || !gradeOutOf) {
    toast.warn("⚠️ Please fill all fields");
    return;
  }
  try {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/task`, {
      title,
      description,
      teacherId: user.id,
      yearId: selectedYear,
      groups: selectedGroups, // ✅ multiple groups
      deadline: toUTCString(deadline), // send as UTC
      gradeOutOf,
    });
    toast.success("✅ Task created");
    setTitle("");
    setDescription("");
    setDeadline("");
    setGradeOutOf("");
    setSelectedGroups([]);

    // ✅ Refresh tasks for all groups
    let allTasks = [];
    for (const gId of selectedGroups) {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/tasks/group/${gId}`
      );
      allTasks = [...allTasks, ...res.data];
    }
    setTasks(allTasks);
  } catch {
    toast.error("❌ Failed to create task");
  }
};


  // 🔹 Grade submission
  const gradeSubmission = async (submissionId) => {
    const formData = new FormData();
    formData.append("grade", grades[submissionId] || "");
    formData.append("comments", comments[submissionId] || "");
    if (correctedFiles[submissionId]) {
      formData.append("file", correctedFiles[submissionId]);
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/tasks/submission/${submissionId}/grade`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("✅ Submission graded");
      if (expandedTask) fetchSubmissions(expandedTask);
    } catch {
      toast.error("❌ Failed to grade submission");
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
       {/* ✅ Sidebar extracted */}
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* === Main Content === */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📘 Teacher Tasks</h2>

          {/* Year Selection */}
          <label className="form-label">Select Year</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedGroups([]);
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

          {/* Group Selection (checkbox grid) */}
          {selectedYear && (
  <div>
    <label className="form-label">Assign to Groups</label>
    <div className="checkbox-grid">
      {years.find((y) => y._id === selectedYear)?.groups?.map((g) => (
        <label
          key={g._id}
          className={`checkbox-card ${
            selectedGroups.includes(g._id) ? "selected" : ""
          }`}
        >
          <input
            type="checkbox"
            value={g._id}
            checked={selectedGroups.includes(g._id)}
            onChange={async (e) => {
              if (e.target.checked) {
                setSelectedGroups([...selectedGroups, g._id]);
                fetchTasks(g._id); // ✅ load tasks for this group
              } else {
                const newGroups = selectedGroups.filter((id) => id !== g._id);
                setSelectedGroups(newGroups);

                if (newGroups.length === 0) {
                  setTasks([]); // no groups → clear tasks
                  setGroupStudents([]);
                } else {
                  // refetch all remaining groups to rebuild task list
                  let allTasks = [];
                  let allStudents = [];
                  for (const id of newGroups) {
                    const res = await axios.get(
                      `${process.env.REACT_APP_API_URL}/api/tasks/group/${id}`
                    );
                    allTasks = [...allTasks, ...res.data];

                    const year = years.find((y) => y.groups.some((g) => g._id === id));
                    const group = year?.groups.find((g) => g._id === id);
                    allStudents = [...allStudents, ...(group?.students || [])];
                  }

                  // remove duplicates
                  setTasks(Array.from(new Map(allTasks.map(t => [t._id, t])).values()));
                  setGroupStudents(Array.from(new Map(allStudents.map(s => [s._id, s])).values()));
                }
              }
            }}
          />
          {g.name}
        </label>
      ))}
    </div>

    {/* 🔹 Export Homework & Tasks Report button */}
    {selectedGroups.length > 0 && (
      <div style={{ marginTop: "15px" }}>
        <button
          className="btn btn-purple"
          onClick={() => {
            if (selectedGroups.length === 0) {
              toast.error("❌ Please select a group");
              return;
            }

            const groupId = selectedGroups[0];
            window.open(
              `${process.env.REACT_APP_API_URL}/api/tasks/export-homework-report/${groupId}`,
              "_blank"
            );
          }}
        >
          📊 Export Homework & Tasks Report
        </button>
      </div>
    )}
  </div>
)}

        </div>

        {/* Create Task */}
        {selectedGroups.length > 0 && (
          <div className="section-card">
            <h3 className="card-title">Create Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="styled-input"
            />
            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="styled-input"
              rows="3"
            />
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="styled-input"
            />
            <input
              type="number"
              placeholder="Grade Out Of"
              value={gradeOutOf}
              onChange={(e) => setGradeOutOf(e.target.value)}
              className="styled-input"
            />
            <button onClick={createTask} className="btn btn-blue">
              Create Task
            </button>
          </div>
        )}

        {editingTask && (
        <div className="section-card">
          <h3 className="card-title">✏️ Edit Task</h3>
          <input
            type="text"
            value={editingTask.title}
            onChange={(e) =>
              setEditingTask({ ...editingTask, title: e.target.value })
            }
            className="styled-input"
          />
          <textarea
            value={editingTask.description}
            onChange={(e) =>
              setEditingTask({ ...editingTask, description: e.target.value })
            }
            className="styled-input"
          />
          <input
              type="datetime-local"
              value={editingTask.deadline ? toLocalInputValue(editingTask.deadline) : ""}
              onChange={(e) =>
                setEditingTask({ ...editingTask, deadline: e.target.value })
              }
              className="styled-input"
            />
          <input
            type="number"
            value={editingTask.gradeOutOf}
            onChange={(e) =>
              setEditingTask({ ...editingTask, gradeOutOf: e.target.value })
            }
            className="styled-input"
          />
          <button onClick={updateTask} className="btn btn-green">💾 Save</button>
          <button onClick={() => setEditingTask(null)} className="btn btn-red">Cancel</button>
        </div>
      )}



        {/* Tasks List */}
        {tasks.length > 0 && (
        <div className="section-card">
          <h3 className="card-title">📋 Task List</h3> <br />
          <ul className="task-list" style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((t) => (
              <li key={t._id} className="task-card">
                <div className="task-header">
                  <div>
                    <h4>{t.title}</h4>
                    <p>{t.description}</p>
                    <small>
                      Due:{" "}
                      {new Date(t.deadline).toLocaleString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </small>
                  </div>
                  <button
                    onClick={() => {
                      if (expandedTask === t._id) {
                        setExpandedTask(null);
                        setExpandedStudent(null); // ✅ reset student view
                      } else {
                        setExpandedTask(t._id);
                        setExpandedStudent(null); // ✅ reset student view
                        fetchSubmissions(t._id);
                      }
                    }}
                    className={`btn ${expandedTask === t._id ? "btn-purple" : "btn-green"}`}
                  >
                    {expandedTask === t._id ? "Close" : "View Submissions"}
                  </button>
                </div>
                <div className="task-actions">
                  <button
                    className="btn btn-blue"
                    onClick={() => setEditingTask(t)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-red"
                    onClick={() => deleteTask(t._id)}
                  >
                    🗑 Delete
                  </button>
                </div>


                {/* Submissions */}
                {expandedTask === t._id && (
                  <div className="submissions">
                    <h4 style={{ marginBottom: "10px", color: "#0b3c49" }}>📥 Submissions</h4>

                    <div className="submission-table">
                      <div className="submission-header">
                        <span>Name</span>
                        <span>Email</span>
                        <span>Status</span>
                        <span>Actions</span>
                      </div>

                      {groupStudents.map((s) => {
                        const sub = submissions[t._id]?.find(
                          (sub) => sub.studentId?._id === s._id
                        );

                        return (
                          <div key={s._id} className="submission-row">
                            <span>{s.name}</span>
                            <span>{s.email}</span>
                            <span
                              style={{
                                color: sub ? "#8baa91" : "#c85d47",
                                fontWeight: "bold",
                              }}
                            >
                              {sub ? "Submitted" : "Not Submitted"}
                            </span>
                            <span>
                              {sub && (
                                <button
                                  className="btn btn-purple"
                                  onClick={() =>
                                    setExpandedStudent(
                                      expandedStudent === s._id ? null : s._id
                                    )
                                  }
                                >
                                  {expandedStudent === s._id ? "Hide" : "View"}
                                </button>
                              )}
                            </span>

                            {/* Expanded grading row */}
                            {sub && expandedStudent === s._id && (
                              <div className="grading-box">
                                <p>
                                  📄{" "}
                                  <a
                                    href={sub.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View Submitted File
                                  </a>
                                </p>

                                {sub.grade !== undefined ? (
                                  <div className="graded-info">
                                    <p>
                                      <b>Grade:</b> {sub.grade} / {t.gradeOutOf}
                                    </p>
                                    {sub.comments && <p>{sub.comments}</p>}
                                    {sub.correctedFileUrl && (
                                      <p>
                                        📄{" "}
                                        <a
                                          href={sub.correctedFileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Download Corrected File
                                        </a>
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="grading-form">
                                    <input
                                      type="number"
                                      placeholder={`Grade /${t.gradeOutOf}`}
                                      value={grades[sub._id] || ""}
                                      onChange={(e) =>
                                        setGrades({ ...grades, [sub._id]: e.target.value })
                                      }
                                      className="styled-input"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Comments"
                                      value={comments[sub._id] || ""}
                                      onChange={(e) =>
                                        setComments({ ...comments, [sub._id]: e.target.value })
                                      }
                                      className="styled-input"
                                    />
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      onChange={(e) =>
                                        setCorrectedFiles({
                                          ...correctedFiles,
                                          [sub._id]: e.target.files[0],
                                        })
                                      }
                                      className="styled-input"
                                    />
                                    <button
                                      onClick={() => gradeSubmission(sub._id)}
                                      className="btn btn-green"
                                    >
                                      Submit Grade
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      </main>
    </div>
  );
}

export default TeacherTasks;
