function ProjectTable({ projects, loading, onEdit }) {
  if (loading) return <p>Loading projects...</p>;

  return (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-4 text-left">Title</th>
          <th>Client</th>
          <th>Year</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {projects.map((project) => (
          <tr key={project.id} className="border-t">
            <td className="p-4">{project.title}</td>

            <td>{project.client}</td>

            <td>{project.year}</td>

            <td>
              {project.published ? "Published" : "Hidden"}
            </td>

            <td>
              <button
                onClick={() => onEdit(project)}
                className="rounded bg-black px-3 py-2 text-white"
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProjectTable;