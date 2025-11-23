import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "phosphor-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SpecialStudentVideoViewer.css";

export default function SpecialStudentVideoViewer() {
  const [yearId, setYearId] = useState("");
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState({ unitId: "", chapterId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Quiz-related states
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentStop, setCurrentStop] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [shownCheckpoints, setShownCheckpoints] = useState([]); // ✅ Track shown quizzes

  const videoRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // === Load Student Data on Mount ===
  useEffect(() => {
    if (user?.role === "student") fetchStudentYear(user.id);
  }, []);

  // === Fetch Year, Units, Chapters, and Videos ===
  const fetchStudentYear = async (studentId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/student/${studentId}/year`
      );
      if (res.data?.yearId) {
        const yrId = res.data.yearId._id;
        setYearId(yrId);
        fetchVideos(yrId);
        fetchUnits(studentId, yrId);
      }
    } catch (err) {
      console.error("❌ Error fetching student year:", err);
      setError("Failed to load your Year.");
    }
  };

  const fetchUnits = async (studentId, yearId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/unit/student/${studentId}/year/${yearId}/units`
      );
      setUnits(res.data);
    } catch {
      setError("Failed to load units.");
    }
  };

  const fetchChapters = async (unitId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`);
      setChapters(res.data);
    } catch (err) {
      console.error("❌ Error fetching chapters:", err);
    }
  };

  const fetchVideos = async (yearId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/video/year/${yearId}`);
      setVideos(res.data);
    } catch {
      setError("Failed to load videos.");
    } finally {
      setLoading(false);
    }
  };

  // === Filter Videos by Unit and Chapter ===
  const filteredVideos = videos.filter((v) => {
    if (filter.unitId && v.unitId?._id !== filter.unitId) return false;
    if (filter.chapterId && v.chapterId?._id !== filter.chapterId) return false;
    return true;
  });

  // === Fetch Quiz Checkpoints for a Video ===
  const handleVideoPlay = async (videoId) => {
    setActiveVideoId(videoId);
    setShownCheckpoints([]); // ✅ Reset when new video starts
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/videocheckpoint/${videoId}`
      );
      setCheckpoints(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching checkpoints:", err);
      setCheckpoints([]);
    }
  };

 // put this at the top of your component, with other refs
const triggeredRef = useRef(new Set());

useEffect(() => {
  const vid = videoRef.current;
  if (!vid) return;

  const handleTimeUpdate = () => {
    if (!checkpoints?.length || showQuiz) return;

    const currentSecond = Math.floor(vid.currentTime);
    const stop = checkpoints.find(
      (cp) => Math.abs(cp.timeInSeconds - currentSecond) < 0.3
    );
    if (!stop) return;

    // ✅ Prevent repeat trigger
    if (triggeredRef.current.has(stop.timeInSeconds)) return;

    // ✅ Lock this checkpoint until quiz finishes
    triggeredRef.current.add(stop.timeInSeconds);

    // 🔹 If the video is in fullscreen → exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    vid.pause();
    setCurrentStop(stop);
    setShowQuiz(true);
    setAnswers({});

  };

  vid.addEventListener("timeupdate", handleTimeUpdate);
  return () => {
    vid.removeEventListener("timeupdate", handleTimeUpdate);
  };
}, [checkpoints, showQuiz]);



  // === Handle Answer Selection ===
  const handleAnswer = (qIndex, chosenOpt) => {
    if (!currentStop?.questions || !currentStop.questions[qIndex]) {
      console.warn("⚠️ Missing question data");
      return;
    }

    const updatedAnswers = { ...answers, [qIndex]: chosenOpt };
    setAnswers(updatedAnswers);

    const question = currentStop.questions[qIndex];
    const correctAns = question?.correctAnswer
      ? question.correctAnswer.toString().toUpperCase()
      : "";

    // ✅ Compare safely with case normalization
    if (chosenOpt.toUpperCase() === correctAns) {
      toast.success("✅ Correct Answer!");

      // If all are correct, resume video
      const allCorrect = currentStop.questions.every(
        (q, i) =>
          updatedAnswers[i] &&
          updatedAnswers[i].toUpperCase() ===
            (q.correctAnswer || "").toString().toUpperCase()
      );

      if (allCorrect) {
        setTimeout(() => {
          setShowQuiz(false);
          videoRef.current.play();
        }, 800);
      }
    } else {
  toast.error("❌ Wrong Answer!");

  setTimeout(() => {
    setShowQuiz(false);

    const vid = videoRef.current;
    if (!vid) return;

    // Find this checkpoint's index
    const checkpointIndex = checkpoints.findIndex(
      (cp) => cp.timeInSeconds === currentStop.timeInSeconds
    );

    // If this is the first checkpoint → restart video
    if (checkpointIndex <= 0) {
      vid.currentTime = 0;
      vid.play();
      return;
    }

    // Otherwise jump to the previous checkpoint
    const previousStop = checkpoints[checkpointIndex - 1];
    vid.currentTime = previousStop.timeInSeconds;

    // Allow the video to resume from that point
    vid.play();
  }, 800);
}
  };

  return (
    <div className="special-student-video">
      {/* === HEADER === */}
      <header className="special-header">
        <div className="back-btn" onClick={() => navigate("/specialstudent-dashboard")}>
          <ArrowLeft size={20} /> <span>Back to Dashboard</span>
        </div>
        <h1>Course Videos</h1>
        <p>Watch your recorded lessons organized by unit and chapter</p>
        <div className="header-underline"></div>
      </header>

      {/* === VIDEO SECTION === */}
      <section className="video-section">
        {error && <p className="error-msg">{error}</p>}

        {/* === Filter Box === */}
        <div className="filter-box">
          <div className="filter-item">
            <label>Select Unit</label>
            <select
              value={filter.unitId}
              onChange={(e) => {
                const unitId = e.target.value;
                setFilter({ unitId, chapterId: "" });
                unitId ? fetchChapters(unitId) : setChapters([]);
              }}
            >
              <option value="">-- All Units --</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {chapters.length > 0 && (
            <div className="filter-item">
              <label>📖 Select Chapter</label>
              <select
                value={filter.chapterId}
                onChange={(e) =>
                  setFilter({ ...filter, chapterId: e.target.value })
                }
              >
                <option value="">-- All Chapters --</option>
                {chapters.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* === Videos === */}
        {loading ? (
          <p className="loading-msg">⏳ Loading videos...</p>
        ) : filteredVideos.length === 0 ? (
          <p className="no-data">⚠️ No videos found</p>
        ) : (
          <div className="video-grid">
            {filteredVideos.map((v) => (
              <div key={v._id} className="video-card">
                <h4>{v.title}</h4>
                <p className="video-meta">
                  <b>Unit:</b> {v.unitId?.name || "—"} <br />
                  <b>Chapter:</b> {v.chapterId?.name || "—"}
                </p>
                <video
                  ref={activeVideoId === v._id ? videoRef : null}
                  src={v.videoUrl}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  className="video-player"
                  onPlay={() => handleVideoPlay(v._id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* === QUIZ MODAL === */}
      {showQuiz && currentStop && (
        <div className="quiz-overlay">
          <div className="quiz-modal">
            <h2>🧠 Answer the Questions</h2>

            {(currentStop.questions || []).map((q, i) => (
              <div key={i} className="quiz-question">
                <p>
                  <b>Q{i + 1}:</b>
                </p>

                {/* 🖼️ Question Image */}
                {q.imageUrl && (
                  <img
                    src={q.imageUrl}
                    alt={`Question ${i + 1}`}
                    className="quiz-image"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "6px",
                      marginBottom: "10px",
                    }}
                  />
                )}

                {/* 🅰️🅱️🅲️🅳️ Four fixed answer buttons */}
                <div className="quiz-options">
                  {["A", "B", "C", "D"].map((opt) => (
                    <button
                      key={opt}
                      className={`quiz-option ${
                        answers[i] === opt ? "selected" : ""
                      }`}
                      onClick={() => handleAnswer(i, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
