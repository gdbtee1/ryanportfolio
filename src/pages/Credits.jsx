import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

import PixelAvatar from "../components/PixelAvatar";

export default function Credits() {
  const navigate = useNavigate();

  return (
    <section className="credits-page">
      <header className="credits-header">
        <button
          className="icon-retro-button"
          onClick={() => navigate("/game-room")}
          aria-label="Return to game room"
        >
          <ArrowLeft />
        </button>

        <div>
          <p>WORLD 03</p>
          <h1>CREDITS</h1>
        </div>

        <button
          className="text-link-button"
          onClick={() => navigate("/contact")}
        >
          CONTACT
        </button>
      </header>

      <div className="credits-layout">
        <motion.div
          className="credits-avatar-card"
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
        >
          <div className="credits-player-label">
            <span>PLAYER 01</span>
            <span>CREATIVE CLASS</span>
          </div>

          <PixelAvatar outfit="classic" />

          <div className="player-stat-panel">
            <div>
              <span>NAME</span>
              <strong>Ryne Mitra</strong>
            </div>

            <div>
              <span>ROLE</span>
              <strong>Campaign Creative</strong>
            </div>

            <div>
              <span>SPECIALTY</span>
              <strong>Words + Worlds</strong>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="credits-copy"
          initial={{
            opacity: 0,
            x: 40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
        >
          <p className="credits-eyebrow">
            <Sparkles />
            ABOUT THE PLAYER
          </p>

          <h2>
            I build campaign ideas that give brands a clearer voice
            and a world people can remember.
          </h2>

          <p>
            My work sits between strategy, writing, creative direction,
            storytelling, and culture. I enjoy taking an early idea and
            building the language, concept, and structure that gives it
            momentum.
          </p>

          <p>
            This portfolio was designed as an interactive game because
            I believe creative work should feel like an experience, not
            just a collection of slides.
          </p>

          <div className="credits-skills">
            <span>Campaign Strategy</span>
            <span>Copywriting</span>
            <span>Brand Voice</span>
            <span>Creative Direction</span>
            <span>Storytelling</span>
            <span>Concept Development</span>
          </div>

          <button
            className="credits-contact-button"
            onClick={() => navigate("/contact")}
          >
            <Mail />
            START A CONVERSATION
          </button>
        </motion.div>
      </div>

      <div className="rolling-credits">
        <div className="rolling-credit-track">
          <span>DESIGNED BY RYNE MITRA</span>
          <span>WRITTEN BY RYNE MITRA</span>
          <span>CREATIVE DIRECTION BY RYNE MITRA</span>
          <span>THANK YOU FOR PLAYING</span>
          <span>DESIGNED BY RYNE MITRA</span>
          <span>WRITTEN BY RYNE MITRA</span>
        </div>
      </div>
    </section>
  );
}