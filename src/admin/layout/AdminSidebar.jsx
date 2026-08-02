import {
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Projects",
    path: "/admin/projects",
    icon: FolderKanban,
  },
  {
    name: "Media",
    path: "/admin/media",
    icon: Image,
  },
  {
    name: "Documents",
    path: "/admin/documents",
    icon: FileText,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  return (
    <aside className="cms-sidebar">
      <div className="cms-sidebar-brand">
        <span className="cms-sidebar-brand-mark">R</span>

        <div>
          <strong>RYNE CMS</strong>
          <small>PORTFOLIO SYSTEM</small>
        </div>
      </div>

      <nav className="cms-sidebar-nav" aria-label="CMS navigation">
        {links.map(({ name, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `cms-sidebar-link${isActive ? " active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="cms-sidebar-footer">
        <span className="cms-sidebar-status-light" />

        <div>
          <strong>System Online</strong>
          <small>Supabase connected</small>
        </div>
      </div>
    </aside>
  );
}