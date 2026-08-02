import { ExternalLink, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function AdminTopbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Unable to sign out:", error);
      return;
    }

    navigate("/admin/login", { replace: true });
  }

  return (
    <header className="cms-topbar">
      <div className="cms-topbar-copy">
        <p>RYNE PORTFOLIO CMS</p>
        <h1>Portfolio Content Manager</h1>
        <span>Manage portfolio content and assets</span>
      </div>

      <div className="cms-topbar-account">
        <div className="cms-topbar-user">
          <span className="cms-topbar-avatar">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </span>

          <div>
            <strong>{user?.email || "Administrator"}</strong>
            <small>Administrator</small>
          </div>
        </div>

        <div className="cms-topbar-actions">
          <Link
            to="/"
            className="cms-btn cms-btn-secondary"
          >
            <ExternalLink size={17} />
            View Website
          </Link>

          <button
            type="button"
            className="cms-btn cms-btn-danger"
            onClick={handleSignOut}
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}