import { Link } from "react-router-dom";
import {
  ExternalLink,
  FileText,
  FolderKanban,
  Image,
  LogOut,
  Settings,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

function AdminDashboard() {
  const { user } = useAuth();

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <section className="cms-dashboard">
      <header className="cms-page-heading">
        <div>
          <p className="hero-eyebrow">RYNE PORTFOLIO CMS</p>
          <h2>Content Dashboard</h2>
          <span>
            Signed in as <strong>{user?.email}</strong>
          </span>
        </div>

        <div className="cms-editor-actions">
          <Link
            to="/"
            className="cms-btn cms-btn-secondary"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={17} />
            View Website
          </Link>

          <button
            type="button"
            onClick={signOut}
            className="cms-btn cms-btn-danger"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="cms-grid">
        <Link
          to="/admin/projects"
          className="cms-section"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <p className="hero-eyebrow">01</p>
          <FolderKanban size={30} />
          <h2>Projects</h2>
          <p>
            Create, edit, publish, delete, and organize portfolio projects.
          </p>
          <span className="cms-btn cms-btn-primary">
            Open Project Manager
          </span>
        </Link>

        <Link
          to="/admin/media"
          className="cms-section"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <p className="hero-eyebrow">02</p>
          <Image size={30} />
          <h2>Media Library</h2>
          <p>
            Upload and manage portfolio images and video assets.
          </p>
          <span className="cms-btn cms-btn-primary">
            Open Media Library
          </span>
        </Link>

        <Link
          to="/admin/documents"
          className="cms-section"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <p className="hero-eyebrow">03</p>
          <FileText size={30} />
          <h2>Documents</h2>
          <p>
            Upload and manage PDFs, Word files, PowerPoints, and archives.
          </p>
          <span className="cms-btn cms-btn-primary">
            Open Documents
          </span>
        </Link>

        <Link
          to="/admin/settings"
          className="cms-section"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <p className="hero-eyebrow">04</p>
          <Settings size={30} />
          <h2>Settings</h2>
          <p>
            Manage CMS preferences and account settings.
          </p>
          <span className="cms-btn cms-btn-primary">
            Open Settings
          </span>
        </Link>
      </div>
    </section>
  );
}

export default AdminDashboard;