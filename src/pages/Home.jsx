import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import {
  playRetroSound,
  unlockRetroAudio,
} from "../hooks/useRetroSound";
import PixelAvatar from "../components/PixelAvatar";
import RetroButton from "../components/RetroButton";

const outfits = ["classic", "explorer", "racer", "wizard"];

export default function Home() {
  const navigate = useNavigate();
  const [outfitIndex, setOutfitIndex] = useState(0);
  const [started, setStarted] = useState(false);

  const selectedOutfit = outfits[outfitIndex];

  const changeOutfit = (direction) => {
    setOutfitIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;

      if (nextIndex < 0) {
        return outfits.length - 1;
      }

      if (nextIndex >= outfits.length) {
        return 0;
      }

      return nextIndex;
    });
  };
const startExperience = () => {
  if (started) {
    return;
  }

  unlockRetroAudio();
  playRetroSound("start");
  setStarted(true);

  window.setTimeout(() => {
    navigate("/game-room");
  }, 650);
};
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        startExperience();
      }

      if (event.key === "ArrowLeft") {
        changeOutfit(-1);
      }

      if (event.key === "ArrowRight") {
        changeOutfit(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [started]);

  return (
    <section className={`home-page ${started ? "is-starting" : ""}`}>
      <div className="pixel-stars" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--star-x": `${(index * 37) % 100}%`,
              "--star-y": `${(index * 61) % 100}%`,
              "--star-delay": `${(index % 7) * 0.18}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="home-top-line"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <span>PLAYER 01</span>
        <span>RYNE MITRA</span>
        <span>PORTFOLIO OS</span>
      </motion.div>

      <div className="hero-layout">
        <motion.div
          className="hero-copy"
          initial={{
            opacity: 0,
            x: -50,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <p className="hero-eyebrow">CAMPAIGN MODE / EST. 2022</p>

          <h1>
            HELPING BRANDS
            <span>GET HIGH SCORES.</span>
          </h1>

          <p className="hero-description">
            Every great campaign starts with a story. Every great brand starts
            with the right words. Here’s mine.
          </p>

          <div className="hero-stat-row">
            <div>
              <strong>03</strong>
              <span>Worlds</span>
            </div>

            <div>
              <strong>10+</strong>
              <span>Campaigns</span>
            </div>

            <div>
              <strong>∞</strong>
              <span>Ideas</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="avatar-stage"
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.15,
            duration: 0.55,
          }}
        >
          <div className="avatar-stage-header">
            <span>SELECT CHARACTER</span>
            <span>01 / 04</span>
          </div>

          <div className="avatar-selector">
            <button
              className="avatar-arrow"
              onClick={() => changeOutfit(-1)}
              aria-label="Previous outfit"
            >
              <ChevronLeft />
            </button>

            <PixelAvatar outfit={selectedOutfit} />

            <button
              className="avatar-arrow"
              onClick={() => changeOutfit(1)}
              aria-label="Next outfit"
            >
              <ChevronRight />
            </button>
          </div>

          <p className="selector-help">
            Use arrow keys to preview alternate character styles.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="start-panel"
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.45,
        }}
      >
        <RetroButton
          className="start-button"
          onClick={startExperience}
          disabled={started}
        >
          {started ? "LOADING WORLD..." : "PRESS START"}
        </RetroButton>

        <p>
          <Volume2 size={14} />
          Best experienced with sound
        </p>
      </motion.div>

      <div className="home-footer">
        <span>© 2026 RYNE MITRA</span>
        <span>ENTER / SPACE TO START</span>
      </div>

      {started && (
        <motion.div
          className="start-flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 0.65,
          }}
        />
      )}
    </section>
  );
}