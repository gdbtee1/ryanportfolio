import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  CirclePlay,
  Download,
  FileText,
  Maximize2,
  UserRound,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import LoadingScreen from "../components/LoadingScreen";

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

function getFileExtension(url = "") {
  const cleanUrl = url.split("?")[0].split("#")[0];

  return cleanUrl.includes(".")
    ? cleanUrl.split(".").pop().toLowerCase()
    : "";
}

function getAttachmentKind(attachment) {
  const declaredType = String(attachment?.type ?? "").toLowerCase();
  const url = attachment?.url ?? "";
  const extension = getFileExtension(url);

  // Explicit types
  if (declaredType === "youtube") return "youtube";
  if (declaredType === "video") return "video";
  if (declaredType === "image") return "image";
  if (declaredType === "pdf") return "pdf";

  // Auto-detect YouTube
  if (
    url.includes("youtu.be") ||
    url.includes("youtube.com")
  ) {
    return "youtube";
  }

  // Uploaded videos
  if (["mp4", "webm", "mov", "m4v", "ogg"].includes(extension)) {
    return "video";
  }

  // Images
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
    return "image";
  }

  // PDFs
  if (extension === "pdf") {
    return "pdf";
  }

  return "document";
}

function getViewerUrl(attachment) {
  const kind = getAttachmentKind(attachment);

  if (kind === "document") {
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
      attachment.url,
    )}`;
  }

  return attachment.url;
}
function getYouTubeEmbedUrl(url = "") {
  const cleanUrl = String(url).trim();

  try {
    const parsedUrl = new URL(cleanUrl);
    let videoId = "";

    if (
      parsedUrl.hostname === "youtu.be" ||
      parsedUrl.hostname === "www.youtu.be"
    ) {
      videoId =
        parsedUrl.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.pathname === "/watch"
    ) {
      videoId = parsedUrl.searchParams.get("v") ?? "";
    }

    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.pathname.startsWith("/shorts/")
    ) {
      videoId =
        parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0] ?? "";
    }

    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.pathname.startsWith("/embed/")
    ) {
      videoId =
        parsedUrl.pathname.split("/embed/")[1]?.split("/")[0] ?? "";
    }

    if (!videoId) return "";

    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  } catch (error) {
    console.error("Invalid YouTube URL:", url, error);
    return "";
  }
}

function CampaignPlayer({
  attachments,
  activeAttachment,
  onSelect,
}) {
  if (attachments.length === 0) {
    return null;
  }

  const selectedAttachment =
    activeAttachment &&
    attachments.some(
      (attachment) => attachment.url === activeAttachment.url,
    )
      ? activeAttachment
      : attachments[0];

  const activeIndex = attachments.findIndex(
    (attachment) => attachment.url === selectedAttachment.url,
  );

  const embedUrl = getYouTubeEmbedUrl(selectedAttachment.url);

  return (
    <motion.section
      className="project-campaign-player"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="project-campaign-player-heading">
        <div>
          <p>FEATURED CAMPAIGN</p>
          <h2>Watch the creative work</h2>
        </div>

        <span>
          {String(activeIndex + 1).padStart(2, "0")}/
          {String(attachments.length).padStart(2, "0")}
        </span>
      </div>

      <div className="project-campaign-screen">
        {embedUrl ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={selectedAttachment.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <div className="project-campaign-error">
            Unable to load this campaign video.
          </div>
        )}
      </div>

      <div className="project-campaign-now-playing">
        <span>NOW PLAYING</span>
        <strong>{selectedAttachment.title}</strong>
      </div>

      <div className="project-campaign-playlist">
        {attachments.map((attachment, index) => {
          const isActive =
            attachment.url === selectedAttachment.url;

          return (
            <button
              type="button"
              className={`project-campaign-track${
                isActive ? " active" : ""
              }`}
              key={attachment.url}
              onClick={() => onSelect(attachment)}
            >
              <span className="project-campaign-track-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <CirclePlay aria-hidden="true" />

              <span className="project-campaign-track-copy">
                <strong>{attachment.title}</strong>
                <small>
                  {isActive ? "Currently playing" : "Play campaign"}
                </small>
              </span>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}

function AttachmentViewer({ attachment, onClose }) {
  useEffect(() => {
    if (!attachment) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [attachment, onClose]);

  if (!attachment) return null;

  const kind = getAttachmentKind(attachment);
  const viewerUrl = getViewerUrl(attachment);

  return (
    <div
      className="project-attachment-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="project-attachment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-attachment-title"
      >
        <header className="project-attachment-modal-header">
          <div>
            <p>CAMPAIGN ASSET</p>
            <h2 id="project-attachment-title">{attachment.title}</h2>
          </div>

          <div className="project-attachment-modal-actions">
            <a
              href={attachment.url}
              className="project-attachment-download"
              download
              target="_blank"
              rel="noreferrer"
            >
              <Download size={18} />
              Download
            </a>

            <button
              type="button"
              className="project-attachment-close"
              onClick={onClose}
              aria-label="Close campaign asset"
            >
              <X size={22} />
            </button>
          </div>
        </header>

        <div className="project-attachment-viewer">
          {kind === "video" && (
            <video
              src={attachment.url}
              controls
              playsInline
              preload="metadata"
            >
              Your browser does not support embedded video.
            </video>
          )}
          {kind === "image" && (
            <img src={attachment.url} alt={attachment.title} />
          )}

          {(kind === "pdf" || kind === "document") && (
            <iframe
              src={viewerUrl}
              title={attachment.title}
              loading="lazy"
              allow="fullscreen"
            />
          )}
        </div>

      </section>
    </div>
  );
}


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
  const [activeAttachment, setActiveAttachment] = useState(null);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [project, setProject] = useState(null);
  const [categoryProjects, setCategoryProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProject() {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Unable to load project:", error);
        setProject(null);
        setCategoryProjects([]);
        setLoadError(error.message || "Unable to load this project.");
        setLoading(false);
        return;
      }

      if (!data) {
        setProject(null);
        setCategoryProjects([]);
        setLoading(false);
        return;
      }

      const normalizedProject = {
        ...data,
        iconType: data.icon_type ?? "",
        externalUrl: data.external_url ?? "",
        coverImageUrl: data.cover_image_url ?? "",
        services: Array.isArray(data.services) ? data.services : [],
        attachments: Array.isArray(data.attachments) ? data.attachments : [],
        gallery: Array.isArray(data.gallery)
          ? data.gallery
              .filter(Boolean)
              .map((item) =>
                typeof item === "string"
                  ? {
                      src: item,
                      alt: `${data.title || "Project"} campaign asset`,
                      caption: "",
                    }
                  : item,
              )
          : [],
      };

      setProject(normalizedProject);

      const { data: relatedProjects, error: relatedError } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .eq("category", normalizedProject.category)
        .order("display_order", { ascending: true });

      if (!active) return;

      if (relatedError) {
        console.error("Unable to load related projects:", relatedError);
        setCategoryProjects([normalizedProject]);
      } else {
        setCategoryProjects(
          (relatedProjects ?? []).map((item) => ({
            ...item,
            iconType: item.icon_type ?? "",
            externalUrl: item.external_url ?? "",
            coverImageUrl: item.cover_image_url ?? "",
          })),
        );
      }

      setLoading(false);
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [projectId]);

  const attachments = useMemo(
    () =>
      Array.isArray(project?.attachments)
        ? project.attachments.filter(
            (attachment) => attachment?.title && attachment?.url,
          )
        : [],
    [project],
  );

  const youtubeAttachments = useMemo(
    () =>
      attachments.filter(
        (attachment) =>
          getAttachmentKind(attachment) === "youtube",
      ),
    [attachments],
  );

  const fileAttachments = useMemo(
    () =>
      attachments.filter(
        (attachment) =>
          getAttachmentKind(attachment) !== "youtube",
      ),
    [attachments],
  );

  useEffect(() => {
    setActiveCampaign(youtubeAttachments[0] ?? null);
    setActiveAttachment(null);
  }, [projectId, youtubeAttachments]);

  if (loading) {
    return (
      <LoadingScreen
        title="LOADING CAMPAIGN FILE"
        subtitle="Reading project data..."
      />
    );
  }

  if (loadError) {
    return (
      <section className="error-page">
        <h1>PROJECT DATA ERROR</h1>
        <p>{loadError}</p>

        <button type="button" onClick={() => window.location.reload()}>
          RETRY
        </button>
      </section>
    );
  }

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

  const currentIndex = categoryProjects.findIndex(
    (item) => item.id === project.id,
  );

  const nextProject =
    categoryProjects.length > 1
      ? categoryProjects[
          (Math.max(currentIndex, 0) + 1) % categoryProjects.length
        ]
      : project;

  const returnToPortfolio = () => {
    navigate(`/portfolio/${project.category}`);
  };

  const openNextProject = () => {
    if (!nextProject?.id || nextProject.id === project.id) {
      returnToPortfolio();
      return;
    }

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
            {String(project.category || "portfolio").toUpperCase()} WORLD
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

      <CampaignPlayer
        attachments={youtubeAttachments}
        activeAttachment={activeCampaign}
        onSelect={setActiveCampaign}
      />

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
            {(project.services ?? []).map((service) => (
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

      {fileAttachments.length > 0 && (
        <section className="project-attachments-section">
          <div className="project-gallery-heading">
            <p>SUPPORTING ASSETS</p>
            <h2>View project files</h2>
          </div>

          <div className="project-attachments-grid">
            {fileAttachments.map((attachment, index) => (
              <motion.button
                type="button"
                className="project-attachment-card"
                key={`${attachment.url}-${index}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.06,
                }}
                viewport={{ once: true, amount: 0.2 }}
                onClick={() => setActiveAttachment(attachment)}
              >
                <span className="project-attachment-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="project-attachment-icon">
                  <FileText size={28} />
                </span>

                <span className="project-attachment-copy">
                  <strong>{attachment.title}</strong>
                  <small>Opens inside this website</small>
                </span>

                <span className="project-attachment-open">
                  <Maximize2 size={18} />
                  Preview
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

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

      <AttachmentViewer
        attachment={activeAttachment}
        onClose={() => setActiveAttachment(null)}
      />

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