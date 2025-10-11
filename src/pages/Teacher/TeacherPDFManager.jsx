import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import TeacherSidebar from "../../components/TeacherSidebar";
import {
  UploadSimple,
  Trash,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowCounterClockwise,
  BookOpen,
  FileArrowUp,
} from "phosphor-react";
import "./TeacherMaterialManager.css";

export default function TeacherMaterialManager() {
  const [teacherId, setTeacherId] = useState("");
  const [years, setYears] = useState([]);
  const [units, setUnits] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    title: "",
    yearId: "",
    unitId: "",
    chapterId: "",
    file: null,
    fileUrl: "",
  });
  const [uploadType, setUploadType] = useState("file");
  const [zoomLevels, setZoomLevels] = useState({});
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const fetchMaterials = async (yearId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const teacherId = user?.id;
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/material/year/${yearId}/teacher/${teacherId}`
      );
      setMaterials(res.data);
    } catch {
      toast.error("❌ Failed to load materials");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") setForm({ ...form, file: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.yearId || !form.unitId || !form.chapterId) {
      toast.warning("⚠️ All fields are required");
      return;
    }

    setLoading(true);
    try {
      if (uploadType === "url") {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/material/url`, {
          ...form,
          teacherId,
        });
      } else {
        if (!form.file) {
          toast.warning("⚠️ Please choose a file");
          return;
        }
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("yearId", form.yearId);
        fd.append("unitId", form.unitId);
        fd.append("chapterId", form.chapterId);
        fd.append("teacherId", teacherId);
        fd.append("file", form.file);
        await axios.post(`${process.env.REACT_APP_API_URL}/api/material`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success("✅ Material uploaded successfully");
      setForm({
        title: "",
        yearId: "",
        unitId: "",
        chapterId: "",
        file: null,
        fileUrl: "",
      });
      setUnits([]);
      setChapters([]);
      fetchMaterials(form.yearId);
    } catch {
      toast.error("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>🗑 Are you sure you want to delete this material?</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button
            className="material-toast-btn-confirm"
            onClick={async () => {
              try {
                const user = JSON.parse(localStorage.getItem("user"));
                const teacherId = user?.id;
                await axios.delete(
                  `${process.env.REACT_APP_API_URL}/api/material/${id}/teacher/${teacherId}`
                );
                toast.dismiss();
                toast.success("✅ Material deleted");
                fetchMaterials(form.yearId);
              } catch {
                toast.dismiss();
                toast.error("❌ Failed to delete material");
              }
            }}
          >
            Confirm
          </button>
          <button className="material-toast-btn-cancel" onClick={() => toast.dismiss()}>
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false, position: "top-center" }
    );
  };

  const handleZoom = (id, type) => {
    setZoomLevels((prev) => {
      const current = prev[id] || 1;
      if (type === "in") return { ...prev, [id]: Math.min(current + 0.2, 2) };
      if (type === "out") return { ...prev, [id]: Math.max(current - 0.2, 0.5) };
      return { ...prev, [id]: 1 };
    });
  };

  return (
    <div className={`material-layout ${sidebarOpen ? "with-sidebar" : "full-width"}`}>
      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="material-container">
        <div className="material-section-card">
          <h2 className="material-title">
            <FileArrowUp size={22} weight="fill" color="#0b3c49" /> Manage Course Materials
          </h2>

          <form onSubmit={handleUpload} className="material-form-grid">
            <input
              type="text"
              name="title"
              placeholder="PDF Title"
              value={form.title}
              onChange={handleChange}
              className="material-input"
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
                  fetchMaterials(yearId);
                  fetchUnits(teacherId, yearId);
                }
              }}
              className="material-input"
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
              className="material-input"
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
              className="material-input"
              disabled={!form.unitId}
            >
              <option value="">-- Select Chapter --</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Upload Type Toggle */}
            <div className="material-toggle">
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
                name="file"
                accept="application/pdf"
                onChange={handleChange}
                className="material-input"
              />
            ) : (
              <input
                type="text"
                name="fileUrl"
                placeholder="Paste Bunny CDN PDF URL"
                value={form.fileUrl}
                onChange={handleChange}
                className="material-input"
              />
            )}

            <button type="submit" disabled={loading} className="material-btn material-btn-blue">
              {loading ? "Uploading..." : <><UploadSimple size={18} /> Save PDF</>}
            </button>
          </form>
        </div>

        <div className="material-section-card">
          <h2 className="material-title">
            <BookOpen size={22} weight="fill" color="#8baa91" /> Uploaded Materials
          </h2>

          {materials.length === 0 ? (
            <p className="material-empty">No materials uploaded yet.</p>
          ) : (
            <div className="material-grid">
              {materials.map((m) => {
                const zoom = zoomLevels[m._id] || 1;
                return (
                  <div key={m._id} className="material-card">
                    <h4>{m.title}</h4>
                    <p>
                      <b>Unit:</b> {m.unitId?.name} <br />
                      <b>Chapter:</b> {m.chapterId?.name}
                    </p>

                    <div className="material-zoom">
                      <button onClick={() => handleZoom(m._id, "out")} className="material-btn-grey">
                        <MagnifyingGlassMinus size={16} />
                      </button>
                      <button onClick={() => handleZoom(m._id, "in")} className="material-btn-grey">
                        <MagnifyingGlassPlus size={16} />
                      </button>
                      <button onClick={() => handleZoom(m._id, "reset")} className="material-btn-grey">
                        <ArrowCounterClockwise size={16} />
                      </button>
                    </div>

                    <iframe
                      src={`${m.fileUrl}#toolbar=0&navpanes=0`}
                      title={m.title}
                      style={{
                        width: "100%",
                        height: "500px",
                        border: "none",
                        transform: `scale(${zoom})`,
                        transformOrigin: "0 0",
                      }}
                    ></iframe>

                    <button
                      onClick={() => handleDelete(m._id)}
                      className="material-btn material-btn-red"
                    >
                      <Trash size={16} /> Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
