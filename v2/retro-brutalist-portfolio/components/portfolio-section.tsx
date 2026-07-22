"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WindowControls } from "@/components/window-controls";
import { PortfolioSiblingLink } from "@/components/portfolio-sibling-link";
import type { ActiveSection } from "@/components/section-nav-bar";
import { curatedProjects } from "@/lib/portfolio-data";
import { fetchGitHubProjects, type PortfolioProject } from "@/lib/github";

type SortKey = "updated-desc" | "updated-asc" | "stars";
type VisibilityFilter = "public" | "private";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated-desc", label: "Last worked" },
  { key: "updated-asc", label: "Oldest first" },
  { key: "stars", label: "Most starred" },
];

const VISIBILITY_OPTIONS: { key: VisibilityFilter; label: string }[] = [
  { key: "public", label: "Public" },
  { key: "private", label: "Private" },
];

const INITIAL_VISIBLE = 6;

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function techKey(t: string): string {
  return t.replace(/\s*\([\d.]+%\)$/, "").trim();
}

function technologiesOf(p: PortfolioProject): string[] {
  if (p.stackLanguages?.length) {
    return p.stackLanguages.map((lang) => lang.name);
  }
  if (p.technologies?.length) return p.technologies.map(techKey);
  if (!p.tags) return [];
  return p.tags
    .split(/\s+/)
    .map((t) => t.replace(/^#/, "").replace(/_/g, " "))
    .filter(Boolean);
}

function stackLanguagesOf(
  p: PortfolioProject,
): { name: string; percent?: number }[] {
  if (p.stackLanguages?.length) {
    return p.stackLanguages.slice(0, 3);
  }
  return technologiesOf(p)
    .slice(0, 3)
    .map((name) => ({ name }));
}

async function mergeWithBakedProjects(
  projects: PortfolioProject[],
): Promise<PortfolioProject[]> {
  try {
    const bakedRes = await fetch(`/data/github-projects.json?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!bakedRes.ok) return projects;
    const baked = (await bakedRes.json()) as PortfolioProject[];
    const bakedByRepo = new Map(
      baked.filter((p) => p.repoUrl).map((p) => [p.repoUrl!, p]),
    );
    const bakedByTitle = new Map(baked.map((p) => [normalise(p.title), p]));
    const liveUrls = new Set(
      projects.map((p) => p.repoUrl).filter(Boolean) as string[],
    );
    const liveTitles = new Set(projects.map((p) => normalise(p.title)));

    const mergedLive = projects.map((project) => {
      const bakedProject =
        (project.repoUrl ? bakedByRepo.get(project.repoUrl) : undefined) ??
        bakedByTitle.get(normalise(project.title));
      return {
        ...project,
        isPrivate: bakedProject?.isPrivate ?? project.isPrivate ?? false,
        stackLanguages:
          bakedProject?.stackLanguages?.length
            ? bakedProject.stackLanguages
            : project.stackLanguages?.length
              ? project.stackLanguages
              : undefined,
        linesOfCode: project.linesOfCode ?? bakedProject?.linesOfCode,
        lastUpdated: project.lastUpdated ?? bakedProject?.lastUpdated,
        updatedAtRaw: project.updatedAtRaw ?? bakedProject?.updatedAtRaw,
        description:
          project.description === "No description provided."
            ? (bakedProject?.description ?? project.description)
            : project.description,
      };
    });

    const privateFromBaked = baked.filter(
      (p) =>
        p.isPrivate &&
        !liveTitles.has(normalise(p.title)) &&
        (!p.repoUrl || !liveUrls.has(p.repoUrl)),
    );

    return [...mergedLive, ...privateFromBaked];
  } catch {
    return projects;
  }
}

function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.key === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="retro-filter-dropdown" ref={ref}>
      <button
        type="button"
        className={`filter-btn ${open ? "filter-btn-active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="retro-filter-label">{label}:</span> {current?.label} ▾
      </button>
      {open && (
        <ul className="retro-filter-menu" role="menu">
          {options.map((opt) => (
            <li key={opt.key} role="none">
              <button
                type="button"
                role="menuitem"
                className={`retro-filter-option ${value === opt.key ? "retro-filter-option-active" : ""}`}
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: PortfolioProject }) {
  const [stackOpen, setStackOpen] = useState(false);
  const stackItems = stackLanguagesOf(project);
  const githubHref = project.repoUrl;
  const demoHref = project.homepage || undefined;
  const hasStats =
    project.stars != null ||
    (project.forks != null && project.forks > 0) ||
    Boolean(project.lastUpdated) ||
    project.linesOfCode != null;

  return (
    <article
      className={`project-card project-card-text ${project.isPrivate ? "project-card-private" : ""}`}
    >
      <div
        className="window-header"
        style={{ background: "#333", color: "#fff" }}
      >
        <span>{project.isPrivate ? "PRIVATE_WIP" : project.code}</span>
        <WindowControls dark />
      </div>

      <div className="project-info project-info-full">
        <div className="project-card-top">
          <span
            className={`project-tag project-visibility-tag ${project.isPrivate ? "project-visibility-private" : "project-visibility-public"}`}
          >
            {project.isPrivate ? "#Private" : "#Public"}
          </span>
          {!project.isPrivate && (demoHref || githubHref) && (
            <div className="project-card-links">
              {demoHref && (
                <a
                  href={demoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-mini-link"
                >
                  DEMO ↗
                </a>
              )}
              {githubHref && (
                <a
                  href={githubHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-mini-link"
                >
                  GITHUB ↗
                </a>
              )}
            </div>
          )}
        </div>

        <h3 className="project-title">{project.title}</h3>

        {project.isPrivate ? (
          <p className="project-desc project-desc-wip">
            <span className="project-wip-badge">
              <span className="project-wip-dot" aria-hidden="true" />
              UNDER_DEVELOPMENT
            </span>
          </p>
        ) : (
          <p className="project-desc">
            Note: To understand the detailed description for this project, visit
            the project on GitHub (click GITHUB on this card).
          </p>
        )}

        {hasStats && (
          <div className="project-kpis">
            {project.stars != null && (
              <span className="project-kpi">STARS {project.stars}</span>
            )}
            {project.forks != null && project.forks > 0 && (
              <span className="project-kpi">⑂ FORKS {project.forks}</span>
            )}
            {project.linesOfCode != null && (
              <span className="project-kpi">
                ~{project.linesOfCode.toLocaleString()} LOC
              </span>
            )}
            {project.lastUpdated && (
              <span className="project-kpi">UPDATED {project.lastUpdated}</span>
            )}
          </div>
        )}

        {stackItems.length > 0 && (
          <div className="project-stack">
            <button
              type="button"
              className="project-stack-toggle"
              onClick={() => setStackOpen((o) => !o)}
            >
              {stackOpen ? "HIDE_STACK ▲" : "SHOW_STACK ▼"}
            </button>
            {stackOpen && (
              <div className="project-stack-tags">
                {stackItems.map(({ name, percent }) => (
                  <span key={name} className="project-stack-tag">
                    {percent != null ? `${name} ${percent}%` : name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function PortfolioSection({
  onNavigateToSection,
}: {
  onNavigateToSection?: (section: ActiveSection) => void;
}) {
  const [projects, setProjects] = useState<PortfolioProject[]>(curatedProjects);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("updated-desc");
  const [activeTech, setActiveTech] = useState("All");
  const [activeVisibility, setActiveVisibility] =
    useState<VisibilityFilter>("public");
  const [isExpanded, setIsExpanded] = useState(false);
  const [resumeProjectEntries, setResumeProjectEntries] = useState<
    Record<string, { title: string; description: string }[]>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadLive() {
      try {
        const payload = await fetchGitHubProjects({ enrich: false });
        if (cancelled) return;
        if (Array.isArray(payload) && payload.length > 0) {
          setProjects(await mergeWithBakedProjects(payload));
        } else {
          throw new Error("empty");
        }
      } catch {
        if (cancelled) return;
        try {
          const bakedRes = await fetch(
            `/data/github-projects.json?t=${Date.now()}`,
            {
              cache: "no-store",
            },
          );
          if (bakedRes.ok) {
            const baked = (await bakedRes.json()) as PortfolioProject[];
            if (Array.isArray(baked) && baked.length > 0) {
              setProjects(baked);
              return;
            }
          }
        } catch {
          /* ignore */
        }
        setProjects(curatedProjects);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLive();
    const id = window.setInterval(loadLive, 5 * 60 * 1000);
    const onFocus = () => loadLive();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    fetch("/data/resume-projects.json")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((entries) => setResumeProjectEntries(entries ?? {}));
  }, []);

  const privateStubs = useMemo<PortfolioProject[]>(() => {
    const seen = new Set<string>();
    const stubs: PortfolioProject[] = [];
    for (const entries of Object.values(resumeProjectEntries)) {
      for (const { title, description } of entries) {
        if (seen.has(title)) continue;
        seen.add(title);
        const alreadyOnGitHub = projects.some(
          (p) =>
            normalise(p.title).includes(normalise(title)) ||
            normalise(title).includes(normalise(p.title)),
        );
        if (!alreadyOnGitHub) {
          stubs.push({
            code: "PRIV",
            title,
            category: "ai/ml",
            image: "/placeholder.svg",
            tags: "#PRIVATE #WIP",
            description,
            technologies: [],
            isPrivate: true,
          });
        }
      }
    }
    return stubs;
  }, [projects, resumeProjectEntries]);

  const allProjects = useMemo(
    () => [...projects, ...privateStubs],
    [projects, privateStubs],
  );

  const topTechOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of allProjects) {
      for (const t of technologiesOf(p)) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    const top5 = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => ({ key: tag, label: tag }));
    return [{ key: "All", label: "All" }, ...top5];
  }, [allProjects]);

  const processedProjects = useMemo(() => {
    let result = [...allProjects];

    result = result.filter((p) =>
      activeVisibility === "private" ? Boolean(p.isPrivate) : !p.isPrivate,
    );

    if (activeTech !== "All") {
      result = result.filter((p) =>
        technologiesOf(p).some((t) => t === activeTech),
      );
    }

    if (sortKey === "stars") {
      result.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    } else if (sortKey === "updated-asc") {
      result.sort((a, b) => {
        const da = a.updatedAtRaw ? new Date(a.updatedAtRaw).getTime() : 0;
        const db = b.updatedAtRaw ? new Date(b.updatedAtRaw).getTime() : 0;
        return da - db;
      });
    } else {
      // Default: most recently pushed / committed first
      result.sort((a, b) => {
        const da = a.updatedAtRaw ? new Date(a.updatedAtRaw).getTime() : 0;
        const db = b.updatedAtRaw ? new Date(b.updatedAtRaw).getTime() : 0;
        return db - da;
      });
    }

    return result;
  }, [allProjects, sortKey, activeTech, activeVisibility]);

  const visibleProjects = isExpanded
    ? processedProjects
    : processedProjects.slice(0, INITIAL_VISIBLE);

  const filtersActive =
    sortKey !== "updated-desc" ||
    activeTech !== "All" ||
    activeVisibility !== "public";

  return (
    <div className="section-stack">
      <header className="section-heading-block">
        <h2 className="section-title">Projects</h2>
        {onNavigateToSection && (
          <PortfolioSiblingLink
            target="publications"
            onNavigate={onNavigateToSection}
          />
        )}
      </header>

      <div className="filter-bar retro-filter-bar">
        <span className="retro-filters-heading">FILTERS</span>

        <FilterDropdown
          label="SORT"
          options={SORT_OPTIONS}
          value={sortKey}
          onChange={setSortKey}
        />
        <FilterDropdown
          label="VISIBILITY"
          options={VISIBILITY_OPTIONS}
          value={activeVisibility}
          onChange={setActiveVisibility}
        />
        <FilterDropdown
          label="STACK"
          options={topTechOptions}
          value={activeTech}
          onChange={setActiveTech}
        />

        <button
          type="button"
          className="filter-btn"
          disabled={!filtersActive}
          onClick={() => {
            setSortKey("updated-desc");
            setActiveTech("All");
            setActiveVisibility("public");
          }}
          title="Reset filters"
        >
          RESET
        </button>
      </div>

      {loading && projects.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          SYNCING_GITHUB_REPOS…
        </p>
      ) : visibleProjects.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          No projects match the selected filters.
        </p>
      ) : (
        <div className="portfolio-grid portfolio-grid-compact">
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={`${project.code}-${project.title}-${index}`}
              project={project}
            />
          ))}
        </div>
      )}

      {processedProjects.length > INITIAL_VISIBLE && (
        <button
          type="button"
          className="btn-retro"
          style={{ width: "fit-content", alignSelf: "center" }}
          onClick={() => setIsExpanded((e) => !e)}
        >
          {isExpanded ? "SHOW_LESS ▲" : "VIEW_ALL_PROJECTS ▼"}
        </button>
      )}
    </div>
  );
}
