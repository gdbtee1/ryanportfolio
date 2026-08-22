import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, LoaderCircle, RefreshCw, Save } from "lucide-react";

import AdminLayout from "../layout/AdminLayout";
import { supabase } from "../../lib/supabase";

const DEFAULT_HOME_CONTENT = {
  playerLabel: "PLAYER 01",
  ownerName: "RYNE MITRA",
  systemLabel: "PORTFOLIO OS",
  eyebrow: "CAMPAIGN MODE / EST. 2022",
  headline: "HELPING BRANDS",
  headlineAccent: "GET HIGH SCORES.",
  description:
    "Every great campaign starts with a story. Every great brand starts with the right words. Here’s mine.",
  stat1Value: "03",
  stat1Label: "Worlds",
  stat2Value: "10+",
  stat2Label: "Campaigns",
  stat3Value: "∞",
  stat3Label: "Ideas",
  footerLeft: "© 2026 RYNE MITRA",
  footerRight: "ENTER / SPACE TO START",
};

export default function HomePageEditor() {
  const [form, setForm] = useState(DEFAULT_HOME_CONTENT);
  const [savedForm, setSavedForm] = useState(DEFAULT_HOME_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      .eq("id", "home")
      .maybeSingle();

    if (error) {
      console.error("Unable to load home content:", error);
      setErrorMessage(error.message || "Unable to load home page content.");
      setLoading(false);
      return;
    }

    const next = { ...DEFAULT_HOME_CONTENT, ...(data?.content ?? {}) };
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

  async function saveContent() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("page_content")
      .upsert(
        {
          id: "home",
          content: form,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("content")
      .single();

    if (error) {
      console.error("Unable to save home content:", error);
      setErrorMessage(error.message || "Unable to save home page content.");
      setSaving(false);
      return;
    }

    const next = { ...DEFAULT_HOME_CONTENT, ...(data?.content ?? form) };
    setForm(next);
    setSavedForm(next);
    setMessage("Home page content saved successfully.");
    setSaving(false);
  }

  return (
    <AdminLayout>
      <section className="cms-settings-page">
        <header className="cms-page-heading">
          <div>
            <p className="hero-eyebrow">PUBLIC PAGE CMS</p>
            <h2>Home Page</h2>
            <span>Edit the text shown on the public portfolio homepage.</span>
          </div>

          <div className="cms-settings-heading-actions">
            <button
              type="button"
              className="cms-btn cms-btn-secondary"
              onClick={loadContent}
              disabled={loading || saving}
            >
              <RefreshCw size={18} className={loading ? "cms-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              className="cms-btn cms-btn-primary"
              onClick={saveContent}
              disabled={loading || saving || !hasUnsavedChanges}
            >
              {saving ? <LoaderCircle size={18} className="cms-spin" /> : <Save size={18} />}
              {saving ? "Saving..." : "Save Home"}
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
            <strong>Loading home content...</strong>
          </div>
        ) : (
          <>
            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <div>
                  <h3>Top Labels</h3>
                  <p>Control the small labels across the top of the opening screen.</p>
                </div>
              </div>
              <div className="cms-grid">
                {[
                  ["playerLabel", "Player label"],
                  ["ownerName", "Owner name"],
                  ["systemLabel", "System label"],
                  ["eyebrow", "Hero eyebrow"],
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
                  <h3>Hero Copy</h3>
                  <p>Edit the main headline and supporting copy.</p>
                </div>
              </div>
              <div className="cms-grid">
                <div className="cms-field">
                  <label>Main headline</label>
                  <input value={form.headline} onChange={(e) => updateField("headline", e.target.value)} />
                </div>
                <div className="cms-field">
                  <label>Accent headline</label>
                  <input value={form.headlineAccent} onChange={(e) => updateField("headlineAccent", e.target.value)} />
                </div>
              </div>
              <div className="cms-field">
                <label>Description</label>
                <textarea rows={5} value={form.description} onChange={(e) => updateField("description", e.target.value)} />
              </div>
            </section>

            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <div>
                  <h3>Stats</h3>
                  <p>Edit all three homepage stat counters and labels.</p>
                </div>
              </div>
              <div className="cms-grid">
                {[1, 2, 3].flatMap((n) => [
                  <div className="cms-field" key={`v${n}`}>
                    <label>Stat {n} value</label>
                    <input value={form[`stat${n}Value`]} onChange={(e) => updateField(`stat${n}Value`, e.target.value)} />
                  </div>,
                  <div className="cms-field" key={`l${n}`}>
                    <label>Stat {n} label</label>
                    <input value={form[`stat${n}Label`]} onChange={(e) => updateField(`stat${n}Label`, e.target.value)} />
                  </div>,
                ])}
              </div>
            </section>

            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <div>
                  <h3>Footer</h3>
                  <p>Edit the two labels at the bottom of the homepage.</p>
                </div>
              </div>
              <div className="cms-grid">
                <div className="cms-field">
                  <label>Footer left</label>
                  <input value={form.footerLeft} onChange={(e) => updateField("footerLeft", e.target.value)} />
                </div>
                <div className="cms-field">
                  <label>Footer right</label>
                  <input value={form.footerRight} onChange={(e) => updateField("footerRight", e.target.value)} />
                </div>
              </div>
            </section>
          </>
        )}
      </section>
    </AdminLayout>
  );
}