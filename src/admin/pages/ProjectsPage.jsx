import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "../../lib/supabase";
import AdminLayout from "../layout/AdminLayout";
import ProjectList from "../components/project/ProjectList";
import ProjectEditor from "../components/project/ProjectEditor";
import ProjectToolbar from "../components/project/ProjectToolbar";

const EMPTY_PROJECT = {
  title: "",
  client: "",
  category: "student",
  year: new Date().getFullYear().toString(),
  role: "",
  external_url: "",
  icon_type: "",
  description: "",
  challenge: "",
  solution: "",
  result: "",
  services: [],
  gallery: [],
  attachments: [],
  cover_image_url: "",
  accent: "coral",
  display_order: 0,
  published: true,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("ascending");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", {
        ascending: sortDirection === "ascending",
      });

    if (error) {
      console.error("Unable to load projects:", error);

      setLoadError(
        error.message || "Unable to load projects from Supabase.",
      );
      setLoading(false);
      return;
    }

    const loadedProjects = data ?? [];

    setProjects(loadedProjects);

    setSelectedProject((currentProject) => {
      if (!currentProject && loadedProjects.length > 0) {
        return loadedProjects[0];
      }

      if (!currentProject?.id) {
        return currentProject;
      }

      return (
        loadedProjects.find(
          (project) => project.id === currentProject.id,
        ) ??
        loadedProjects[0] ??
        null
      );
    });

    setLoading(false);
  }, [sortDirection]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          project.title,
          project.client,
          project.category,
          project.year,
          project.role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && project.published) ||
        (statusFilter === "hidden" && !project.published);

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  function handleNewProject() {
    setSelectedProject({
      ...EMPTY_PROJECT,
    });
  }

  function handleSort() {
    setSortDirection((current) =>
      current === "ascending" ? "descending" : "ascending",
    );
  }

  function handleFilter() {
    setStatusFilter((current) => {
      if (current === "all") return "published";
      if (current === "published") return "hidden";
      return "all";
    });
  }

  return (
    <AdminLayout>
      <ProjectToolbar
        onSearch={setSearchQuery}
        onNew={handleNewProject}
        onRefresh={loadProjects}
        onSort={handleSort}
        onFilter={handleFilter}
        sortDirection={sortDirection}
        statusFilter={statusFilter}
        loading={loading}
      />

      {loadError && (
        <div className="cms-alert cms-alert-error" role="alert">
          {loadError}
        </div>
      )}

      <div className="cms-project-workspace">
        <ProjectList
          projects={filteredProjects}
          selected={selectedProject}
          onSelect={setSelectedProject}
          reload={loadProjects}
          loading={loading}
          searchEnabled={false}
        />

        <ProjectEditor
          project={selectedProject}
          reload={loadProjects}
        />
      </div>
    </AdminLayout>
  );
}