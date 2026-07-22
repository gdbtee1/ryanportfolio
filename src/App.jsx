import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import GameRoom from "./pages/GameRoom";
import Portfolio from "./pages/Portfolio";
import ProjectDetail from "./pages/ProjectDetail";
import Credits from "./pages/Credits";
import Contact from "./pages/Contact";

import SoundToggle from "./components/SoundToggle";
import PixelCursor from "./components/PixelCursor";
import ScreenTransition from "./components/ScreenTransition";

function AnimatedRoutes() {
  const location = useLocation();

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
  return (
    <div className="app-shell">
      <PixelCursor />
      <SoundToggle />
      <AnimatedRoutes />
    </div>
  );
}