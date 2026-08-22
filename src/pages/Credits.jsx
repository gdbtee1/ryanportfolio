import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

import PixelAvatar from "../components/PixelAvatar";
import { supabase } from "../lib/supabase";

const DEFAULT_ABOUT_CONTENT = {
  worldLabel: "WORLD 03",
  pageTitle: "CREDITS",
  playerLabel: "PLAYER 01",
  classLabel: "CREATIVE CLASS",
  name: "Ryne Mitra",
  role: "Campaign Creative",
  specialty: "Words + Worlds",
  eyebrow: "ABOUT THE PLAYER",
  headline: "I build campaign ideas that give brands a clearer voice and a world people can remember.",
  paragraph1: "My work sits between strategy, writing, creative direction, storytelling, and culture. I enjoy taking an early idea and building the language, concept, and structure that gives it momentum.",
  paragraph2: "This portfolio was designed as an interactive game because I believe creative work should feel like an experience, not just a collection of slides.",
  skills: ["Campaign Strategy", "Copywriting", "Brand Voice", "Creative Direction", "Storytelling", "Concept Development"],
};

export default function Credits() {
  const navigate = useNavigate();
  const [content, setContent] = useState(DEFAULT_ABOUT_CONTENT);

  useEffect(() => {
    let active = true;

    async function loadAboutContent() {
      const { data, error } = await supabase
        .from("page_content")
        .select("content")
        .eq("id", "about")
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Unable to load about CMS content:", error);
        return;
      }

      if (data?.content) {
        setContent((current) => ({ ...current, ...data.content }));
      }
    }

    loadAboutContent();

    return () => {
      active = false;
    };
  }, []);

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
          <p>{content.worldLabel}</p>
          <h1>{content.pageTitle}</h1>
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
            <span>{content.playerLabel}</span>
            <span>{content.classLabel}</span>
          </div>

          <PixelAvatar outfit="classic" />

          <div className="player-stat-panel">
            <div>
              <span>NAME</span>
              <strong>{content.name}</strong>
            </div>

            <div>
              <span>ROLE</span>
              <strong>{content.role}</strong>
            </div>

            <div>
              <span>SPECIALTY</span>
              <strong>{content.specialty}</strong>
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
            {content.eyebrow}
          </p>

          <h2>{content.headline}</h2>

          <p>{content.paragraph1}</p>

          <p>{content.paragraph2}</p>

          <div className="credits-skills">
            {(content.skills ?? []).map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
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