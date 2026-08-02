import {
  ArrowUpDown,
  Filter,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function ProjectToolbar({
  onSearch,
  onNew,
  onRefresh,
  onSort,
  onFilter,
  sortDirection = "ascending",
  statusFilter = "all",
  loading = false,
}) {
  const [searchValue, setSearchValue] = useState("");

  function handleSearch(event) {
    const value = event.target.value;

    setSearchValue(value);
    onSearch?.(value);
  }

  const filterLabel =
    statusFilter === "published"
      ? "Published"
      : statusFilter === "hidden"
        ? "Hidden"
        : "All Projects";

  return (
    <header className="cms-toolbar">
      <div className="cms-toolbar-left">
        <div className="cms-toolbar-search">
          <Search size={20} />

          <input
            type="search"
            value={searchValue}
            onChange={handleSearch}
            placeholder="Search projects..."
            aria-label="Search projects"
          />
        </div>
      </div>

      <div className="cms-toolbar-right">
        <button
          type="button"
          className="cms-btn cms-btn-secondary"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? "cms-spin" : ""}
          />

          {loading ? "Loading..." : "Refresh"}
        </button>

        <button
          type="button"
          className="cms-btn cms-btn-secondary"
          onClick={onSort}
        >
          <ArrowUpDown size={18} />

          {sortDirection === "ascending"
            ? "Oldest First"
            : "Newest First"}
        </button>

        <button
          type="button"
          className="cms-btn cms-btn-secondary"
          onClick={onFilter}
        >
          <Filter size={18} />

          {filterLabel}
        </button>

        <button
          type="button"
          className="cms-btn cms-btn-primary"
          onClick={onNew}
        >
          <Plus size={19} />

          New Project
        </button>
      </div>
    </header>
  );
}