import { AnimatePresence } from "framer-motion";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import GameRoom from "./pages/GameRoom";
import Portfolio from "./pages/Portfolio";
import ProjectDetail from "./pages/ProjectDetail";
import Credits from "./pages/Credits";
import Contact from "./pages/Contact";

import SoundToggle from "./components/SoundToggle";
import PixelCursor from "./components/PixelCursor";
import ScreenTransition from "./components/ScreenTransition";

// Admin CMS
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import ProjectsPage from "./admin/pages/ProjectsPage";
import MediaPage from "./admin/pages/MediaPage";
import DocumentsPage from "./admin/pages/DocumentsPage";
import SettingsPage from "./admin/pages/SettingsPage";
import ProtectedAdminRoute from "./admin/components/ProtectedAdminRoute";
import AdminLayout from "./admin/layout/AdminLayout";

function AnimatedRoutes() {
  const location = useLocation();

  if (location.pathname.startsWith("/admin")) {
    return (
      <Routes>
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/projects"
          element={
            <ProtectedAdminRoute>
              <ProjectsPage />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/media"
          element={
            <ProtectedAdminRoute>
              <MediaPage />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/documents"
          element={
            <ProtectedAdminRoute>
              <DocumentsPage />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedAdminRoute>
              <SettingsPage />
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/*"
          element={<Navigate to="/admin" replace />}
        />
      </Routes>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <ScreenTransition>
              <Home />
            </ScreenTransition>
          }
        />

        <Route
          path="/game-room"
          element={
            <ScreenTransition>
              <GameRoom />
            </ScreenTransition>
          }
        />

        <Route
          path="/portfolio/:category"
          element={
            <ScreenTransition>
              <Portfolio />
            </ScreenTransition>
          }
        />

        <Route
          path="/project/:projectId"
          element={
            <ScreenTransition>
              <ProjectDetail />
            </ScreenTransition>
          }
        />

        <Route
          path="/credits"
          element={
            <ScreenTransition>
              <Credits />
            </ScreenTransition>
          }
        />

        <Route
          path="/contact"
          element={
            <ScreenTransition>
              <Contact />
            </ScreenTransition>
          }
        />

        <Route
          path="*"
          element={
            <ScreenTransition>
              <Home />
            </ScreenTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="app-shell">
      {!isAdminPage && <PixelCursor />}
      {!isAdminPage && <SoundToggle />}

      <AnimatedRoutes />
    </div>
  );
}