import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, GraduationCap, Sparkles } from "lucide-react";
import { playRetroSound } from "../hooks/useRetroSound";
import RetroTV from "../components/RetroTV";
import GameCartridge from "../components/GameCartridge";

const worlds = [
  {
    title: "AGENCY WORLD",
    subtitle: "Professional campaigns",
    icon: <BriefcaseBusiness />,
    destination: "/portfolio/agency",
  },
  {
    title: "STUDENT WORLD",
    subtitle: "Experiments and studies",
    icon: <GraduationCap />,
    destination: "/portfolio/student",
  },
  {
    title: "CREDITS",
    subtitle: "About the player",
    icon: <Sparkles />,
    destination: "/credits",
  },
];

export default function GameRoom() {
  const navigate = useNavigate();

  return (
    <section className="game-room-page">
      <header className="game-room-header">
        <div>
          <p>RYNE MITRA PORTFOLIO SYSTEM</p>
          <h1>CHOOSE YOUR WORLD</h1>
        </div>

        <button
          className="text-link-button"
          onClick={() => navigate("/contact")}
        >
          CONTACT PLAYER
        </button>
      </header>

      <div className="game-room-content">
        <div className="tv-column">
          <RetroTV />

          <div className="tv-console-message">
            <span className="status-light" />
            SYSTEM READY — SELECT ONE OF THREE WORLDS
          </div>
        </div>

        <div className="world-selection">
          <div className="world-selection-heading">
            <span>AVAILABLE GAMES</span>
            <span>3 FILES FOUND</span>
          </div>

          <div className="cartridge-grid">
            {worlds.map((world, index) => (
              <GameCartridge
                key={world.title}
                title={world.title}
                subtitle={world.subtitle}
                icon={world.icon}
                index={index}
               onClick={() => {
  playRetroSound("load");

  window.setTimeout(() => {
    navigate(world.destination);
  }, 220);
}}
              />
            ))}
          </div>

          <div className="game-room-instructions">
            <p>
              <strong>HOW TO PLAY:</strong> Select a cartridge to load a
              portfolio world.
            </p>
            <p>Discover campaigns, strategy, writing and creative direction.</p>
          </div>
        </div>
      </div>

      <footer className="game-room-footer">
        <span>PLAYER 01</span>
        <span>HIGH SCORE: BRAND IMPACT</span>
        <span>VERSION 1.0</span>
      </footer>
    </section>
  );
}