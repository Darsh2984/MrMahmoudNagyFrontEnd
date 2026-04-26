import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentVideoViewer.css";

// Single video card — only loads the player when clicked
function VideoCard({ video }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    setIsPlaying(true);
    // Give the DOM time to render the video element before calling play()
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // Autoplay blocked on iOS — user will tap play manually, that's fine
        });
      }
    }, 100);
  };

  return (
    <div className="video-card">
      <h4>{video.title}</h4>
      <p className="video-meta">
        <b>Unit:</b> {video.unitId?.name || "—"} <br />
        <b>Chapter:</b> {video.chapterId?.name || "—"}
      </p>

      {!isPlaying ? (
        // Thumbnail placeholder — no video element in DOM yet
        <div className="video-thumbnail" onClick={handlePlay}>
          <div className="play-btn">
            <svg viewBox="0 0 24 24" fill="white" width="48" height="48">
              <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.55)" />
              <polygon points="10,8 18,12 10,16" fill="white" />
            </svg>
          </div>
          <span className="tap-to-play">Tap to play</span>
        </div>
      ) : (
        // Video only mounts in DOM after user clicks — fixes iOS buffering all at once
        <video
          ref={videoRef}
          src={video.videoUrl}
          controls
          controlsList="nodownload"
          disablePictureInPicture
          playsInline              // Critical for iOS — prevents fullscreen takeover
          preload="metadata"       // Only load duration/dimensions, not the full file
          className="video-player"
          onContextMenu={(e) => e.preventDefault()}
        />
      )}
    </div>
  );
}

export default function StudentVideoViewer() {
  const [yearId, setYearId] = useState("");
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState({ unitId: "", chapterId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "student") fetchStudentYear(user.id);
  }, []);

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
      console.error("Error fetching student year:", err);
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
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/chapter/${unitId}`
      );
      setChapters(res.data);
    } catch (err) {
      console.error("Error fetching chapters:", err);
    }
  };

  const fetchVideos = async (yearId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/video/year/${yearId}`
      );
      setVideos(res.data);
    } catch {
      setError("Failed to load videos.");
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter((v) => {
    if (filter.unitId && v.unitId?._id !== filter.unitId) return false;
    if (filter.chapterId && v.chapterId?._id !== filter.chapterId) return false;
    return true;
  });

  return (
    <div className="student-layout">
      <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className={`student-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <header className="dashboard-header">
          <h2>Course Videos</h2>
          <p>Watch your recorded lessons by unit and chapter</p>
        </header>

        <section className="section-card">
          {error && <p className="error-msg">{error}</p>}

          {/* Filter Section */}
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
                <label>Select Chapter</label>
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

          {/* Videos */}
          {loading ? (
            <p className="loading-msg">⏳ Loading videos...</p>
          ) : filteredVideos.length === 0 ? (
            <p className="no-data">⚠️ No videos found</p>
          ) : (
            <div className="video-grid">
              {filteredVideos.map((v) => (
                <VideoCard key={v._id} video={v} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}