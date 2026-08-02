import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminLayout({ children }) {
  return (
    <div className="cms-app">
      <AdminSidebar />

      <div className="cms-app-main">
        <AdminTopbar />

        <main className="cms-app-content">
          {children}
        </main>
      </div>
    </div>
  );
}