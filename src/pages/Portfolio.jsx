import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";

import LoadingScreen from "../components/LoadingScreen";
import { getProjectsByCategory } from "../data/projects";

const categoryContent = {
  agency: {
    eyebrow: "WORLD 01",
    title: "AGENCY WORK",
    description:
      "Professional campaign work, strategy, writing, messaging, and creative direction.",
  },
  student: {
    eyebrow: "WORLD 02",
    title: "STUDENT WORK",
    description:
      "Conceptual work, experiments, research, and campaign worlds developed through study.",
  },
};

export default function Portfolio() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const content = categoryContent[category];

  const projects = useMemo(
    () => getProjectsByCategory(category),
    [category],
  );

  useEffect(() => {
    setLoading(true);

    const timeout = window.setTimeout(() => {
      setLoading(false);
    }, 950);

    return () => window.clearTimeout(timeout);
  }, [category]);

  if (!content) {
    return (
      <section className="error-page">
        <h1>WORLD NOT FOUND</h1>
        <button onClick={() => navigate("/game-room")}>
          RETURN TO GAME ROOM
        </button>
      </section>
    );
  }

  if (loading) {
    return (
      <LoadingScreen
        title={`LOADING ${content.title}`}
        subtitle="Reading cartridge data..."
      />
    );
  }

  return (
    <section className={`portfolio-page portfolio-${category}`}>
      <header className="portfolio-header">
        <button
          className="icon-retro-button"
          onClick={() => navigate("/game-room")}
          aria-label="Return to game room"
        >
          <ArrowLeft />
        </button>

        <div className="portfolio-heading">
          <p>{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <span>{content.description}</span>
        </div>

        <button
          className="icon-retro-button"
          onClick={() => navigate("/")}
          aria-label="Return home"
        >
          <Home />
        </button>
      </header>

      <div className="portfolio-status-bar">
        <span>CARTRIDGE LOADED</span>
        <span>{projects.length} CAMPAIGNS FOUND</span>
        <span>SELECT A FILE</span>
      </div>

      <div className="project-cartridge-grid">
        {projects.map((project, index) => (
          <motion.button
            key={project.id}
            className={`project-cartridge project-accent-${project.accent}`}
            onClick={() => navigate(`/project/${project.id}`)}
            initial={{
              opacity: 0,
              y: 45,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.12,
            }}
            whileHover={{
              y: -12,
              rotate: index % 2 === 0 ? -1 : 1,
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            <div className="project-cartridge-ridges">
              {Array.from({ length: 9 }).map((_, ridgeIndex) => (
                <span key={ridgeIndex} />
              ))}
            </div>

            <div className="project-cartridge-label">
              <div className="project-file-number">
                FILE {String(index + 1).padStart(2, "0")}
              </div>

              <div className="project-pixel-icon">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <h2>{project.title}</h2>
              <p>{project.client}</p>

              <div className="project-label-meta">
                <span>{project.year}</span>
                <span>{project.role}</span>
              </div>
            </div>

            <div className="project-cartridge-footer">
              <span>OPEN CAMPAIGN</span>
              <ArrowRight />
            </div>
          </motion.button>
        ))}
      </div>

      <footer className="portfolio-footer">
        <span>USE MOUSE OR TAB TO SELECT</span>

        <button onClick={() => navigate("/contact")}>
          CONTACT PLAYER
        </button>
      </footer>
    </section>
  );
}