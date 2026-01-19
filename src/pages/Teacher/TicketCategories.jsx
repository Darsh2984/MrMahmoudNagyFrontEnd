import { useEffect, useState } from "react";
import TeacherSidebar from "../../components/TeacherSidebar";
import CategoryForm from "../../components/CategoryForm";
import api from "../../services/api";
import "./TicketCategories.css";

export default function TicketCategories() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await api.get("/api/ticket-categories");
    setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deactivateCategory = async (id) => {
    if (!window.confirm("Deactivate this category?")) return;
    await api.delete(`/api/ticket-categories/${id}`);
    fetchCategories();
  };

  const toggleCategoryStatus = async (cat) => {
  await api.put(`/api/ticket-categories/${cat._id}`, {
    isActive: !cat.isActive,
  });
  fetchCategories();
};


  return (
    <div className="teacher-categories-layout">
      <TeacherSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main
        className={`teacher-categories-main ${
          sidebarOpen ? "expanded" : "collapsed"
        }`}
      >
        <header className="teacher-categories-header">
          <h2>Support Ticket Categories</h2>
          <p>Create and manage ticket categories & assistants</p>
        </header>

        <section className="teacher-categories-card">
          <CategoryForm
            editingCategory={editingCategory}
            onSaved={() => {
              setEditingCategory(null);
              fetchCategories();
            }}
            onCancel={() => setEditingCategory(null)}
          />
        </section>

        <section className="teacher-categories-card">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="teacher-categories-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Assistants</th>
                  <th>Actions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>{cat.name}</td>
                    <td>{cat.description}</td>
                    <td>
                      {cat.assignedAssistants
                        ?.map((a) => a.name)
                        .join(", ") || "—"}
                    </td>
                    <td>
                        <button
                            className={`btn-toggle ${
                            cat.isActive ? "btn-danger" : "btn-success"
                            }`}
                            onClick={() => toggleCategoryStatus(cat)}
                        >
                            {cat.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                            className="btn-edit"
                            onClick={() => setEditingCategory(cat)}
                        >
                            Edit
                        </button>
                        </td>
                        <td>
                            <span
                                className={`status-badge ${
                                cat.isActive ? "active" : "inactive"
                                }`}
                            >
                                {cat.isActive ? "Active" : "Inactive"}
                            </span>
                            </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
