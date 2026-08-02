import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

import LoadingScreen from "../components/LoadingScreen";
import ProjectCartridge from "../components/ProjectCartridge";
import { getProjectsByCategory } from "../data/projects";
import { supabase } from "../lib/supabase";

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
  const [cmsProjects, setCmsProjects] = useState([]);

  const content = categoryContent[category];

  const originalProjects = useMemo(
    () => getProjectsByCategory(category),
    [category],
  );

  const projects = useMemo(() => {
    const cmsProjectMap = new Map(
      cmsProjects.map((project) => [project.id, project]),
    );

    const mergedOriginalProjects = originalProjects.map(
      (project, index) => {
        const cmsProject = cmsProjectMap.get(project.id);

        if (!cmsProject) {
          return {
            ...project,
            display_order: project.display_order ?? index,
          };
        }

        cmsProjectMap.delete(project.id);

        return {
          ...project,
          ...cmsProject,
          iconType:
            project.iconType ??
            cmsProject.icon_type ??
            cmsProject.iconType ??
            "",
          externalUrl:
            cmsProject.external_url ??
            project.externalUrl ??
            "",
          coverImageUrl:
            cmsProject.cover_image_url ??
            project.coverImageUrl ??
            "",
          display_order:
            cmsProject.display_order ??
            project.display_order ??
            index,
        };
      },
    );

    const newCmsProjects = Array.from(
      cmsProjectMap.values(),
    ).map((project, index) => ({
      ...project,
      iconType: project.icon_type ?? project.iconType ?? "",
      externalUrl:
        project.external_url ?? project.externalUrl ?? "",
      coverImageUrl:
        project.cover_image_url ??
        project.coverImageUrl ??
        "",
      display_order:
        project.display_order ??
        mergedOriginalProjects.length + index,
    }));

    return [...mergedOriginalProjects, ...newCmsProjects].sort(
      (a, b) =>
        Number(a.display_order ?? 0) -
        Number(b.display_order ?? 0),
    );
  }, [originalProjects, cmsProjects]);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .eq("category", category)
        .order("display_order", { ascending: true });

      if (!active) return;

      if (error) {
        console.error("Unable to load CMS projects:", error);
        setCmsProjects([]);
      } else {
        setCmsProjects(data ?? []);
      }

      const timeout = window.setTimeout(() => {
        if (active) {
          setLoading(false);
        }
      }, 950);

      return () => window.clearTimeout(timeout);
    }

    loadProjects();

    return () => {
      active = false;
    };
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
          <ProjectCartridge
            key={project.id}
            project={project}
            index={index}
          />
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