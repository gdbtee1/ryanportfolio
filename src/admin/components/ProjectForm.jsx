import { useState, useEffect } from "react";

function ProjectForm({ project = {}, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: "",
    client: "",
    category: "",
    year: "",
    role: "",
    external_url: "",
    description: "",
    challenge: "",
    solution: "",
    result: "",
    services: [],
    accent: "coral",
    icon_type: "",
    published: true,
    cover_image_url: "",
    gallery: [],
  });

  useEffect(() => {
    if (!project) return;

    setForm({
      title: project.title || "",
      client: project.client || "",
      category: project.category || "",
      year: project.year || "",
      role: project.role || "",
      external_url: project.external_url || "",
      description: project.description || "",
      challenge: project.challenge || "",
      solution: project.solution || "",
      result: project.result || "",
      services: project.services || [],
      accent: project.accent || "coral",
      icon_type: project.icon_type || "",
      published: project.published ?? true,
      cover_image_url: project.cover_image_url || "",
      gallery: project.gallery || [],
    });
  }, [project]);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="cms-editor">

      <div className="cms-editor-header">
        <div>
          <h1>
            {project?.id ? "Edit Project" : "New Project"}
          </h1>

          <p>
            Manage every detail of this portfolio project.
          </p>
        </div>

        <div className="cms-editor-actions">
          <button
            className="cms-btn cms-btn-danger"
            onClick={() => onDelete?.(project)}
          >
            Delete
          </button>

          <button
            className="cms-btn cms-btn-primary"
            onClick={() => onSave?.(form)}
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="cms-section">

        <h2>Project Details</h2>

        <div className="cms-grid">

          <div className="cms-field">
            <label>Title</label>

            <input
              value={form.title}
              onChange={(e) =>
                updateField("title", e.target.value)
              }
            />
          </div>

          <div className="cms-field">
            <label>Client</label>

            <input
              value={form.client}
              onChange={(e) =>
                updateField("client", e.target.value)
              }
            />
          </div>

          <div className="cms-field">
            <label>Category</label>

            <input
              value={form.category}
              onChange={(e) =>
                updateField("category", e.target.value)
              }
            />
          </div>

          <div className="cms-field">
            <label>Year</label>

            <input
              value={form.year}
              onChange={(e) =>
                updateField("year", e.target.value)
              }
            />
          </div>

          <div className="cms-field">
            <label>Role</label>

            <input
              value={form.role}
              onChange={(e) =>
                updateField("role", e.target.value)
              }
            />
          </div>

          <div className="cms-field">
            <label>External URL</label>

            <input
              value={form.external_url}
              onChange={(e) =>
                updateField("external_url", e.target.value)
              }
            />
          </div>

        </div>

      </div>

      <div className="cms-section">

        <h2>Description</h2>

        <textarea
          rows={6}
          value={form.description}
          onChange={(e) =>
            updateField("description", e.target.value)
          }
        />

      </div>

      <div className="cms-section">

        <h2>Challenge</h2>

        <textarea
          rows={5}
          value={form.challenge}
          onChange={(e) =>
            updateField("challenge", e.target.value)
          }
        />

      </div>

      <div className="cms-section">

        <h2>Solution</h2>

        <textarea
          rows={5}
          value={form.solution}
          onChange={(e) =>
            updateField("solution", e.target.value)
          }
        />

      </div>

      <div className="cms-section">

        <h2>Result</h2>

        <textarea
          rows={5}
          value={form.result}
          onChange={(e) =>
            updateField("result", e.target.value)
          }
        />

      </div>

      <div className="cms-section">

        <h2>Appearance</h2>

        <div className="cms-grid">

          <div className="cms-field">
            <label>Accent</label>

            <select
              value={form.accent}
              onChange={(e) =>
                updateField("accent", e.target.value)
              }
            >
              <option value="coral">Coral</option>
              <option value="gold">Gold</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="orange">Orange</option>
            </select>
          </div>

          <div className="cms-field">
            <label>Icon</label>

            <input
              value={form.icon_type}
              onChange={(e) =>
                updateField("icon_type", e.target.value)
              }
            />
          </div>

        </div>

      </div>

      <div className="cms-section">

        <h2>Media</h2>

        <div className="cms-grid">

          <div className="cms-field">
            <label>Cover Image URL</label>

            <input
              value={form.cover_image_url}
              onChange={(e) =>
                updateField("cover_image_url", e.target.value)
              }
            />
          </div>

          <div className="cms-field cms-toggle">
            <label>

              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  updateField("published", e.target.checked)
                }
              />

              Published

            </label>
          </div>

        </div>

      </div>

    </div>
  );
}

export default ProjectForm;