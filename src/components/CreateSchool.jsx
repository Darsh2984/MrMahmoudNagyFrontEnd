import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  PlusCircle,
  Trash,
  Buildings,
  ArrowDown,
  ArrowUp,
  CheckCircle,
  XCircle,
} from "phosphor-react";
import "react-toastify/dist/ReactToastify.css";
import "./CreateSchool.css";

function CreateSchool({ teacherId }) {
  const [schools, setSchools] = useState([]);
  const [schoolName, setSchoolName] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    if (teacherId) fetchSchools();
  }, [teacherId]);

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/school/${teacherId}`);
      const sorted = res.data.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );
      setSchools(sorted);
    } catch (err) {
      console.error("❌ Error fetching schools:", err);
      toast.error("Failed to load schools");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      toast.warn("School name cannot be empty!");
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/school`, {
        name: schoolName,
        teacherId,
      });
      toast.success("✅ School created successfully!");
      setSchoolName("");
      fetchSchools();
    } catch (err) {
      console.error("❌ Error creating school:", err);
      toast.error("Failed to create school");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/school/${id}`);
      toast.success("🗑 School deleted successfully!");
      setPendingDelete(null);
      fetchSchools();
    } catch (err) {
      console.error("❌ Error deleting school:", err);
      toast.error("Failed to delete school");
    }
  };

  const askDelete = (id, name) => {
    setPendingDelete({ id, name });
    toast.info(
      <div>
        <strong>Delete “{name}”?</strong>
        <div className="toast-actions">
          <button
            className="toast-btn confirm"
            onClick={() => handleDelete(id)}
          >
            <CheckCircle size={16} /> Yes
          </button>
          <button
            className="toast-btn cancel"
            onClick={() => setPendingDelete(null)}
          >
            <XCircle size={16} /> No
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  return (
    <div className="create-school-container">
      {/* Header */}
      <div className="school-header">
        <div className="title">
          <Buildings size={24} weight="duotone" color="#0b3c49" />
          <h3>Manage Schools</h3>
        </div>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <>
              <ArrowDown size={18} /> Expand
            </>
          ) : (
            <>
              <ArrowUp size={18} /> Collapse
            </>
          )}
        </button>
      </div>

      {/* Create Form */}
      <form className="school-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Enter School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="styled-input"
        />
        <button type="submit" className="btn btn-add">
          <PlusCircle size={18} /> Add School
        </button>
      </form>

      {/* School List */}
      {!collapsed && (
        <div className="school-list">
          {schools.length === 0 ? (
            <p className="no-data">No schools added yet.</p>
          ) : (
            <div className="school-grid">
              {schools.map((school) => (
                <div key={school._id} className="school-card">
                  <span className="school-name">{school.name}</span>
                  <button
                    className="btn btn-delete"
                    onClick={() => askDelete(school._id, school.name)}
                  >
                    <Trash size={18} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateSchool;
