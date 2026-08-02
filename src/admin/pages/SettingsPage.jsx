import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Save,
  Settings,
} from "lucide-react";

import AdminLayout from "../layout/AdminLayout";
import { supabase } from "../../lib/supabase";

const DEFAULT_SETTINGS = {
  id: "main",
  portfolio_name: "Ryne Portfolio",
  owner_name: "Ryne",
  tagline: "",
  contact_email: "",
  resume_url: "",
  linkedin_url: "",
  instagram_url: "",
  footer_text: "",
  default_project_sort: "display_order",
  show_contact_section: true,
  maintenance_mode: false,
};

function normalizeSettings(settings) {
  return {
    id: settings?.id ?? "main",
    portfolio_name: settings?.portfolio_name ?? "",
    owner_name: settings?.owner_name ?? "",
    tagline: settings?.tagline ?? "",
    contact_email: settings?.contact_email ?? "",
    resume_url: settings?.resume_url ?? "",
    linkedin_url: settings?.linkedin_url ?? "",
    instagram_url: settings?.instagram_url ?? "",
    footer_text: settings?.footer_text ?? "",
    default_project_sort:
      settings?.default_project_sort ?? "display_order",
    show_contact_section:
      settings?.show_contact_section ?? true,
    maintenance_mode:
      settings?.maintenance_mode ?? false,
  };
}

