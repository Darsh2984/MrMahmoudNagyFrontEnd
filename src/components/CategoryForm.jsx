import { useEffect, useState } from "react";
import api from "../services/api";
import "./CategoryForm.css";

export default function CategoryForm({
  editingCategory,
  onSaved,
  onCancel,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistants, setSelectedAssistants] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const teacherId = user?.id;

  useEffect(() => {
    fetchAssistants();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setDescription(editingCategory.description || "");
      setSelectedAssistants(
        editingCategory.assignedAssistants.map((a) => a._id)
      );
    } else {
      resetForm();
    }
  }, [editingCategory]);

  const fetchAssistants = async () => {
    const res = await api.get(
      `${process.env.REACT_APP_API_URL}/api/auth/teacher/assistants/${teacherId}`
    );
    setAssistants(res.data);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedAssistants([]);
  };

  const toggleAssistant = (assistantId) => {
    setSelectedAssistants((prev) =>
      prev.includes(assistantId)
        ? prev.filter((id) => id !== assistantId)
        : [...prev, assistantId]
    );
  };

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      assignedAssistants: selectedAssistants,
    };

    if (editingCategory) {
      await api.put(
        `/api/ticket-categories/${editingCategory._id}`,
        payload
      );
    } else {
      await api.post("/api/ticket-categories", payload);
    }

    resetForm();
    onSaved();
  };

  return (
    <form onSubmit={submit} className="category-form-card">
      <h3 className="category-form-title">
        {editingCategory ? "Edit Category" : "Create New Category"}
      </h3>

      <div className="category-form-group">
        <label>Category Name</label>
        <input
          type="text"
          placeholder="e.g. Technical Support"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="category-form-group">
        <label>Description</label>
        <textarea
          placeholder="Shown to students when creating a ticket"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="category-form-group">
        <label>Assign Assistants</label>

        <div className="assistant-checkbox-list">
          {assistants.map((a) => (
            <label key={a._id} className="assistant-checkbox-item">
              <input
                type="checkbox"
                checked={selectedAssistants.includes(a._id)}
                onChange={() => toggleAssistant(a._id)}
              />
              <span>{a.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="category-form-actions">
        <button type="submit" className="btn-save">
          {editingCategory ? "Update Category" : "Create Category"}
        </button>

        {editingCategory && (
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
