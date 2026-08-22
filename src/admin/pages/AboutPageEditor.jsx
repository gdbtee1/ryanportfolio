import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ImagePlus, LoaderCircle, RefreshCw, Save, Trash2 } from "lucide-react";

import AdminLayout from "../layout/AdminLayout";
import { supabase } from "../../lib/supabase";

const DEFAULT_ABOUT_CONTENT = {
  worldLabel: "WORLD 03",
  pageTitle: "CREDITS",
  playerLabel: "PLAYER 01",
  classLabel: "CREATIVE CLASS",
  name: "Ryne Mitra",
  role: "Campaign Creative",
  specialty: "Words + Worlds",
  eyebrow: "ABOUT THE PLAYER",
  headline:
    "I build campaign ideas that give brands a clearer voice and a world people can remember.",
  paragraph1:
    "My work sits between strategy, writing, creative direction, storytelling, and culture. I enjoy taking an early idea and building the language, concept, and structure that gives it momentum.",
  paragraph2:
    "This portfolio was designed as an interactive game because I believe creative work should feel like an experience, not just a collection of slides.",
  skills: [
    "Campaign Strategy",
    "Copywriting",
    "Brand Voice",
    "Creative Direction",
    "Storytelling",
    "Concept Development",
  ],
  headshotUrl: "",
  headshotAlt: "Ryne Mitra professional headshot",
};

const MEDIA_BUCKET = "portfolio-media";
const HEADSHOT_FOLDER = "headshots";
const MAX_HEADSHOT_SIZE = 10 * 1024 * 1024;
const ALLOWED_HEADSHOT_TYPES = ["image/jpeg", "image/png", "image/webp"];

function sanitizeHeadshotName(file) {
  const extension = file.name.includes(".")
    ? file.name.split(".").pop().toLowerCase()
    : "jpg";

  return `ryne-headshot-${Date.now()}.${extension}`;
}