export default function SettingsPage() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [savedForm, setSavedForm] = useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (error) {
      console.error("Unable to load settings:", error);
      setErrorMessage(
        error.message || "Unable to load website settings.",
      );
      setLoading(false);
      return;
    }

    const normalized = normalizeSettings(
      data ?? DEFAULT_SETTINGS,
    );

    setForm(normalized);
    setSavedForm(normalized);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
    setErrorMessage("");
  }

  async function saveSettings() {
    if (!form.portfolio_name.trim()) {
      setErrorMessage("Enter a portfolio name before saving.");
      return;
    }

    if (!form.owner_name.trim()) {
      setErrorMessage("Enter the portfolio owner's name.");
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const payload = {
      id: "main",
      portfolio_name: form.portfolio_name.trim(),
      owner_name: form.owner_name.trim(),
      tagline: form.tagline.trim(),
      contact_email: form.contact_email.trim(),
      resume_url: form.resume_url.trim(),
      linkedin_url: form.linkedin_url.trim(),
      instagram_url: form.instagram_url.trim(),
      footer_text: form.footer_text.trim(),
      default_project_sort: form.default_project_sort,
      show_contact_section: form.show_contact_section,
      maintenance_mode: form.maintenance_mode,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(payload, {
        onConflict: "id",
      })
      .select()
      .single();

    if (error) {
      console.error("Unable to save settings:", error);

      setErrorMessage(
        error.message || "Unable to save website settings.",
      );
      setSaving(false);
      return;
    }

    const normalized = normalizeSettings(data);

    setForm(normalized);
    setSavedForm(normalized);
    setMessage("Website settings saved successfully.");
    setSaving(false);
  }

  useEffect(() => {
    function handleSaveShortcut(event) {
      const saveShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "s";

      if (!saveShortcut) return;

      event.preventDefault();

      if (!saving && hasUnsavedChanges) {
        saveSettings();
      }
    }

    window.addEventListener("keydown", handleSaveShortcut);

    return () => {
      window.removeEventListener(
        "keydown",
        handleSaveShortcut,
      );
    };
  }, [saving, hasUnsavedChanges, form]);

  return (
    <AdminLayout>
      <section className="cms-settings-page">
        <header className="cms-page-heading">
          <div>
            <p className="hero-eyebrow">
              SITE CONFIGURATION
            </p>

            <h2>Settings</h2>

            <span>
              Manage portfolio-wide information, links, visibility,
              and display preferences.
            </span>
          </div>

          <div className="cms-settings-heading-actions">
            <button
              type="button"
              className="cms-btn cms-btn-secondary"
              onClick={loadSettings}
              disabled={loading || saving}
            >
              <RefreshCw
                size={18}
                className={loading ? "cms-spin" : ""}
              />

              Refresh
            </button>

            <button
              type="button"
              className="cms-btn cms-btn-primary"
              onClick={saveSettings}
              disabled={
                loading ||
                saving ||
                !hasUnsavedChanges
              }
            >
              {saving ? (
                <LoaderCircle
                  size={18}
                  className="cms-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </header>

        {errorMessage && (
          <div
            className="cms-alert cms-alert-error"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {message && (
          <div
            className="cms-alert cms-alert-success"
            role="status"
          >
            <Check size={18} />
            {message}
          </div>
        )}

        {loading ? (
          <div className="cms-settings-loading">
            <LoaderCircle
              className="cms-spin"
              size={36}
            />

            <strong>Loading settings...</strong>
          </div>
        ) : (
          <>
            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <Settings size={22} />

                <div>
                  <h3>Portfolio Identity</h3>

                  <p>
                    Control the main name and introduction used
                    throughout the website.
                  </p>
                </div>
              </div>

              <div className="cms-grid">
                <div className="cms-field">
                  <label htmlFor="portfolio-name">
                    Portfolio name
                  </label>

                  <input
                    id="portfolio-name"
                    value={form.portfolio_name}
                    onChange={(event) =>
                      updateField(
                        "portfolio_name",
                        event.target.value,
                      )
                    }
                    placeholder="Ryne Portfolio"
                  />
                </div>

                <div className="cms-field">
                  <label htmlFor="owner-name">
                    Owner name
                  </label>

                  <input
                    id="owner-name"
                    value={form.owner_name}
                    onChange={(event) =>
                      updateField(
                        "owner_name",
                        event.target.value,
                      )
                    }
                    placeholder="Ryne"
                  />
                </div>
              </div>

              <div className="cms-field">
                <label htmlFor="portfolio-tagline">
                  Tagline
                </label>

                <textarea
                  id="portfolio-tagline"
                  rows={4}
                  value={form.tagline}
                  onChange={(event) =>
                    updateField(
                      "tagline",
                      event.target.value,
                    )
                  }
                  placeholder="Describe the portfolio and creative work."
                />
              </div>
            </section>

            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <ExternalLink size={22} />

                <div>
                  <h3>Contact and Links</h3>

                  <p>
                    Add the public contact address, résumé, and
                    social profiles.
                  </p>
                </div>
              </div>

              <div className="cms-grid">
                <div className="cms-field">
                  <label htmlFor="contact-email">
                    Contact email
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    value={form.contact_email}
                    onChange={(event) =>
                      updateField(
                        "contact_email",
                        event.target.value,
                      )
                    }
                    placeholder="name@example.com"
                  />
                </div>

                <div className="cms-field">
                  <label htmlFor="resume-url">
                    Résumé URL
                  </label>

                  <input
                    id="resume-url"
                    type="url"
                    value={form.resume_url}
                    onChange={(event) =>
                      updateField(
                        "resume_url",
                        event.target.value,
                      )
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="cms-field">
                  <label htmlFor="linkedin-url">
                    LinkedIn URL
                  </label>

                  <input
                    id="linkedin-url"
                    type="url"
                    value={form.linkedin_url}
                    onChange={(event) =>
                      updateField(
                        "linkedin_url",
                        event.target.value,
                      )
                    }
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="cms-field">
                  <label htmlFor="instagram-url">
                    Instagram URL
                  </label>

                  <input
                    id="instagram-url"
                    type="url"
                    value={form.instagram_url}
                    onChange={(event) =>
                      updateField(
                        "instagram_url",
                        event.target.value,
                      )
                    }
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </section>

            <section className="cms-settings-card">
              <div className="cms-settings-card-heading">
                <Settings size={22} />

                <div>
                  <h3>Display Preferences</h3>

                  <p>
                    Control content visibility and default project
                    organization.
                  </p>
                </div>
              </div>

              <div className="cms-grid">
                <div className="cms-field">
                  <label htmlFor="footer-text">
                    Footer text
                  </label>

                  <input
                    id="footer-text"
                    value={form.footer_text}
                    onChange={(event) =>
                      updateField(
                        "footer_text",
                        event.target.value,
                      )
                    }
                    placeholder="© Ryne Portfolio"
                  />
                </div>

                <div className="cms-field">
                  <label htmlFor="default-project-sort">
                    Default project sorting
                  </label>

                  <select
                    id="default-project-sort"
                    value={form.default_project_sort}
                    onChange={(event) =>
                      updateField(
                        "default_project_sort",
                        event.target.value,
                      )
                    }
                  >
                    <option value="display_order">
                      Custom display order
                    </option>

                    <option value="newest">
                      Newest first
                    </option>

                    <option value="oldest">
                      Oldest first
                    </option>

                    <option value="alphabetical">
                      Alphabetical
                    </option>
                  </select>
                </div>
              </div>

              <div className="cms-settings-toggles">
                <label className="cms-settings-toggle">
                  <input
                    type="checkbox"
                    checked={form.show_contact_section}
                    onChange={(event) =>
                      updateField(
                        "show_contact_section",
                        event.target.checked,
                      )
                    }
                  />

                  <span className="cms-settings-switch" />

                  <span>
                    <strong>Show contact section</strong>

                    <small>
                      Allow visitors to access the website contact
                      section.
                    </small>
                  </span>
                </label>

                <label className="cms-settings-toggle">
                  <input
                    type="checkbox"
                    checked={form.maintenance_mode}
                    onChange={(event) =>
                      updateField(
                        "maintenance_mode",
                        event.target.checked,
                      )
                    }
                  />

                  <span className="cms-settings-switch" />

                  <span>
                    <strong>Maintenance mode</strong>

                    <small>
                      Store the maintenance preference for future
                      public-site integration.
                    </small>
                  </span>
                </label>
              </div>
            </section>

            <footer className="cms-settings-savebar">
              <div>
                <strong>
                  {hasUnsavedChanges
                    ? "Unsaved changes"
                    : "Everything is saved"}
                </strong>

                <span>
                  Use Cmd + S or Ctrl + S to save.
                </span>
              </div>

              <button
                type="button"
                className="cms-btn cms-btn-primary"
                onClick={saveSettings}
                disabled={
                  saving ||
                  !hasUnsavedChanges
                }
              >
                {saving ? (
                  <LoaderCircle
                    size={18}
                    className="cms-spin"
                  />
                ) : (
                  <Save size={18} />
                )}

                {saving
                  ? "Saving..."
                  : "Save Settings"}
              </button>
            </footer>
          </>
        )}
      </section>
    </AdminLayout>
  );
}