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

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = getProjectById(projectId);

  if (!project) {
    return (
      <section className="error-page">
        <h1>CAMPAIGN FILE NOT FOUND</h1>

        <button onClick={() => navigate("/game-room")}>
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

  return (
    <section className={`project-detail-page detail-${project.accent}`}>
      <header className="project-detail-header">
        <button
          className="icon-retro-button"
          onClick={() => navigate(`/portfolio/${project.category}`)}
          aria-label="Return to portfolio"
        >
          <ArrowLeft />
        </button>

        <div>
          <p>CAMPAIGN FILE / {project.year}</p>
          <span>FILE STATUS: COMPLETE</span>
        </div>

        <button
          className="next-project-button"
          onClick={() => navigate(`/project/${nextProject.id}`)}
        >
          NEXT FILE
          <ArrowRight />
        </button>
      </header>

      <div className="project-detail-hero">
        <motion.div
          className="project-title-block"
          initial={{
            opacity: 0,
            x: -40,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
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
          initial={{
            opacity: 0,
            scale: 0.9,
            rotate: 3,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
        >
          <div className="cover-art-grid" />

          <div className="cover-art-content">
            <span>RYNE MITRA PRESENTS</span>
            <strong>{project.title}</strong>
            <small>CAMPAIGN EDITION</small>
          </div>

          <div className="cover-art-pixels">
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
              <UserRound />
              <span>
                <small>Client</small>
                {project.client}
              </span>
            </div>

            <div>
              <BriefcaseBusiness />
              <span>
                <small>Role</small>
                {project.role}
              </span>
            </div>

            <div>
              <Calendar />
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

      <section className="project-next-section">
        <p>NEXT CAMPAIGN</p>
        <h2>{nextProject.title}</h2>

        <button
          className="large-next-button"
          onClick={() => navigate(`/project/${nextProject.id}`)}
        >
          LOAD NEXT FILE
          <ArrowRight />
        </button>
      </section>
    </section>
  );
}