export default function AboutPageEditor() {
  const headshotInputRef = useRef(null);
  const [form, setForm] = useState(DEFAULT_ABOUT_CONTENT);
  const [savedForm, setSavedForm] = useState(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHeadshot, setUploadingHeadshot] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  const loadContent = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("page_content")
      .select("content")
      .eq("id", "about")
      .maybeSingle();

    if (error) {
      console.error("Unable to load about content:", error);
      setErrorMessage(error.message || "Unable to load about page content.");
      setLoading(false);
      return;
    }

    const next = { ...DEFAULT_ABOUT_CONTENT, ...(data?.content ?? {}) };
    setForm(next);
    setSavedForm(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setMessage("");
    setErrorMessage("");
  }


  async function uploadHeadshot(file) {
    if (!file || uploadingHeadshot) return;

    if (!ALLOWED_HEADSHOT_TYPES.includes(file.type)) {
      setErrorMessage("Use a JPG, PNG, or WebP image for the headshot.");
      return;
    }

    if (file.size > MAX_HEADSHOT_SIZE) {
      setErrorMessage("The headshot must be 10 MB or smaller.");
      return;
    }

    setUploadingHeadshot(true);
    setMessage("");
    setErrorMessage("");

    try {
      const fileName = sanitizeHeadshotName(file);
      const storagePath = `${HEADSHOT_FOLDER}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(MEDIA_BUCKET)
        .getPublicUrl(storagePath);

      updateField("headshotUrl", publicUrlData.publicUrl);
      setMessage("Headshot uploaded. Click Save About to publish it.");
    } catch (error) {
      console.error("Headshot upload failed:", error);
      setErrorMessage(error.message || "Unable to upload the headshot.");
    } finally {
      setUploadingHeadshot(false);
      if (headshotInputRef.current) headshotInputRef.current.value = "";
    }
  }

  function removeHeadshot() {
    updateField("headshotUrl", "");
    setMessage("Headshot removed from the page. Click Save About to publish.");
  }

  async function saveContent() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("page_content")
      .upsert(
        {
          id: "about",
          content: form,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("content")
      .single();

    if (error) {
      console.error("Unable to save about content:", error);
      setErrorMessage(error.message || "Unable to save about page content.");
      setSaving(false);
      return;
    }

    const next = { ...DEFAULT_ABOUT_CONTENT, ...(data?.content ?? form) };
    setForm(next);
    setSavedForm(next);
    setMessage("About page content saved successfully.");
    setSaving(false);
  }

  return (
    <AdminLayout>
      <section className="cms-settings-page">
        <header className="cms-page-heading">
          <div>
            <p className="hero-eyebrow">PUBLIC PAGE CMS</p>
            <h2>About / Credits Page</h2>
            <span>Edit the public biography, role, specialty, and skills.</span>
          </div>
          <div className="cms-settings-heading-actions">
            <button type="button" className="cms-btn cms-btn-secondary" onClick={loadContent} disabled={loading || saving}>
              <RefreshCw size={18} className={loading ? "cms-spin" : ""} />
              Refresh
            </button>
            <button type="button" className="cms-btn cms-btn-primary" onClick={saveContent} disabled={loading || saving || !hasUnsavedChanges}>
              {saving ? <LoaderCircle size={18} className="cms-spin" /> : <Save size={18} />}
              {saving ? "Saving..." : "Save About"}
            </button>
          </div>
        </header>

        {errorMessage && <div className="cms-alert cms-alert-error">{errorMessage}</div>}
        {message && (
          <div className="cms-alert cms-alert-success">
            <Check size={18} />
            {message}
          </div>
        )}

        {loading ? (
          <div className="cms-settings-loading">
            <LoaderCircle className="cms-spin" size={36} />
            <strong>Loading about content...</strong>
          </div>
        ) : (
          <>
            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <div><h3>Page Labels</h3><p>Edit the retro labels and page title.</p></div>
              </div>
              <div className="cms-grid">
                {[
                  ["worldLabel", "World label"],
                  ["pageTitle", "Page title"],
                  ["playerLabel", "Player label"],
                  ["classLabel", "Class label"],
                ].map(([field, label]) => (
                  <div className="cms-field" key={field}>
                    <label>{label}</label>
                    <input value={form[field]} onChange={(e) => updateField(field, e.target.value)} />
                  </div>
                ))}
              </div>
            </section>

            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <div><h3>Player Information</h3><p>Edit the name, role, and specialty shown beside the avatar.</p></div>
              </div>
              <div className="cms-grid">
                {[
                  ["name", "Name"],
                  ["role", "Role"],
                  ["specialty", "Specialty"],
                  ["eyebrow", "Section eyebrow"],
                ].map(([field, label]) => (
                  <div className="cms-field" key={field}>
                    <label>{label}</label>
                    <input value={form[field]} onChange={(e) => updateField(field, e.target.value)} />
                  </div>
                ))}
              </div>
            </section>


            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <div>
                  <h3>Professional Headshot</h3>
                  <p>Upload, preview, replace, or remove the portrait shown on the public Credits/About page.</p>
                </div>
              </div>

              <input
                ref={headshotInputRef}
                className="cms-hidden-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => uploadHeadshot(event.target.files?.[0])}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px, 260px) minmax(0, 1fr)",
                  gap: "24px",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    aspectRatio: "4 / 5",
                    overflow: "hidden",
                    border: "4px solid var(--outline)",
                    background: "var(--panel)",
                    boxShadow: "7px 7px 0 var(--red)",
                  }}
                >
                  {form.headshotUrl ? (
                    <img
                      src={form.headshotUrl}
                      alt={form.headshotAlt || "Professional headshot preview"}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "grid",
                        placeItems: "center",
                        padding: "20px",
                        textAlign: "center",
                        color: "var(--muted)",
                      }}
                    >
                      No headshot uploaded yet.
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gap: "16px" }}>
                  <div className="cms-field">
                    <label>Headshot alt text</label>
                    <input
                      value={form.headshotAlt ?? ""}
                      onChange={(event) => updateField("headshotAlt", event.target.value)}
                      placeholder="Ryne Mitra professional headshot"
                    />
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <button
                      type="button"
                      className="cms-btn cms-btn-primary"
                      onClick={() => headshotInputRef.current?.click()}
                      disabled={uploadingHeadshot}
                    >
                      {uploadingHeadshot ? (
                        <LoaderCircle size={18} className="cms-spin" />
                      ) : (
                        <ImagePlus size={18} />
                      )}
                      {uploadingHeadshot
                        ? "Uploading..."
                        : form.headshotUrl
                          ? "Replace Headshot"
                          : "Upload Headshot"}
                    </button>

                    {form.headshotUrl && (
                      <button
                        type="button"
                        className="cms-btn cms-btn-danger"
                        onClick={removeHeadshot}
                        disabled={uploadingHeadshot}
                      >
                        <Trash2 size={18} />
                        Remove Headshot
                      </button>
                    )}
                  </div>

                  <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
                    JPG, PNG, or WebP. Maximum 10 MB. A vertical 4:5 portrait works best.
                  </p>
                </div>
              </div>
            </section>

            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <div><h3>Biography</h3><p>Edit the main About copy without touching the page design.</p></div>
              </div>
              <div className="cms-field">
                <label>Main statement</label>
                <textarea rows={4} value={form.headline} onChange={(e) => updateField("headline", e.target.value)} />
              </div>
              <div className="cms-field">
                <label>Paragraph one</label>
                <textarea rows={5} value={form.paragraph1} onChange={(e) => updateField("paragraph1", e.target.value)} />
              </div>
              <div className="cms-field">
                <label>Paragraph two</label>
                <textarea rows={5} value={form.paragraph2} onChange={(e) => updateField("paragraph2", e.target.value)} />
              </div>
            </section>

            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <div><h3>Skills</h3><p>Enter one skill per line.</p></div>
              </div>
              <div className="cms-field">
                <label>Skills</label>
                <textarea
                  rows={8}
                  value={(form.skills ?? []).join("\n")}
                  onChange={(e) =>
                    updateField(
                      "skills",
                      e.target.value.split("\n").map((item) => item.trim()).filter(Boolean),
                    )
                  }
                />
              </div>
            </section>
          </>
        )}
      </section>
    </AdminLayout>
  );
}