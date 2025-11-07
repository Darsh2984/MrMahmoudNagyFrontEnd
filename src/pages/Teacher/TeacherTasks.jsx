// ================= TeacherTasks.js =================
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "../../components/TeacherSidebar";
import "./TeacherTasks.css";

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
  const [editDeadline, setEditDeadline] = useState("");


  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // ----------------- TIMEZONE HELPERS -----------------
  function localToUTC(localString) {
    if (!localString) return null;
    return new Date(localString).toISOString();
  }

  // Convert UTC ISO from DB -> local string for input display
  function utcToLocalInput(utcString) {
    if (!utcString) return "";
    const utcDate = new Date(utcString);
    // convert to local ISO (e.g., 2025-10-29T18:00)
    const local = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(
      local.getHours()
    )}:${pad(local.getMinutes())}`;
  }

  // ----------------- LOAD DATA -----------------
  useEffect(() => {
    if (user?.id) fetchYears(user.id);
  }, [user?.id]);

  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch {
      toast.error("❌ Failed to fetch years");
    }
  };

  const fetchTasks = async (groupId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/group/${groupId}`);
      setTasks((prev) => {
        const merged = [...prev, ...res.data];
        return Array.from(new Map(merged.map((t) => [t._id, t])).values());
      });

      const year = years.find((y) => y.groups.some((g) => g._id === groupId));
      const group = year?.groups.find((g) => g._id === groupId);
      setGroupStudents((prev) => {
        const merged = [...prev, ...(group?.students || [])];
        return Array.from(new Map(merged.map((s) => [s._id, s])).values());
      });
    } catch {
      toast.error("❌ Failed to fetch tasks");
    }
  };

  // ----------------- CREATE TASK -----------------
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
        groups: selectedGroups,
        deadline: localToUTC(deadline),
        gradeOutOf,
      });

      toast.success("✅ Task created");
      setTitle("");
      setDescription("");
      setDeadline("");
      setGradeOutOf("");
      setSelectedGroups([]);

      // refresh
      let allTasks = [];
      for (const gId of selectedGroups) {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/group/${gId}`);
        allTasks = [...allTasks, ...res.data];
      }
      setTasks(allTasks);
    } catch (err) {
      console.error("❌ Create Task Error:", err);
      toast.error("❌ Failed to create task");
    }
  };

  // ----------------- UPDATE TASK -----------------
  const updateTask = async () => {
    if (!editingTask) return;
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/tasks/task/${editingTask._id}`,
        {
          ...editingTask,
          // convert local input → UTC string only now
          deadline: localToUTC(editDeadline),
        }
      );

      toast.success("✅ Task updated");
      setTasks((prev) =>
        prev.map((t) =>
          t._id === editingTask._id
            ? { ...editingTask, deadline: localToUTC(editDeadline) }
            : t
        )
      );
      setEditingTask(null);
    } catch (err) {
      console.error("❌ Update Task Error:", err);
      toast.error("❌ Failed to update task");
    }
  };


  // ----------------- DELETE TASK -----------------
  const deleteTask = async (taskId) => {
    if (!window.confirm("⚠️ Delete this task?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/task/${taskId}`);
      toast.success("✅ Task deleted");
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch {
      toast.error("❌ Failed to delete task");
    }
  };

  // ----------------- SUBMISSIONS -----------------
  const fetchSubmissions = async (taskId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/submission/${taskId}`);
      setSubmissions((prev) => ({ ...prev, [taskId]: res.data }));
    } catch {
      toast.error("❌ Failed to fetch submissions");
    }
  };

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

  const markAsSubmitted = async (taskId, studentId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/submission/manual`, {
        taskId,
        studentId,
        teacherId: user.id,
      });
      toast.success("✅ Student marked as submitted");
      fetchSubmissions(taskId);
    } catch (err) {
      toast.error(err.response?.data?.msg || "❌ Failed to mark as submitted");
    }
  };

  // ----------------- UI -----------------
  return (
    <div className="page-layout">
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`teachertasks-container ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
        <div className="section-card">
          <h2 className="page-title">📘 Teacher Tasks</h2>

          {/* === Year Selector === */}
          <label className="field-label">Select Year</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedGroups([]);
              setTasks([]);
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

          {/* === Group Selection === */}
          {selectedYear && (
            <div className="checkbox-grid">
              {years.find((y) => y._id === selectedYear)?.groups?.map((g) => (
                <label
                  key={g._id}
                  className={`checkbox-card ${selectedGroups.includes(g._id) ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(g._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGroups([...selectedGroups, g._id]);
                        fetchTasks(g._id);
                      } else {
                        setSelectedGroups(selectedGroups.filter((id) => id !== g._id));
                        setTasks(tasks.filter((t) => t.groupId !== g._id));
                      }
                    }}
                  />
                  {g.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* === Create Task === */}
        {selectedGroups.length > 0 && (
          <div className="section-card">
            <h3 className="card-title">🆕 Create Task</h3>
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

        {/* === Edit Task === */}
        {editingTask && (
          <div className="section-card">
            <h3 className="card-title">✏️ Edit Task</h3>
            <input
              type="text"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="styled-input"
            />
            <textarea
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="styled-input"
            />
            <input
              type="datetime-local"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              className="styled-input"
            />
            <input
              type="number"
              value={editingTask.gradeOutOf}
              onChange={(e) => setEditingTask({ ...editingTask, gradeOutOf: e.target.value })}
              className="styled-input"
            />
            <div className="edit-actions">
              <button onClick={updateTask} className="btn btn-green">
                💾 Save
              </button>
              <button onClick={() => setEditingTask(null)} className="btn btn-red">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* === Task List === */}
        {tasks.length > 0 && (
          <div className="section-card">
            <h3 className="card-title">📋 Task List</h3>
            <ul className="task-list">
              {tasks.map((t) => (
                <li key={t._id} className="task-card">
                  <div className="task-header">
                    <div>
                      <h4>{t.title}</h4>
                      <p>{t.description}</p>
                      <small>
                        Due:{" "}
                        {new Date(t.deadline).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </small>
                    </div>
                    <div className="task-buttons">
                      <button className="btn btn-blue" onClick={() => {
                        setEditingTask(t);
                        setEditDeadline(utcToLocalInput(t.deadline)); // show local version
                      }}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-red" onClick={() => deleteTask(t._id)}>
                        🗑 Delete
                      </button>
                      <button
                        className={`btn ${expandedTask === t._id ? "btn-purple" : "btn-green"}`}
                        onClick={() => {
                          if (expandedTask === t._id) {
                            setExpandedTask(null);
                          } else {
                            setExpandedTask(t._id);
                            fetchSubmissions(t._id);
                          }
                        }}
                      >
                        {expandedTask === t._id ? "Close" : "View Submissions"}
                      </button>
                    </div>
                  </div>

                  {/* Submissions */}
                  {expandedTask === t._id && (
                    <div className="submissions">
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
                          const statusText = sub ? "Submitted" : "Not Submitted";

                          return (
                            <div key={s._id} className="submission-row">
                              <span>{s.name}</span>
                              <span>{s.email}</span>
                              <span className={sub ? "present" : "absent"}>{statusText}</span>
                              <span>
                                {statusText === "Not Submitted" ? (
                                  <button
                                    className="btn btn-yellow small-btn"
                                    onClick={() => markAsSubmitted(t._id, s._id)}
                                  >
                                    Mark as Submitted
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-purple small-btn"
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

                              {/* Grading */}
                              {sub && expandedStudent === s._id && (
                                <div className="grading-box">
                                  <p>
                                    📄{" "}
                                    {sub.fileUrl ? (
                                      <a href={sub.fileUrl} target="_blank" rel="noreferrer">
                                        View Submitted File
                                      </a>
                                    ) : (
                                      <em>No file uploaded (manually marked)</em>
                                    )}
                                  </p>

                                  {sub.grade !== undefined && sub.grade !== null ? (
                                    <p>
                                      Grade: {sub.grade}/{t.gradeOutOf}
                                    </p>
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
