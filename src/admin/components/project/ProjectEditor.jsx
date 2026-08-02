import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  FileText,
  Globe,
  ImagePlus,
  Images,
  Link2,
  Plus,
  Save,
  Trash2,
  Video,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import MediaPicker from "../media/MediaPicker";

const EMPTY_PROJECT = {
  id: "",
  title: "",
  client: "",
  category: "student",
  year: new Date().getFullYear().toString(),
  role: "",
  external_url: "",
  icon_type: "",
  description: "",
  challenge: "",
  solution: "",
  result: "",
  services: [],
  gallery: [],
  attachments: [],
  cover_image_url: "",
  accent: "coral",
  display_order: 0,
  published: true,
};

const EMPTY_ATTACHMENT = {
  title: "",
  type: "youtube",
  url: "",
};

const ATTACHMENT_TYPES = [
  { value: "youtube", label: "YouTube" },
  { value: "video", label: "Uploaded Video" },
  { value: "image", label: "Image" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Document" },
];

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeAttachment(attachment) {
  return {
    title:
      typeof attachment?.title === "string"
        ? attachment.title
        : "",
    type:
      typeof attachment?.type === "string" && attachment.type
        ? attachment.type
        : "youtube",
    url:
      typeof attachment?.url === "string"
        ? attachment.url
        : "",
  };
}

export default function ProjectEditor({ project, reload }) {
  const [form, setForm] = useState(null);
  const [originalForm, setOriginalForm] = useState(null);

  const [status, setStatus] = useState({
    saving: false,
    deleting: false,
    message: "",
    error: "",
  });

  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);
  const [attachmentMediaPicker, setAttachmentMediaPicker] =
    useState(null);

  useEffect(() => {
    if (!project) {
      setForm(null);
      setOriginalForm(null);
      return;
    }

    const normalizedProject = {
      id: project.id ?? "",
      title: project.title ?? "",
      client: project.client ?? "",
      category: project.category ?? "student",
      year:
        project.year ??
        new Date().getFullYear().toString(),
      role: project.role ?? "",
      external_url: project.external_url ?? "",
      icon_type: project.icon_type ?? "",
      description: project.description ?? "",
      challenge: project.challenge ?? "",
      solution: project.solution ?? "",
      result: project.result ?? "",
      services: Array.isArray(project.services)
        ? project.services.filter(
            (service) => typeof service === "string",
          )
        : [],
      gallery: Array.isArray(project.gallery)
        ? project.gallery.filter(
            (url) => typeof url === "string" && url,
          )
        : [],
      attachments: Array.isArray(project.attachments)
        ? project.attachments.map(normalizeAttachment)
        : [],
      cover_image_url: project.cover_image_url ?? "",
      accent: project.accent ?? "coral",
      display_order: project.display_order ?? 0,
      published: project.published ?? true,
    };

    setForm(normalizedProject);
    setOriginalForm(normalizedProject);

    setStatus({
      saving: false,
      deleting: false,
      message: "",
      error: "",
    });
  }, [project]);

  const hasUnsavedChanges = useMemo(() => {
    if (!form || !originalForm) return false;

    return JSON.stringify(form) !== JSON.stringify(originalForm);
  }, [form, originalForm]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setStatus((current) => ({
      ...current,
      message: "",
      error: "",
    }));
  }

  function addService() {
    update("services", [...form.services, ""]);
  }

  function updateService(index, value) {
    const updatedServices = [...form.services];
    updatedServices[index] = value;

    update("services", updatedServices);
  }

  function removeService(index) {
    update(
      "services",
      form.services.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    );
  }

  function removeGalleryImage(index) {
    update(
      "gallery",
      form.gallery.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    );
  }

  function addAttachment() {
    update("attachments", [
      ...form.attachments,
      { ...EMPTY_ATTACHMENT },
    ]);
  }

  function updateAttachment(index, field, value) {
    const updatedAttachments = form.attachments.map(
      (attachment, currentIndex) =>
        currentIndex === index
          ? {
              ...attachment,
              [field]: value,
            }
          : attachment,
    );

    update("attachments", updatedAttachments);
  }

  function removeAttachment(index) {
    update(
      "attachments",
      form.attachments.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    );
  }

  function moveAttachment(index, direction) {
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= form.attachments.length
    ) {
      return;
    }

    const updatedAttachments = [...form.attachments];
    const [movedAttachment] = updatedAttachments.splice(index, 1);

    updatedAttachments.splice(
      targetIndex,
      0,
      movedAttachment,
    );

    update("attachments", updatedAttachments);
  }

  async function getNextDisplayOrder() {
    const { data, error } = await supabase
      .from("projects")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    return (data?.[0]?.display_order ?? 0) + 1;
  }

  async function handleSave() {
    if (!form.title.trim()) {
      setStatus((current) => ({
        ...current,
        error: "Enter a project title before saving.",
      }));
      return;
    }

    setStatus({
      saving: true,
      deleting: false,
      message: "",
      error: "",
    });

    try {
      const cleanedServices = form.services
        .map((service) => service.trim())
        .filter(Boolean);

      const cleanedGallery = form.gallery.filter(Boolean);

      const cleanedAttachments = form.attachments
        .map((attachment) => ({
          title: attachment.title.trim(),
          type: attachment.type.trim() || "document",
          url: attachment.url.trim(),
        }))
        .filter(
          (attachment) =>
            attachment.title && attachment.url,
        );

      const existingProject = Boolean(project?.id);
      const projectId = existingProject
        ? project.id
        : createSlug(form.title);

      if (!projectId) {
        throw new Error(
          "Unable to generate a valid project ID.",
        );
      }

      let displayOrder = form.display_order;

      if (!existingProject) {
        displayOrder = await getNextDisplayOrder();
      }

      const payload = {
        id: projectId,
        title: form.title.trim(),
        client: form.client.trim(),
        category: form.category.trim() || "student",
        year: form.year.trim(),
        role: form.role.trim(),
        external_url: form.external_url.trim(),
        icon_type: form.icon_type.trim(),
        description: form.description.trim(),
        challenge: form.challenge.trim(),
        solution: form.solution.trim(),
        result: form.result.trim(),
        services: cleanedServices,
        gallery: cleanedGallery,
        attachments: cleanedAttachments,
        cover_image_url:
          form.cover_image_url.trim() || null,
        accent: form.accent,
        display_order: displayOrder,
        published: form.published,
      };

      if (existingProject) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", project.id);

        if (error) {
          throw error;
        }
      } else {
        const { data: duplicate } = await supabase
          .from("projects")
          .select("id")
          .eq("id", projectId)
          .maybeSingle();

        if (duplicate) {
          throw new Error(
            "A project with a similar title already exists. Change the title and try again.",
          );
        }

        const { error } = await supabase
          .from("projects")
          .insert(payload);

        if (error) {
          throw error;
        }
      }

      const savedForm = {
        ...form,
        ...payload,
      };

      setForm(savedForm);
      setOriginalForm(savedForm);

      setStatus({
        saving: false,
        deleting: false,
        message: existingProject
          ? "Project saved successfully."
          : "Project created successfully.",
        error: "",
      });

      await reload?.();
    } catch (error) {
      console.error("Project save failed:", error);

      setStatus({
        saving: false,
        deleting: false,
        message: "",
        error:
          error.message || "Unable to save the project.",
      });
    }
  }

  async function handleDelete() {
    if (!project?.id) {
      setForm(EMPTY_PROJECT);
      setOriginalForm(EMPTY_PROJECT);
      return;
    }

    const confirmed = window.confirm(
      `Delete "${form.title}"?\n\nThis cannot be undone.`,
    );

    if (!confirmed) return;

    setStatus({
      saving: false,
      deleting: true,
      message: "",
      error: "",
    });

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) {
        throw error;
      }

      setForm(null);
      setOriginalForm(null);

      await reload?.();
    } catch (error) {
      console.error("Project deletion failed:", error);

      setStatus({
        saving: false,
        deleting: false,
        message: "",
        error:
          error.message ||
          "Unable to delete the project.",
      });
    }
  }

  useEffect(() => {
    function handleKeyboardSave(event) {
      const saveShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "s";

      if (!saveShortcut) return;

      event.preventDefault();

      if (!status.saving && form) {
        handleSave();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboardSave,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardSave,
      );
    };
  }, [form, status.saving]);

  if (!form) {
    return (
      <section className="cms-editor-empty">
        <div>
          <h2>Select a project</h2>
          <p>
            Choose a project from the list or create a new one.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="cms-editor">
      <header className="cms-editor-header">
        <div>
          <p className="hero-eyebrow">
            {project?.id
              ? "EDIT PROJECT"
              : "CREATE PROJECT"}
          </p>

          <h1>{form.title || "Untitled Project"}</h1>

          <div className="cms-save-status">
            {status.saving && <span>Saving...</span>}

            {!status.saving && status.message && (
              <span className="cms-save-success">
                {status.message}
              </span>
            )}

            {!status.saving &&
              !status.message &&
              hasUnsavedChanges && (
                <span className="cms-save-unsaved">
                  Unsaved changes
                </span>
              )}

            {!status.saving &&
              !status.message &&
              !hasUnsavedChanges &&
              project?.id && <span>All changes saved</span>}
          </div>
        </div>

        <div className="cms-editor-actions">
          {form.external_url && (
            <a
              className="cms-btn"
              href={form.external_url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={17} />
              Preview
            </a>
          )}

          <button
            type="button"
            className="cms-btn cms-btn-danger"
            onClick={handleDelete}
            disabled={
              status.deleting || status.saving
            }
          >
            <Trash2 size={17} />
            {status.deleting
              ? "Deleting..."
              : "Delete"}
          </button>

          <button
            type="button"
            className="cms-btn cms-btn-primary"
            onClick={handleSave}
            disabled={
              status.saving || status.deleting
            }
          >
            <Save size={17} />
            {status.saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {status.error && (
        <div
          className="cms-alert cms-alert-error"
          role="alert"
        >
          {status.error}
        </div>
      )}

      <div className="cms-section">
        <h2>Project Details</h2>

        <div className="cms-grid">
          <div className="cms-field">
            <label htmlFor="project-title">Title</label>
            <input
              id="project-title"
              value={form.title}
              onChange={(event) =>
                update("title", event.target.value)
              }
              placeholder="Project title"
            />
          </div>

          <div className="cms-field">
            <label htmlFor="project-client">
              Client
            </label>
            <input
              id="project-client"
              value={form.client}
              onChange={(event) =>
                update("client", event.target.value)
              }
              placeholder="Client name"
            />
          </div>

          <div className="cms-field">
            <label htmlFor="project-category">
              Category
            </label>
            <select
              id="project-category"
              value={form.category}
              onChange={(event) =>
                update("category", event.target.value)
              }
            >
              <option value="agency">Agency</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="cms-field">
            <label htmlFor="project-year">Year</label>
            <input
              id="project-year"
              value={form.year}
              onChange={(event) =>
                update("year", event.target.value)
              }
              placeholder="2026"
            />
          </div>

          <div className="cms-field">
            <label htmlFor="project-role">Role</label>
            <input
              id="project-role"
              value={form.role}
              onChange={(event) =>
                update("role", event.target.value)
              }
              placeholder="Campaign Strategy + Copy"
            />
          </div>

          <div className="cms-field">
            <label htmlFor="project-url">
              External URL
            </label>
            <input
              id="project-url"
              type="url"
              value={form.external_url}
              onChange={(event) =>
                update(
                  "external_url",
                  event.target.value,
                )
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="cms-field">
            <label htmlFor="project-icon">
              Icon Type
            </label>
            <input
              id="project-icon"
              value={form.icon_type}
              onChange={(event) =>
                update("icon_type", event.target.value)
              }
              placeholder="fish, book, pizza-rolls"
            />
          </div>

          <div className="cms-field">
            <label htmlFor="project-accent">
              Accent
            </label>
            <select
              id="project-accent"
              value={form.accent}
              onChange={(event) =>
                update("accent", event.target.value)
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
        </div>
      </div>

      <div className="cms-section">
        <h2>Description</h2>
        <textarea
          rows={5}
          value={form.description}
          onChange={(event) =>
            update("description", event.target.value)
          }
          placeholder="Summarize the project."
        />
      </div>

      <div className="cms-section">
        <h2>Challenge</h2>
        <textarea
          rows={5}
          value={form.challenge}
          onChange={(event) =>
            update("challenge", event.target.value)
          }
          placeholder="What problem needed to be solved?"
        />
      </div>

      <div className="cms-section">
        <h2>Solution</h2>
        <textarea
          rows={5}
          value={form.solution}
          onChange={(event) =>
            update("solution", event.target.value)
          }
          placeholder="How was the problem solved?"
        />
      </div>

      <div className="cms-section">
        <h2>Result</h2>
        <textarea
          rows={5}
          value={form.result}
          onChange={(event) =>
            update("result", event.target.value)
          }
          placeholder="What was the final outcome?"
        />
      </div>

      <div className="cms-section">
        <div className="cms-services-header">
          <div>
            <h2>Services</h2>
            <p>
              Add the services provided for this project.
            </p>
          </div>

          <button
            type="button"
            className="cms-btn cms-btn-primary"
            onClick={addService}
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>

        <div className="cms-services">
          {form.services.length === 0 && (
            <p className="cms-muted-message">
              No services have been added.
            </p>
          )}

          {form.services.map((service, index) => (
            <div
              className="cms-service-row"
              key={`${index}-${service}`}
            >
              <input
                value={service}
                onChange={(event) =>
                  updateService(
                    index,
                    event.target.value,
                  )
                }
                placeholder="Example: Creative Strategy"
              />

              <button
                type="button"
                className="cms-icon-btn"
                onClick={() =>
                  removeService(index)
                }
                aria-label={`Remove service ${index + 1}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="cms-section">
        <div className="cms-media-field-heading">
          <div>
            <h2>Cover Image</h2>
            <p>
              Select an uploaded image from the Media
              Library.
            </p>
          </div>

          <button
            type="button"
            className="cms-btn cms-btn-primary"
            onClick={() => setCoverPickerOpen(true)}
          >
            <ImagePlus size={17} />
            {form.cover_image_url
              ? "Replace Cover"
              : "Choose Cover"}
          </button>
        </div>

        {form.cover_image_url ? (
          <div className="cms-selected-cover">
            <div className="cms-cover-preview">
              <img
                src={form.cover_image_url}
                alt={`${
                  form.title || "Project"
                } cover preview`}
              />
            </div>

            <div className="cms-selected-media-actions">
              <button
                type="button"
                className="cms-btn cms-btn-secondary"
                onClick={() =>
                  setCoverPickerOpen(true)
                }
              >
                <Images size={17} />
                Choose Another
              </button>

              <button
                type="button"
                className="cms-btn cms-btn-danger"
                onClick={() =>
                  update("cover_image_url", "")
                }
              >
                <Trash2 size={17} />
                Remove Cover
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="cms-media-empty-button"
            onClick={() => setCoverPickerOpen(true)}
          >
            <ImagePlus size={34} />
            <strong>Choose a cover image</strong>
            <span>
              Open the Media Library or upload a new
              image.
            </span>
          </button>
        )}
      </div>

      <div className="cms-section">
        <div className="cms-media-field-heading">
          <div>
            <h2>Gallery Images</h2>
            <p>
              Add one or more images to this project's
              gallery.
            </p>
          </div>

          <button
            type="button"
            className="cms-btn cms-btn-primary"
            onClick={() => setGalleryPickerOpen(true)}
          >
            <Images size={17} />
            Add Gallery Images
          </button>
        </div>

        {form.gallery.length === 0 ? (
          <button
            type="button"
            className="cms-media-empty-button"
            onClick={() => setGalleryPickerOpen(true)}
          >
            <Images size={34} />
            <strong>No gallery images yet</strong>
            <span>
              Select existing media or upload new images.
            </span>
          </button>
        ) : (
          <div className="cms-project-gallery-grid">
            {form.gallery.map((url, index) => (
              <article
                className="cms-project-gallery-item"
                key={`${url}-${index}`}
              >
                <img
                  src={url}
                  alt={`${
                    form.title || "Project"
                  } gallery ${index + 1}`}
                />

                <button
                  type="button"
                  className="cms-project-gallery-remove"
                  onClick={() =>
                    removeGalleryImage(index)
                  }
                  aria-label={`Remove gallery image ${
                    index + 1
                  }`}
                >
                  <X size={17} />
                </button>

                <span>{index + 1}</span>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="cms-section">
        <div className="cms-services-header">
          <div>
            <h2>Campaign Assets</h2>
            <p>
              Add YouTube links, uploaded videos, images,
              PDFs, or documents. Use the arrows to control
              their display order.
            </p>
          </div>

          <button
            type="button"
            className="cms-btn cms-btn-primary"
            onClick={addAttachment}
          >
            <Plus size={16} />
            Add Asset
          </button>
        </div>

        <div className="cms-services">
          {form.attachments.length === 0 && (
            <button
              type="button"
              className="cms-media-empty-button"
              onClick={addAttachment}
            >
              <Video size={34} />
              <strong>No campaign assets yet</strong>
              <span>
                Add a YouTube video, image, uploaded video,
                PDF, or document.
              </span>
            </button>
          )}

          {form.attachments.map(
            (attachment, index) => (
              <article
                className="cms-section"
                key={`${index}-${attachment.url}`}
              >
                <div className="cms-services-header">
                  <div>
                    <h2>
                      Asset{" "}
                      {String(index + 1).padStart(2, "0")}
                    </h2>
                    <p>
                      {attachment.title ||
                        "Untitled campaign asset"}
                    </p>
                  </div>

                  <div className="cms-editor-actions">
                    <button
                      type="button"
                      className="cms-icon-btn"
                      onClick={() =>
                        moveAttachment(index, -1)
                      }
                      disabled={index === 0}
                      aria-label={`Move asset ${
                        index + 1
                      } up`}
                    >
                      <ArrowUp size={16} />
                    </button>

                    <button
                      type="button"
                      className="cms-icon-btn"
                      onClick={() =>
                        moveAttachment(index, 1)
                      }
                      disabled={
                        index ===
                        form.attachments.length - 1
                      }
                      aria-label={`Move asset ${
                        index + 1
                      } down`}
                    >
                      <ArrowDown size={16} />
                    </button>

                    <button
                      type="button"
                      className="cms-icon-btn"
                      onClick={() =>
                        removeAttachment(index)
                      }
                      aria-label={`Remove asset ${
                        index + 1
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="cms-grid">
                  <div className="cms-field">
                    <label
                      htmlFor={`attachment-title-${index}`}
                    >
                      Asset Title
                    </label>
                    <input
                      id={`attachment-title-${index}`}
                      value={attachment.title}
                      onChange={(event) =>
                        updateAttachment(
                          index,
                          "title",
                          event.target.value,
                        )
                      }
                      placeholder="Pinterest Campaign 1"
                    />
                  </div>

                  <div className="cms-field">
                    <label
                      htmlFor={`attachment-type-${index}`}
                    >
                      Asset Type
                    </label>
                    <select
                      id={`attachment-type-${index}`}
                      value={attachment.type}
                      onChange={(event) =>
                        updateAttachment(
                          index,
                          "type",
                          event.target.value,
                        )
                      }
                    >
                      {ATTACHMENT_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="cms-field">
                  <label
                    htmlFor={`attachment-url-${index}`}
                  >
                    Asset URL
                  </label>

                  <div className="cms-service-row">
                    <Link2 size={18} />

                    <input
                      id={`attachment-url-${index}`}
                      type="url"
                      value={attachment.url}
                      onChange={(event) =>
                        updateAttachment(
                          index,
                          "url",
                          event.target.value,
                        )
                      }
                      placeholder={
                        attachment.type === "youtube"
                          ? "https://youtu.be/..."
                          : "https://..."
                      }
                    />

                    {attachment.type !== "youtube" && (
                      <button
                        type="button"
                        className="cms-btn cms-btn-secondary"
                        onClick={() =>
                          setAttachmentMediaPicker(index)
                        }
                      >
                        <Images size={16} />
                        Media
                      </button>
                    )}
                  </div>
                </div>

                {attachment.url && (
                  <div className="cms-selected-media-actions">
                    <a
                      className="cms-btn cms-btn-secondary"
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={16} />
                      Open Asset
                    </a>
                  </div>
                )}
              </article>
            ),
          )}
        </div>
      </div>

      <div className="cms-section">
        <h2>Publishing</h2>

        <label className="cms-publish-toggle">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(event) =>
              update(
                "published",
                event.target.checked,
              )
            }
          />

          <span className="cms-publish-switch" />

          <span>
            <Globe size={18} />

            <span>
              <strong>
                {form.published
                  ? "Published"
                  : "Hidden"}
              </strong>

              <small>
                {form.published
                  ? "This project can appear publicly."
                  : "This project is hidden from visitors."}
              </small>
            </span>
          </span>
        </label>
      </div>

      <footer className="cms-editor-footer">
        <div>
          {hasUnsavedChanges
            ? "You have unsaved changes."
            : "Everything is saved."}
        </div>

        <button
          type="button"
          className="cms-btn cms-btn-primary"
          onClick={handleSave}
          disabled={
            status.saving || status.deleting
          }
        >
          <Save size={17} />
          {status.saving
            ? "Saving..."
            : "Save Project"}
        </button>
      </footer>

      <MediaPicker
        open={coverPickerOpen}
        selectedUrls={
          form.cover_image_url
            ? [form.cover_image_url]
            : []
        }
        onSelect={(url) =>
          update("cover_image_url", url)
        }
        onClose={() => setCoverPickerOpen(false)}
      />

      <MediaPicker
        open={galleryPickerOpen}
        multiple
        selectedUrls={form.gallery}
        onSelect={(urls) =>
          update("gallery", urls)
        }
        onClose={() =>
          setGalleryPickerOpen(false)
        }
      />

      <MediaPicker
        open={attachmentMediaPicker !== null}
        selectedUrls={
          attachmentMediaPicker !== null &&
          form.attachments[attachmentMediaPicker]?.url
            ? [
                form.attachments[attachmentMediaPicker]
                  .url,
              ]
            : []
        }
        onSelect={(url) => {
          if (attachmentMediaPicker === null) return;

          updateAttachment(
            attachmentMediaPicker,
            "url",
            url,
          );
          setAttachmentMediaPicker(null);
        }}
        onClose={() =>
          setAttachmentMediaPicker(null)
        }
      />
    </section>
  );
}