import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../styles/AppStyles.css";
import StudentSidebar from "../../components/StudentSidebar"; // import new sidebar


function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [uploading, setUploading] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!user?.groupId) {
          toast.error("❌ You are not assigned to a group");
          return;
        }
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/tasks/group/${user.groupId}`
        );
        setTasks(res.data);
        res.data.forEach((task) => fetchSubmission(task._id));
      } catch (err) {
        console.error("❌ Error fetching tasks:", err);
        toast.error("❌ Failed to fetch tasks");
      }
    };
    fetchTasks();
  }, [user?.groupId]);

  // Fetch student submission for a task
  const fetchSubmission = async (taskId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/tasks/submission/${taskId}`
      );
      const mySubmission = res.data.find((s) => s.studentId?._id === user.id);
      setSubmissions((prev) => ({ ...prev, [taskId]: mySubmission || null }));
    } catch (err) {
      console.error("❌ Error fetching submission:", err);
    }
  };

  // Upload PDF
  const uploadSubmission = async (taskId, file) => {
    if (!file) return toast.warn("⚠️ Please select a PDF");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId);
    formData.append("studentId", user.id);

    try {
      setUploading((prev) => ({ ...prev, [taskId]: true }));
      await axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/submission`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Submission uploaded");
      fetchSubmission(taskId);
    } catch (err) {
      console.error("❌ Error uploading submission:", err);
      toast.error("❌ Upload failed");
    } finally {
      setUploading((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <div className={`layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main */}
      <main className="page-container">
        <div className="section-card">
          <h2 className="card-title">📋 My Tasks</h2> <br />

          {tasks.length === 0 ? (
            <p>No tasks assigned to your group yet.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((t) => {
                const submitted = submissions[t._id];
                return (
                  <li key={t._id} className="task-card" style={{ padding: "18px", marginBottom: "20px" }}>
                    <h3 style={{ marginBottom: "8px", color: "#2c3e50" }}>{t.title}</h3>
                    <p className="task-desc" style={{ marginBottom: "8px" }}>{t.description}</p>
                    <p style={{ marginBottom: "12px" }}>
                      <b>Deadline:</b> {new Date(t.deadline).toLocaleDateString()}
                    </p>

                    {/* Submission Status */}
                    {submitted ? (
                      <div className="submission-status" style={{ marginTop: "10px", lineHeight: "1.6" }}>
                        <p style={{ color: "green", marginBottom: "10px" }}>
                          ✅ Submitted (
                          <a
                            href={submitted.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                          >
                            📄 View File
                          </a>
                          )
                        </p>
                        {submitted.grade !== undefined && (
                          <div className="graded-info" style={{ padding: "10px", background: "#eef6f9", borderRadius: "6px" }}>
                            <p><b>Grade:</b> {submitted.grade} / {t.gradeOutOf}</p>
                            {submitted.comments && <p><b>Teacher’s comments:</b> {submitted.comments}</p>}
                            {submitted.correctedFileUrl && (
                              <p>
                                <a
                                  href={submitted.correctedFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="link"
                                >
                                  📄 Download Corrected File
                                </a>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: "red", marginBottom: "10px" }}>❌ Not Submitted</p>
                    )}

                    {/* Upload Form */}
                    {!submitted && (
                      <div className="upload-box" style={{ marginTop: "12px" }}>
                        <input
                          type="file"
                          accept="application/pdf"
                          className="styled-input"
                          onChange={(e) => uploadSubmission(t._id, e.target.files[0])}
                        />
                        {uploading[t._id] && <p style={{ marginTop: "6px", color: "#555" }}>⏳ Uploading...</p>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentTasks;
