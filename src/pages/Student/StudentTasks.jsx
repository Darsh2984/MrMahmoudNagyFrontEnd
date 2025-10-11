import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import {
  ClipboardText,
  UploadSimple,
  FilePdf,
  Trash,
  CheckCircle,
  XCircle,
  Clock,
} from "phosphor-react";
import "react-toastify/dist/ReactToastify.css";
import "./StudentTasks.css";

function StudentTasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [uploading, setUploading] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // === Fetch all tasks ===
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

  // === Fetch submission for each task ===
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

  // === Upload a PDF ===
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

  // === Delete submission ===
  const deleteSubmission = async (submissionId, task) => {
    if (new Date(task.deadline) <= new Date()) {
      return toast.error("⏰ Deadline passed. You cannot delete this submission.");
    }
    if (submissions[task._id]?.grade !== undefined) {
      return toast.error("❌ Already graded. Cannot delete.");
    }
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/tasks/submission/${submissionId}`);
      toast.success("🗑️ Submission deleted. You can re-upload before deadline.");
      fetchSubmission(task._id);
    } catch {
      toast.error("❌ Failed to delete submission");
    }
  };

  const formatDeadline = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="student-layout">
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`student-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <header className="dashboard-header">
          <h2>My Tasks</h2>
          <p>Submit, track, and review your homework tasks</p>
        </header>

        <section className="section-card">
          {tasks.length === 0 ? (
            <p>No tasks assigned to your group yet.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((t) => {
                const submission = submissions[t._id];
                const pastDeadline = new Date(t.deadline) <= new Date();
                return (
                  <li key={t._id} className="task-card">
                    <div className="task-top">
                      <div className="task-icon">
                        <ClipboardText size={24} color="#0b3c49" />
                      </div>
                      <div className="task-info">
                        <h3>{t.title}</h3>
                        <p className="task-desc">{t.description}</p>
                        <p className="deadline">
                          <Clock size={18} /> <b>Deadline:</b> {formatDeadline(t.deadline)}
                        </p>
                      </div>
                    </div>

                    <div className="task-content">
                      {submission ? (
                        <div className="submission-box">
                          <p className="submitted">
                            <CheckCircle size={18} color="green" /> Submitted —{" "}
                            <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                              <FilePdf size={16} /> View File
                            </a>
                          </p>

                          {submission.grade !== undefined && (
                            <div className="graded-box">
                              <p>
                                <b>Grade:</b> {submission.grade} / {t.gradeOutOf}
                              </p>
                              {submission.comments && (
                                <p>
                                  <b>Teacher’s comments:</b> {submission.comments}
                                </p>
                              )}
                              {submission.correctedFileUrl && (
                                <p>
                                  <a
                                    href={submission.correctedFileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <FilePdf size={16} /> Download Corrected File
                                  </a>
                                </p>
                              )}
                            </div>
                          )}

                          {!pastDeadline && submission.grade === undefined && (
                            <button
                              className="btn btn-red"
                              onClick={() => deleteSubmission(submission._id, t)}
                            >
                              <Trash size={16} /> Cancel Submission
                            </button>
                          )}
                        </div>
                      ) : pastDeadline ? (
                        <p className="not-submitted">
                          <XCircle size={18} color="gray" /> Deadline passed. Cannot submit.
                        </p>
                      ) : (
                        <div className="upload-area">
                          <label className="upload-label">
                            <UploadSimple size={18} /> Upload PDF
                          </label>
                          <input
                            type="file"
                            accept="application/pdf"
                            className="styled-input"
                            onChange={(e) => uploadSubmission(t._id, e.target.files[0])}
                          />
                          {uploading[t._id] && <p>⏳ Uploading...</p>}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default StudentTasks;
