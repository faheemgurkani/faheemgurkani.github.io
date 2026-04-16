"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Section from "./ui/Section";
import { useGitHubProjects } from "../hooks/useGitHubProjects";
import {
  Folder,
  Github,
  ChevronDown,
  ChevronUp,
  Star,
  GitFork,
  ExternalLink,
  Filter,
  FileText,
  ArrowDownUp,
  RotateCcw,
  Code2,
} from "lucide-react";
import { Project } from "../types";
import { PERSONAL_INFO } from "../constants";

const DEFAULT_REPO_LINK = `https://github.com/${PERSONAL_INFO.social.github}?tab=repositories`;

const RESUME_LABELS = [
  "All",
  "AI/ML Engineer",
  "Backend Engineer",
  "CV Engineer",
] as const;
type ResumeLabel = (typeof RESUME_LABELS)[number];
type SortKey = "updated-desc" | "updated-asc" | "stars";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated-desc", label: "Latest first" },
  { key: "updated-asc", label: "Oldest first" },
  { key: "stars", label: "Most starred" },];

// ─── Reusable filter dropdown ─────────────────────────────────────────────────

function FilterDropdown<T extends string>({
  icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: React.ReactNode;
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 text-sm font-medium text-neutral-300 hover:border-neutral-500 hover:text-white transition-colors"
      >
        {icon}
        <span className="text-neutral-500 uppercase tracking-wider text-xs">{label}:</span>
        <span>{current?.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute left-0 z-50 mt-2 flex flex-col gap-1.5 p-2 backdrop-blur-2xl"
        >
          {options.map((opt) => (
            <li key={opt.key} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => { onChange(opt.key); setOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-full border text-xs font-medium transition-colors ${
                  value === opt.key
                    ? "border-white text-white bg-transparent"
                    : "border-neutral-600/30 bg-transparent text-neutral-400 hover:border-neutral-400/50 hover:text-white"
                }`}
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

/** Normalise string for fuzzy matching against resume text. */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const [stackExpanded, setStackExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const href = project.repoUrl || project.link || DEFAULT_REPO_LINK;
  const hasStats =
    project.stars != null ||
    (project.forks != null && project.forks > 0) ||
    project.lastUpdated;
  const hasStack = project.technologies.length > 0;

  return (
    <div className={`group bg-neutral-900/50 border p-6 rounded-sm transition-all duration-300 flex flex-col h-full ${
      project.isPrivate
        ? "border-neutral-700/60 hover:border-neutral-600 opacity-80"
        : "border-neutral-800 hover:border-neutral-600"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <Folder className="w-8 h-8 text-neutral-500 group-hover:text-white transition-colors" />
        <div className="flex items-center gap-2">
          {project.isPrivate ? (
            <div className="relative">
              <button
                type="button"
                aria-label="Repository is private"
                className="text-neutral-600 cursor-default transition-colors duration-300 hover:text-neutral-400"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
              >
                <Github className="w-6 h-6" />
              </button>
              {showTooltip && (
                <div
                  role="tooltip"
                  className="absolute right-0 bottom-full mb-2 w-56 rounded-md border border-neutral-700/60 bg-neutral-900/90 backdrop-blur-sm px-3 py-2 text-xs text-neutral-300 shadow-lg z-50"
                >
                  Repository is currently private — development still in progress.
                </div>
              )}
            </div>
          ) : (
            <>
              {project.homepage && (
                <a
                  href={project.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-white transition-colors duration-300"
                  aria-label="View live demo"
                  title="Live demo"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-white transition-colors duration-300"
                aria-label="View on GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
            </>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-3 group-hover:text-neutral-200">
        {project.title}
      </h3>

      <p className="text-neutral-400 text-sm mb-3 flex-grow leading-relaxed">
        {project.isPrivate
          ? project.description || "This project is currently under development. The repository is private and not yet publicly available on GitHub."
          : "Note: To understand the detailed description for this project, visit the project on GitHub (for that, click on the GitHub logo on this project card)."}
      </p>

      {project.isPrivate && (
        <span className="inline-flex items-center gap-1.5 self-start mb-4 px-2.5 py-1 rounded text-xs font-mono font-medium text-amber-400/80 bg-amber-400/5 border border-amber-400/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-pulse shrink-0" />
          Under development
        </span>
      )}

      {hasStats && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {project.stars != null && project.stars > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-md">
              <Star className="w-3.5 h-3.5 text-amber-400/80" />
              {project.stars}
            </span>
          )}
          {project.forks != null && project.forks > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-300 bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-md">
              <GitFork className="w-3.5 h-3.5" />
              {project.forks}
            </span>
          )}
          {project.lastUpdated && (
            <span className="inline-flex items-center text-xs font-mono text-neutral-400 bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-md">
              {project.lastUpdated}
            </span>
          )}
        </div>
      )}

      {hasStack && (
        <div className="mt-auto space-y-2">
          <button
            type="button"
            onClick={() => setStackExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            {stackExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide stack
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show stack
              </>
            )}
          </button>
          {stackExpanded && (
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-xs font-mono text-neutral-400 bg-neutral-800/80 border border-neutral-700 px-2 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ProjectsHybrid: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { projects, loading, error } = useGitHubProjects();

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey>("updated-desc");

  // Resume filter state
  const [activeResume, setActiveResume] = useState<ResumeLabel>("All");
  const [resumeLoading, setResumeLoading] = useState(false);

  // Tech stack filter
  const [activeTech, setActiveTech] = useState("All");

  // Private stub cards from resume
  const [resumeProjectEntries, setResumeProjectEntries] = useState<
    Record<string, { title: string; description: string }[]>
  >({});

  useEffect(() => {
    setResumeLoading(true);
    fetch("/data/resume-projects.json")
      .then((r) => r.json())
      .catch(() => ({}))
      .then((entries) => setResumeProjectEntries(entries))
      .finally(() => setResumeLoading(false));
  }, []);

  /** Stub cards for resume projects with no matching public GitHub repo. */
  const privateStubs = useMemo<Project[]>(() => {
    const seen = new Set<string>();
    const stubs: Project[] = [];
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
          stubs.push({ title, description, technologies: [], isPrivate: true });
        }
      }
    }
    return stubs;
  }, [projects, resumeProjectEntries]);

  /** All projects: GitHub + private stubs */
  const allProjects = useMemo(
    () => [...projects, ...privateStubs],
    [projects, privateStubs],
  );

  /** Top 5 tech tags by frequency across all projects. */
  const topTechOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of allProjects) {
      for (const t of p.technologies) {
        // Strip percentage suffix if present, e.g. "Python (82.3%)" → "Python"
        const tag = t.replace(/\s*\([\d.]+%\)$/, "").trim();
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
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

    // Resume filter — match against explicit title list from the parsed PDF
    if (activeResume !== "All") {
      const resumeTitles = (resumeProjectEntries[activeResume] ?? []).map(
        (e) => normalise(e.title),
      );
      result = result.filter((p) =>
        resumeTitles.some(
          (t) =>
            normalise(p.title).includes(t) || t.includes(normalise(p.title)),
        ),
      );
    }

    // Tech stack filter
    if (activeTech !== "All") {
      result = result.filter((p) =>
        p.technologies.some((t) =>
          t.replace(/\s*\([\d.]+%\)$/, "").trim() === activeTech
        )
      );
    }

    // Sort (within each group — private stubs always float to the top after)
    if (sortKey === "stars") {
      result.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    } else if (sortKey === "updated-asc") {
      result.sort((a, b) => {
        const da = a.updatedAtRaw ? new Date(a.updatedAtRaw).getTime() : 0;
        const db = b.updatedAtRaw ? new Date(b.updatedAtRaw).getTime() : 0;
        return da - db;
      });
    } else {
      result.sort((a, b) => {
        const da = a.updatedAtRaw ? new Date(a.updatedAtRaw).getTime() : 0;
        const db = b.updatedAtRaw ? new Date(b.updatedAtRaw).getTime() : 0;
        return db - da;
      });
    }

    // Private / under-development cards always lead
    result.sort((a, b) => {
      if (a.isPrivate && !b.isPrivate) return -1;
      if (!a.isPrivate && b.isPrivate) return 1;
      return 0;
    });

    return result;
  }, [allProjects, sortKey, activeResume, resumeProjectEntries, activeTech]);

  const visibleProjects = isExpanded
    ? processedProjects
    : processedProjects.slice(0, 6);

  return (
    <Section id="projects" title="Projects">
      {error && (
        <p className="text-sm text-amber-600/90 mb-4">
          {error} — showing curated projects only.
        </p>
      )}

      {/* Filter / sort bar */}
      <div className="flex flex-wrap items-center gap-4 -mt-6 mb-6">
        {/* Label */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
            Filters
          </span>
        </div>
        <div className="w-px h-6 bg-neutral-700 shrink-0" aria-hidden />

        <FilterDropdown
          icon={<ArrowDownUp className="w-4 h-4 shrink-0" />}
          label="Sort"
          options={SORT_OPTIONS}
          value={sortKey}
          onChange={(v) => setSortKey(v as SortKey)}
        />
        <div className="w-px h-6 bg-neutral-700 shrink-0" aria-hidden />
        <FilterDropdown
          icon={<Code2 className="w-4 h-4 shrink-0" />}
          label="Stack"
          options={topTechOptions}
          value={activeTech}
          onChange={setActiveTech}
        />
        <div className="w-px h-6 bg-neutral-700 shrink-0" aria-hidden />
        <FilterDropdown
          icon={<FileText className="w-4 h-4 shrink-0" />}
          label="Resume"
          options={RESUME_LABELS.map((l) => ({ key: l, label: l }))}
          value={activeResume}
          onChange={(v) => setActiveResume(v as ResumeLabel)}
        />
        {resumeLoading && (
          <span className="text-sm text-neutral-600 italic">loading…</span>
        )}

        {/* Reset */}
        <div className="w-px h-6 bg-neutral-700 shrink-0" aria-hidden />
        <button
          onClick={() => { setSortKey("updated-desc"); setActiveResume("All"); setActiveTech("All"); }}
          disabled={sortKey === "updated-desc" && activeResume === "All" && activeTech === "All"}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-600 text-sm font-semibold text-neutral-300 hover:border-white hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed disabled:border-neutral-800"
          title="Reset filters"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>Reset</span>
        </button>
      </div>

      {visibleProjects.length === 0 && !loading ? (
        <p className="text-neutral-500 text-sm py-8 text-center">
          No projects match the selected resume filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProjects.map((project, index) => (
            <ProjectCard key={`${project.title}-${index}`} project={project} />
          ))}
        </div>
      )}

      {processedProjects.length > 6 && (
        <div className="mt-12 flex flex-col items-center gap-2">
          {loading && !isExpanded && (
            <span className="text-xs text-neutral-500">
              Updating from GitHub…
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col items-center gap-2 text-neutral-500 hover:text-white transition-colors group p-2"
          >
            <span className="text-sm font-medium tracking-widest uppercase">
              {isExpanded ? "Show Less" : "View All Projects"}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />
            ) : (
              <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform duration-300" />
            )}
          </button>
        </div>
      )}
    </Section>
  );
};

export default ProjectsHybrid;
