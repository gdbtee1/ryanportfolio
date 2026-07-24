import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function ProjectCartridge({ project, index = 0 }) {
  const navigate = useNavigate();

  const openProject = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <motion.button
      type="button"
      className={`project-cartridge project-accent-${project.accent}`}
      onClick={openProject}
      initial={{
        opacity: 0,
        y: 45,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.1,
        duration: 0.35,
      }}
      whileHover={{
        y: -10,
        scale: 1.015,
      }}
      whileTap={{
        y: 2,
        scale: 0.98,
      }}
      aria-label={`Open ${project.title} campaign`}
    >
      <div className="project-cartridge-ridges" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, ridgeIndex) => (
          <span key={ridgeIndex} />
        ))}
      </div>

      <div className="project-cartridge-label">
        <div className="project-file-number">
          <span>FILE {String(index + 1).padStart(2, "0")}</span>
          <span>{project.category.toUpperCase()}</span>
        </div>

        <div className="project-logo-stage">
          <PixelProjectIcon type={project.iconType} />
        </div>

        <div className="project-cartridge-identity">
          <h2>{project.title}</h2>
          <p>{project.client}</p>
        </div>

        <div className="project-label-meta">
          <span className="project-year">{project.year}</span>
          <span className="project-role">{project.role}</span>
        </div>
      </div>

      <div className="project-cartridge-footer">
        <span>OPEN CAMPAIGN</span>
        <ArrowRight aria-hidden="true" />
      </div>
    </motion.button>
  );
}