import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUp,
  FolderOpen,
  Plus,
  Search,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

export default function ProjectList({
  projects = [],
  selected,
  onSelect,
  reload,
}) {
  const [search, setSearch] = useState("");
  const [movingId, setMovingId] = useState("");

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;

    return projects.filter((project) =>
      [
        project.title,
        project.client,
        project.category,
        project.year,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [projects, search]);

  async function updateProjectOrder(projectId, displayOrder) {
    const { error } = await supabase
      .from("projects")
      .update({ display_order: displayOrder })
      .eq("id", projectId);

    if (error) throw error;
  }

  async function moveProject(project, direction) {
    if (!project?.id || movingId) return;

    const sameCategoryProjects = projects
      .filter((item) => item.category === project.category)
      .sort(
        (a, b) =>
          Number(a.display_order ?? 0) -
          Number(b.display_order ?? 0),
      );

    const currentIndex = sameCategoryProjects.findIndex(
      (item) => item.id === project.id,
    );
    const targetIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= sameCategoryProjects.length
    ) {
      return;
    }

    const targetProject = sameCategoryProjects[targetIndex];
    setMovingId(project.id);

    try {
      const currentOrder = Number(project.display_order ?? currentIndex);
      const targetOrder = Number(
        targetProject.display_order ?? targetIndex,
      );

      await updateProjectOrder(project.id, targetOrder);
      await updateProjectOrder(targetProject.id, currentOrder);
      await reload?.();
    } catch (error) {
      console.error("Unable to reorder projects:", error);
      window.alert(
        error.message || "Unable to change the project order.",
      );
    } finally {
      setMovingId("");
    }
  }

  async function moveProjectToTop(project) {
    if (!project?.id || movingId) return;

    const sameCategoryProjects = projects.filter(
      (item) => item.category === project.category,
    );

    if (sameCategoryProjects.length <= 1) return;

    const lowestOrder = Math.min(
      ...sameCategoryProjects.map((item, index) =>
        Number(item.display_order ?? index),
      ),
    );

    setMovingId(project.id);

    try {
      await updateProjectOrder(project.id, lowestOrder - 1);
      await reload?.();
    } catch (error) {
      console.error("Unable to move project to top:", error);
      window.alert(
        error.message || "Unable to move the project to the top.",
      );
    } finally {
      setMovingId("");
    }
  }

  return (
    <aside className="cms-project-list">
      <div className="cms-project-list-header">
        <div>
          <h2>Projects</h2>
          <span>{projects.length} Total Projects</span>
        </div>

        <button
          type="button"
          className="cms-btn cms-btn-primary"
          onClick={() =>
            onSelect({
              title: "",
              client: "",
              category: "",
              year: "",
              role: "",
              description: "",
              challenge: "",
              solution: "",
              result: "",
              services: [],
              gallery: [],
              attachments: [],
              accent: "coral",
              display_order: 0,
              published: true,
            })
          }
          aria-label="Create a new project"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="cms-search">
        <Search size={18} />
        <input
          placeholder="Search projects..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="cms-project-scroll">
        {filteredProjects.length === 0 && (
          <div className="cms-empty">
            <FolderOpen size={42} />
            <p>No projects found.</p>
          </div>
        )}

        {filteredProjects.map((project) => {
          const active = selected?.id === project.id;
          const categoryProjects = projects
            .filter((item) => item.category === project.category)
            .sort(
              (a, b) =>
                Number(a.display_order ?? 0) -
                Number(b.display_order ?? 0),
            );

          const projectIndex = categoryProjects.findIndex(
            (item) => item.id === project.id,
          );
          const isMoving = movingId === project.id;

          return (
            <div
              key={project.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: "8px",
                alignItems: "stretch",
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(project)}
                className={`cms-project-card ${
                  active ? "active" : ""
                }`}
              >
                <div className="cms-project-top">
                  <strong>{project.title}</strong>
                  <span
                    className={
                      project.published
                        ? "cms-status published"
                        : "cms-status draft"
                    }
                  >
                    {project.published ? "Published" : "Draft"}
                  </span>
                </div>

                <p>{project.client || "No client"}</p>
                <small>
                  {project.category} • {project.year}
                </small>
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateRows: "repeat(3, 1fr)",
                  gap: "6px",
                  width: "42px",
                }}
              >
                <button
                  type="button"
                  className="cms-icon-btn"
                  onClick={() => moveProjectToTop(project)}
                  disabled={isMoving || projectIndex === 0}
                  aria-label={`Move ${project.title} to the top`}
                  title="Move to top"
                >
                  <ChevronsUp size={16} />
                </button>

                <button
                  type="button"
                  className="cms-icon-btn"
                  onClick={() => moveProject(project, -1)}
                  disabled={isMoving || projectIndex === 0}
                  aria-label={`Move ${project.title} up`}
                  title="Move up"
                >
                  <ArrowUp size={16} />
                </button>

                <button
                  type="button"
                  className="cms-icon-btn"
                  onClick={() => moveProject(project, 1)}
                  disabled={
                    isMoving ||
                    projectIndex === categoryProjects.length - 1
                  }
                  aria-label={`Move ${project.title} down`}
                  title="Move down"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}