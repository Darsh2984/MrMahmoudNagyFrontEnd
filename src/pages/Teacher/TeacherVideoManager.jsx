import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TeacherSidebar from "../../components/TeacherSidebar";
import {
  VideoCamera,
  UploadSimple,
  Trash,
  FilmStrip,
  FilmSlate,
  FileArrowUp,
} from "phosphor-react";
import "./TeacherVideoManager.css";

export default function TeacherVideoManager() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({
    title: "",
    yearId: "",
    unitId: "",
    chapterId: "",
    video: null,
    videoUrl: "",
  });
  const [uploadType, setUploadType] = useState("file");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [existingStops, setExistingStops] = useState([]); // existing stops from DB
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");
  const [stops, setStops] = useState([
  { timeInSeconds: "", selectedQuestionIds: [] },
]);
  const [checkpoint, setCheckpoint] = useState({
    timeInSeconds: "",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
      },
    ],
  });
  const [availableQuestions, setAvailableQuestions] = useState([]); // fetched from DB
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "teacher") {
      setTeacherId(user.id);
      fetchYears(user.id);
    }
  }, []);

  const fetchYears = async (teacherId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/year/${teacherId}`);
      setYears(res.data);
    } catch {
      toast.error("❌ Failed to load years");
    }
  };

  const fetchUnits = async (teacherId, yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/unit/${teacherId}/${yearId}`);
      setUnits(res.data);
    } catch {
      toast.error("❌ Failed to load units");
    }
  };

  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`);
      setChapters(res.data);
    } catch {
      toast.error("❌ Failed to load chapters");
    }
  };

  const fetchVideos = async (yearId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/video/year/${yearId}`);
      setVideos(res.data);
    } catch {
      toast.error("❌ Failed to load videos");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "video") setForm({ ...form, video: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.yearId || !form.unitId || !form.chapterId) {
      toast.warning("⚠️ All fields are required");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      if (uploadType === "url") {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/video/url`, {
          title: form.title,
          videoUrl: form.videoUrl,
          yearId: form.yearId,
          unitId: form.unitId,
          chapterId: form.chapterId,
          teacherId,
        });
      } else {
        if (!form.video) {
          toast.warning("⚠️ Please select a video file");
          setLoading(false);
          return;
        }

        const uploadId = Date.now().toString();
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("yearId", form.yearId);
        fd.append("unitId", form.unitId);
        fd.append("chapterId", form.chapterId);
        fd.append("teacherId", teacherId);
        fd.append("video", form.video);
        fd.append("uploadId", uploadId);

        const evtSource = new EventSource(
          `${process.env.REACT_APP_API_URL}/api/video/progress/${uploadId}`
        );
        evtSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setUploadProgress(data.progress);
          if (data.progress >= 100) evtSource.close();
        };

        await axios.post(`${process.env.REACT_APP_API_URL}/api/video`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("✅ Video uploaded successfully!");
      setForm({
        title: "",
        yearId: "",
        unitId: "",
        chapterId: "",
        video: null,
        videoUrl: "",
      });
      setUnits([]);
      setChapters([]);
      fetchVideos(form.yearId);
    } catch {
      toast.error("❌ Failed to upload video");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 3000);
    }
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>🗑 Are you sure you want to delete this video?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            className="video-toast-btn-confirm"
            onClick={async () => {
              try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/video/${id}`);
                toast.dismiss();
                fetchVideos(form.yearId);
                toast.success("✅ Video deleted successfully");
              } catch {
                toast.dismiss();
                toast.error("❌ Failed to delete video");
              }
            }}
          >
            Confirm
          </button>
          <button className="video-toast-btn-cancel" onClick={() => toast.dismiss()}>
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, position: "top-center" }
    );
  };

  const openCheckpointModal = async (videoId, title) => {
  const video = videos.find((v) => v._id === videoId);
  setSelectedVideoId(videoId);
  setSelectedVideoTitle(title);
  setCheckpoint({ timeInSeconds: "" });
  setSelectedQuestionIds([]);
  setExistingStops([]);

  try {
    // 🟢 Load QUIZ-STOP questions (new source)
    if (video.unitId?._id && video.yearId?._id) {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/quizstop/questions/unit/${video.unitId._id}/${video.yearId._id}`
      );

      setAvailableQuestions(res.data || []);
    } else {
      setAvailableQuestions([]);
      toast.warning("⚠️ Missing unit/year information for this video.");
    }

    // 🟢 Load existing video stops (same as before)
    const stopsRes = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/videocheckpoint/${videoId}`
    );
    setExistingStops(stopsRes.data || []);
  } catch (err) {
    console.error("❌ Error loading data:", err);
    toast.error("Failed to load quiz stops or quiz-stop questions");
  }

  setShowCheckpointModal(true);
};





  const addQuestion = () => {
    setCheckpoint({
      ...checkpoint,
      questions: [
        ...checkpoint.questions,
        { question: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
      ],
    });
  };

  const removeQuestion = (index) => {
    const updated = [...checkpoint.questions];
    updated.splice(index, 1);
    setCheckpoint({ ...checkpoint, questions: updated });
  };

  const saveCheckpoint = async () => {
    if (!checkpoint.timeInSeconds || selectedQuestionIds.length === 0) {
      toast.warning("⚠️ Please select at least one question and a time");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/videocheckpoint`, {
        videoId: selectedVideoId,
        timeInSeconds: checkpoint.timeInSeconds,
        questionIds: selectedQuestionIds, // <-- updated
      });
      toast.success("✅ Quiz Stop saved successfully!");
      setShowCheckpointModal(false);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save quiz stop");
    }
  };


  

  return (
    <div className={`video-layout ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="video-container">
        {/* Upload Section */}
        <div className="video-section-card">
          <h2 className="video-title">
            <VideoCamera size={22} color="#0b3c49" weight="fill" /> Manage Course Videos
          </h2>

          <form onSubmit={handleUpload} className="video-form-grid">
            <input
              type="text"
              name="title"
              placeholder="Video Title"
              value={form.title}
              onChange={handleChange}
              className="video-input"
            />

            <select
              name="yearId"
              value={form.yearId}
              onChange={(e) => {
                const yearId = e.target.value;
                setForm({ ...form, yearId, unitId: "", chapterId: "" });
                setUnits([]);
                setChapters([]);
                if (yearId) {
                  fetchVideos(yearId);
                  fetchUnits(teacherId, yearId);
                }
              }}
              className="video-input"
            >
              <option value="">-- Select Year --</option>
              {years.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name}
                </option>
              ))}
            </select>

            <select
              name="unitId"
              value={form.unitId}
              onChange={(e) => {
                const unitId = e.target.value;
                setForm({ ...form, unitId, chapterId: "" });
                setChapters([]);
                if (unitId) fetchChapters(unitId);
              }}
              className="video-input"
              disabled={!form.yearId}
            >
              <option value="">-- Select Unit --</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              name="chapterId"
              value={form.chapterId}
              onChange={handleChange}
              className="video-input"
              disabled={!form.unitId}
            >
              <option value="">-- Select Chapter --</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="video-toggle">
              <label>
                <input
                  type="radio"
                  value="file"
                  checked={uploadType === "file"}
                  onChange={() => setUploadType("file")}
                />{" "}
                Upload File
              </label>
              <label>
                <input
                  type="radio"
                  value="url"
                  checked={uploadType === "url"}
                  onChange={() => setUploadType("url")}
                />{" "}
                Use URL
              </label>
            </div>

            {uploadType === "file" ? (
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleChange}
                className="video-input"
              />
            ) : (
              <input
                type="text"
                name="videoUrl"
                placeholder="Paste Bunny CDN Video URL"
                value={form.videoUrl}
                onChange={handleChange}
                className="video-input"
              />
            )}

            <button type="submit" disabled={loading} className="video-btn video-btn-blue">
              {loading ? "Uploading..." : <><UploadSimple size={18} /> Save Video</>}
            </button>
          </form>

          {loading && uploadType === "file" && (
            <div className="video-progress">
              <p>Uploading... {uploadProgress}%</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Video List */}
        <div className="video-section-card">
          <h2 className="video-title">
            <FilmStrip size={22} weight="fill" color="#8baa91" /> Uploaded Videos
          </h2>

          {videos.length === 0 ? (
            <p className="video-empty">No videos uploaded yet.</p>
          ) : (
            <div className="video-grid">
              {videos.map((v) => (
                <div key={v._id} className="video-card">
                  <h4>{v.title}</h4>
                  <p>
                    <b>Unit:</b> {v.unitId?.name} <br />
                    <b>Chapter:</b> {v.chapterId?.name}
                  </p>

                  <video
                    src={v.videoUrl}
                    controls
                    controlsList="nodownload"
                    disablePictureInPicture
                    style={{ width: "100%", borderRadius: "6px" }}
                  />

                  {/* --- Actions --- */}
                  <div className="video-actions">
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="video-btn video-btn-red"
                    >
                      <Trash size={16} /> Delete
                    </button>

                    <button
                      onClick={() => openCheckpointModal(v._id, v.title)}
                      className="video-btn video-btn-green"
                    >
                      <FilmSlate size={16} /> Add Quiz Stops
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- Checkpoint Modal --- */}
          {showCheckpointModal && (
          <div className="checkpoint-overlay">
            <div className="checkpoint-modal">
              <h3>
                🎯 Add Quiz Stops for{" "}
                <span style={{ color: "#0b3c49" }}>{selectedVideoTitle}</span>
              </h3>
              {/* 🟣 EXISTING STOPS LIST */}
              {existingStops.length > 0 && (
                <div className="existing-stops-list">
                  <h4>📋 Existing Quiz Stops</h4>
                  {existingStops.map((cp) => (
                    <div key={cp._id} className="existing-stop-item">
                      <p>
                        <b>Time:</b> {cp.timeInSeconds}s
                      </p>
                      <div className="existing-stop-questions">
                        {cp.questions.map((q, i) => (
                          <div key={i} className="existing-question-thumb">
                            <img
                              src={q.imageUrl}
                              alt="question"
                              style={{
                                width: "80px",
                                borderRadius: "4px",
                                marginRight: "6px",
                              }}
                            />
                            <small>Ans: {q.correctAnswer}</small>
                          </div>
                        ))}
                      </div>
                      <button
                        className="video-btn video-btn-red"
                        onClick={async () => {
                          try {
                            await axios.delete(
                              `${process.env.REACT_APP_API_URL}/api/videocheckpoint/${cp._id}`
                            );
                            setExistingStops((prev) =>
                              prev.filter((s) => s._id !== cp._id)
                            );
                            toast.success(`🗑 Stop at ${cp.timeInSeconds}s deleted`);
                          } catch (err) {
                            console.error(err);
                            toast.error("❌ Failed to delete stop");
                          }
                        }}
                      >
                        Delete Stop
                      </button>
                      <hr style={{ border: "1px dashed #ccc", margin: "10px 0" }} />
                    </div>
                  ))}
                </div>
              )}

              {stops.map((stop, index) => (
                <div key={index} className="checkpoint-block">
                  <label>⏱ Time (in seconds) for Stop {index + 1}</label>
                  <input
                    type="number"
                    value={stop.timeInSeconds}
                    onChange={(e) => {
                      const updated = [...stops];
                      updated[index].timeInSeconds = e.target.value;
                      setStops(updated);
                    }}
                    className="video-input"
                  />

                  <h4>🧠 Select Questions for this Stop</h4>

                  {availableQuestions.length === 0 ? (
                    <p style={{ color: "#777", fontStyle: "italic" }}>
                      No questions found for this year/unit/chapter.
                    </p>
                  ) : (
                    <div className="question-list">
                      {availableQuestions.map((q) => (
                        <div key={q._id} className="question-item">
                          <label>
                            <input
                              type="checkbox"
                              checked={stop.selectedQuestionIds.includes(q._id)}
                              onChange={(e) => {
                                const updated = [...stops];
                                if (e.target.checked)
                                  updated[index].selectedQuestionIds.push(q._id);
                                else
                                  updated[index].selectedQuestionIds =
                                    updated[index].selectedQuestionIds.filter(
                                      (id) => id !== q._id
                                    );
                                setStops(updated);
                              }}
                            />
                            <img
                              src={q.imageUrl}
                              alt="question"
                              style={{
                                width: "120px",
                                height: "auto",
                                borderRadius: "4px",
                                marginRight: "8px",
                              }}
                            />
                            <span>
                              <b>Correct Answer:</b> {q.correctAnswer}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className="video-btn video-btn-red"
                    onClick={() => {
                      const updated = [...stops];
                      updated.splice(index, 1);
                      setStops(updated);
                    }}
                    style={{ marginTop: "8px" }}
                  >
                    🗑 Remove Stop
                  </button>

                  <hr style={{ margin: "1.2rem 0", border: "1px dashed #ccc" }} />
                </div>
              ))}

              <div className="checkpoint-actions">
                <button
                  className="video-btn video-btn-green"
                  onClick={() =>
                    setStops([
                      ...stops,
                      { timeInSeconds: "", selectedQuestionIds: [] },
                    ])
                  }
                >
                  ➕ Add Another Stop
                </button>

                <button
                  className="video-btn video-btn-blue"
                  onClick={async () => {
                    try {
                      for (const stop of stops) {
                        if (
                          !stop.timeInSeconds ||
                          !stop.selectedQuestionIds.length
                        ) {
                          toast.warning("⚠️ Each stop must have time & at least one question");
                          return;
                        }

                        await axios.post(
                          `${process.env.REACT_APP_API_URL}/api/videocheckpoint`,
                          {
                            videoId: selectedVideoId,
                            timeInSeconds: stop.timeInSeconds,
                            questionIds: stop.selectedQuestionIds,
                          }
                        );
                      }

                      toast.success("✅ All quiz stops saved!");
                      setShowCheckpointModal(false);
                      setStops([{ timeInSeconds: "", selectedQuestionIds: [] }]);
                    } catch (err) {
                      console.error(err);
                      toast.error("❌ Failed to save stops");
                    }
                  }}
                >
                  💾 Save All Stops
                </button>

                <button
                  className="video-btn video-btn-red"
                  onClick={() => setShowCheckpointModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        </div>

      </main>
    </div>
  );
}
