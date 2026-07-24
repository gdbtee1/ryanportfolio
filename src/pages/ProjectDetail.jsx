import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  UserRound,
} from "lucide-react";

import { getProjectById, projects } from "../data/projects";

const fadeFromLeft = {
  initial: {
    opacity: 0,
    x: -40,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  transition: {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1],
  },
};

const coverReveal = {
  initial: {
    opacity: 0,
    scale: 0.94,
    rotate: 2,
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
  },
  transition: {
    duration: 0.65,
    delay: 0.08,
    ease: [0.22, 1, 0.36, 1],
  },
};


function PixelProjectIcon({ type, large = false }) {
  return (
    <div
      className={`pixel-project-icon pixel-${type} ${
        large ? "pixel-project-icon-large" : ""
      }`}
      aria-hidden="true"
    >
      <span className="pixel-part pixel-part-1" />
      <span className="pixel-part pixel-part-2" />
      <span className="pixel-part pixel-part-3" />
      <span className="pixel-part pixel-part-4" />
      <span className="pixel-part pixel-part-5" />
      <span className="pixel-part pixel-part-6" />
    </div>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = getProjectById(projectId);

  if (!project) {
    return (
      <section className="error-page">
        <h1>CAMPAIGN FILE NOT FOUND</h1>

        <button type="button" onClick={() => navigate("/game-room")}>
          RETURN TO GAME ROOM
        </button>
      </section>
    );
  }

  const currentIndex = projects.findIndex(
    (item) => item.id === project.id,
  );

  const nextProject =
    projects[(currentIndex + 1) % projects.length];

  const returnToPortfolio = () => {
    navigate(`/portfolio/${project.category}`);
  };

  const openNextProject = () => {
    navigate(`/project/${nextProject.id}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className={`project-detail-page detail-${project.accent}`}>
      <header className="project-detail-header">
        <button
          type="button"
          className="icon-retro-button"
          onClick={returnToPortfolio}
          aria-label="Return to portfolio"
        >
          <ArrowLeft aria-hidden="true" />
        </button>

        <div className="project-file-status">
          <p>CAMPAIGN FILE / {project.year}</p>
          <span>FILE STATUS: COMPLETE</span>
        </div>

        <button
          type="button"
          className="next-project-button"
          onClick={openNextProject}
        >
          <span>NEXT FILE</span>
          <ArrowRight aria-hidden="true" />
        </button>
      </header>

      <div className="project-detail-hero">
        <motion.div
          className="project-title-block"
          {...fadeFromLeft}
        >
          <p className="project-detail-eyebrow">
            {project.category.toUpperCase()} WORLD
          </p>

          <h1>{project.title}</h1>

          <p className="project-detail-description">
            {project.description}
          </p>
        </motion.div>

        <motion.div
          className="project-cover-art"
          {...coverReveal}
        >
          <div className="cover-art-grid" aria-hidden="true" />

          <div className="cover-art-content">
            <span>RYNE MITRA PRESENTS</span>

          <div className="project-logo-wrapper">
              <PixelProjectIcon type={project.iconType} large />
            </div>

            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="play-campaign-button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "22px",
                  padding: "14px 18px",
                  border: "4px solid #1b1b1b",
                  background: "#ffd34f",
                  color: "#1b1b1b",
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "0.65rem",
                  lineHeight: 1.5,
                  textDecoration: "none",
                  boxShadow: "6px 6px 0 #e65b4f",
                  position: "relative",
                  zIndex: 20,
                }}
              >
                ▶ VIEW ORIGINAL CAMPAIGN
              </a>
            )}

            <small>CAMPAIGN EDITION</small>
          </div>

          <div className="cover-art-pixels" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="project-information-grid">
        <article className="project-story-card project-wide-card">
          <span className="card-number">01</span>
          <p className="project-card-label">THE CHALLENGE</p>
          <h2>What needed to be solved?</h2>
          <p>{project.challenge}</p>
        </article>

        <article className="project-story-card">
          <span className="card-number">02</span>
          <p className="project-card-label">PLAYER ROLE</p>

          <div className="project-role-list">
            <div>
              <UserRound aria-hidden="true" />

              <span>
                <small>Client</small>
                {project.client}
              </span>
            </div>

            <div>
              <BriefcaseBusiness aria-hidden="true" />

              <span>
                <small>Role</small>
                {project.role}
              </span>
            </div>

            <div>
              <Calendar aria-hidden="true" />

              <span>
                <small>Year</small>
                {project.year}
              </span>
            </div>
          </div>
        </article>

        <article className="project-story-card">
          <span className="card-number">03</span>
          <p className="project-card-label">SERVICES</p>

          <div className="service-chip-list">
            {project.services.map((service) => (
              <span key={service}>{service}</span>
            ))}
          </div>
        </article>

        <article className="project-story-card project-wide-card">
          <span className="card-number">04</span>
          <p className="project-card-label">THE SOLUTION</p>
          <h2>How the campaign came together</h2>
          <p>{project.solution}</p>
        </article>

        <article className="project-story-card project-wide-card">
          <span className="card-number">05</span>
          <p className="project-card-label">FINAL SCORE</p>
          <h2>The outcome</h2>
          <p>{project.result}</p>

          <div className="result-score">
            <div>
              <strong>+100</strong>
              <span>Clarity</span>
            </div>

            <div>
              <strong>+100</strong>
              <span>Story</span>
            </div>

            <div>
              <strong>+100</strong>
              <span>Impact</span>
            </div>
          </div>
        </article>
      </div>

      {project.gallery?.length > 0 && (
        <section className="project-gallery-section">
          <div className="project-gallery-heading">
            <p>CAMPAIGN ASSETS</p>
            <h2>Project gallery</h2>
          </div>

          <div className="project-gallery-grid">
            {project.gallery.map((image, index) => (
              <motion.figure
                key={`${image.src}-${index}`}
                initial={{
                  opacity: 0,
                  y: 28,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.06,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
              >
                <img
                  src={image.src}
                  alt={
                    image.alt ||
                    `${project.title} campaign asset ${index + 1}`
                  }
                  loading="lazy"
                />

                {image.caption && (
                  <figcaption>{image.caption}</figcaption>
                )}
              </motion.figure>
            ))}
          </div>
        </section>
      )}

      <section className="project-next-section">
        <p>NEXT CAMPAIGN</p>
        <h2>{nextProject.title}</h2>

        <button
          type="button"
          className="large-next-button"
          onClick={openNextProject}
        >
          <span>LOAD NEXT FILE</span>
          <ArrowRight aria-hidden="true" />
        </button>
      </section>
    </section>
  );
}