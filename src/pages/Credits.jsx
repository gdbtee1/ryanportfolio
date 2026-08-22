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
  headshotUrl: "",
  headshotAlt: "Ryne Mitra professional headshot",
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

          <div
            className="credits-headshot-frame"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "360px",
              aspectRatio: "4 / 5",
              margin: "24px auto 26px",
              overflow: "hidden",
              border: "5px solid #100a12",
              background:
                "linear-gradient(135deg, rgba(255,192,158,.12), rgba(101,214,154,.08)), #24132b",
              boxShadow: "10px 10px 0 #58192b",
            }}
          >
            {content.headshotUrl ? (
              <img
                src={content.headshotUrl}
                alt={content.headshotAlt || `${content.name} professional headshot`}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  padding: "28px",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ transform: "scale(.78)", transformOrigin: "center" }}>
                    <PixelAvatar outfit="classic" />
                  </div>

                  <p
                    style={{
                      margin: "-36px 0 0",
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: "8px",
                      lineHeight: 1.8,
                      color: "#ffc09e",
                    }}
                  >
                    PROFESSIONAL HEADSHOT
                    <br />
                    COMING SOON
                  </p>
                </div>
              </div>
            )}

            <span
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                padding: "8px 10px",
                border: "3px solid #100a12",
                fontFamily: '"Press Start 2P", monospace',
                fontSize: "7px",
                color: "#120b18",
                background: "#ffd166",
                boxShadow: "4px 4px 0 #8f2436",
              }}
            >
              PLAYER PORTRAIT
            </span>
          </div>

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