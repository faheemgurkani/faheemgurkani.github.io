"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { WindowControls } from "@/components/window-controls"
import { curatedProjects, RESUME_OPTIONS } from "@/lib/portfolio-data"
import { fetchGitHubProjects, type PortfolioProject } from "@/lib/github"

type SortKey = "updated-desc" | "updated-asc" | "stars"
type ResumeLabel = "All" | "AI/ML Engineer" | "Backend Engineer" | "CV Engineer"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "updated-desc", label: "Latest first" },
  { key: "updated-asc", label: "Oldest first" },
  { key: "stars", label: "Most starred" },
]

const RESUME_LABELS: ResumeLabel[] = [
  "All",
  "AI/ML Engineer",
  "Backend Engineer",
  "CV Engineer",
]

const INITIAL_VISIBLE = 6

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function techKey(t: string): string {
  return t.replace(/\s*\([\d.]+%\)$/, "").trim()
}

function technologiesOf(p: PortfolioProject): string[] {
  if (p.technologies?.length) return p.technologies.map(techKey)
  if (!p.tags) return []
  return p.tags
    .split(/\s+/)
    .map((t) => t.replace(/^#/, "").replace(/_/g, " "))
    .filter(Boolean)
}

function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly { key: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.key === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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
                  onChange(opt.key)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function PortfolioSection() {
  const [projects, setProjects] = useState<PortfolioProject[]>(curatedProjects)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("updated-desc")
  const [activeResume, setActiveResume] = useState<ResumeLabel>("All")
  const [activeTech, setActiveTech] = useState("All")
  const [isExpanded, setIsExpanded] = useState(false)
  const [resumeProjectEntries, setResumeProjectEntries] = useState<
    Record<string, { title: string; description: string }[]>
  >({})

  useEffect(() => {
    let cancelled = false

    async function loadLive() {
      try {
        const payload = await fetchGitHubProjects({ enrich: false })
        if (cancelled) return
        if (Array.isArray(payload) && payload.length > 0) {
          setProjects(payload)
        } else {
          throw new Error("empty")
        }
      } catch {
        if (cancelled) return
        try {
          const bakedRes = await fetch(`/data/github-projects.json?t=${Date.now()}`, {
            cache: "no-store",
          })
          if (bakedRes.ok) {
            const baked = (await bakedRes.json()) as PortfolioProject[]
            if (Array.isArray(baked) && baked.length > 0) {
              setProjects(baked)
              return
            }
          }
        } catch {
          /* ignore */
        }
        setProjects(curatedProjects)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLive()
    const id = window.setInterval(loadLive, 5 * 60 * 1000)
    const onFocus = () => loadLive()
    window.addEventListener("focus", onFocus)

    return () => {
      cancelled = true
      window.clearInterval(id)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  useEffect(() => {
    fetch("/data/resume-projects.json")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((entries) => setResumeProjectEntries(entries ?? {}))
  }, [])

  const privateStubs = useMemo<PortfolioProject[]>(() => {
    const seen = new Set<string>()
    const stubs: PortfolioProject[] = []
    for (const entries of Object.values(resumeProjectEntries)) {
      for (const { title, description } of entries) {
        if (seen.has(title)) continue
        seen.add(title)
        const alreadyOnGitHub = projects.some(
          (p) =>
            normalise(p.title).includes(normalise(title)) ||
            normalise(title).includes(normalise(p.title)),
        )
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
          })
        }
      }
    }
    return stubs
  }, [projects, resumeProjectEntries])

  const allProjects = useMemo(
    () => [...projects, ...privateStubs],
    [projects, privateStubs],
  )

  const topTechOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of allProjects) {
      for (const t of technologiesOf(p)) {
        counts.set(t, (counts.get(t) ?? 0) + 1)
      }
    }
    const top5 = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => ({ key: tag, label: tag }))
    return [{ key: "All", label: "All" }, ...top5]
  }, [allProjects])

  const processedProjects = useMemo(() => {
    let result = [...allProjects]

    if (activeResume !== "All") {
      const resumeTitles = (resumeProjectEntries[activeResume] ?? []).map((e) =>
        normalise(e.title),
      )
      result = result.filter((p) =>
        resumeTitles.some(
          (t) => normalise(p.title).includes(t) || t.includes(normalise(p.title)),
        ),
      )
    }

    if (activeTech !== "All") {
      result = result.filter((p) =>
        technologiesOf(p).some((t) => t === activeTech),
      )
    }

    if (sortKey === "stars") {
      result.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))
    } else if (sortKey === "updated-asc") {
      result.sort((a, b) => {
        const da = a.updatedAtRaw ? new Date(a.updatedAtRaw).getTime() : 0
        const db = b.updatedAtRaw ? new Date(b.updatedAtRaw).getTime() : 0
        return da - db
      })
    } else {
      result.sort((a, b) => {
        const da = a.updatedAtRaw ? new Date(a.updatedAtRaw).getTime() : 0
        const db = b.updatedAtRaw ? new Date(b.updatedAtRaw).getTime() : 0
        return db - da
      })
    }

    result.sort((a, b) => {
      if (a.isPrivate && !b.isPrivate) return -1
      if (!a.isPrivate && b.isPrivate) return 1
      return 0
    })

    return result
  }, [allProjects, sortKey, activeResume, resumeProjectEntries, activeTech])

  const visibleProjects = isExpanded
    ? processedProjects
    : processedProjects.slice(0, INITIAL_VISIBLE)

  const filtersActive =
    sortKey !== "updated-desc" || activeResume !== "All" || activeTech !== "All"

  return (
    <div className="section-stack">
      <h2 className="section-title">Latest Deployments</h2>

      <div className="filter-bar retro-filter-bar">
        <span className="retro-filters-heading">FILTERS</span>

        <FilterDropdown
          label="SORT"
          options={SORT_OPTIONS}
          value={sortKey}
          onChange={setSortKey}
        />
        <FilterDropdown
          label="STACK"
          options={topTechOptions}
          value={activeTech}
          onChange={setActiveTech}
        />
        <FilterDropdown
          label="RESUME"
          options={RESUME_LABELS.map((l) => ({ key: l, label: l }))}
          value={activeResume}
          onChange={setActiveResume}
        />

        <button
          type="button"
          className="filter-btn"
          disabled={!filtersActive}
          onClick={() => {
            setSortKey("updated-desc")
            setActiveResume("All")
            setActiveTech("All")
          }}
          title="Reset filters"
        >
          RESET
        </button>

        <div className="retro-resume-links">
          {RESUME_OPTIONS.map((resume) => (
            <a
              key={resume.path}
              href={resume.path}
              download={resume.filename}
              className="filter-btn"
            >
              ↓ {resume.label}
            </a>
          ))}
        </div>
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
          {visibleProjects.map((project, index) => {
            const href = project.isPrivate
              ? undefined
              : project.homepage || project.repoUrl
            const CardInner = (
              <>
                <div className="window-header" style={{ background: "#333", color: "#fff" }}>
                  <span>{project.isPrivate ? "PRIVATE_WIP" : project.code}</span>
                  <WindowControls dark />
                </div>
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-img"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget
                    if (target.src.includes("placeholder")) return
                    target.src = "/placeholder.svg"
                  }}
                />
                <div className="project-info">
                  <span className="project-tag">{project.tags}</span>
                  <h3 className="project-title">{project.title}</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {project.isPrivate
                      ? project.description ||
                        "Under development — repository is private."
                      : project.description}
                  </p>
                  {project.isPrivate && (
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--accent-retro)",
                        marginTop: "8px",
                      }}
                    >
                      ● UNDER_DEVELOPMENT
                    </p>
                  )}
                  {!project.isPrivate &&
                    (project.stars != null ||
                      project.lastUpdated ||
                      project.linesOfCode != null) && (
                      <p
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--accent-retro)",
                          marginTop: "8px",
                        }}
                      >
                        {project.stars != null ? `★ ${project.stars}` : ""}
                        {project.linesOfCode != null
                          ? `${project.stars != null ? " · " : ""}~${project.linesOfCode.toLocaleString()} LOC`
                          : ""}
                        {project.lastUpdated
                          ? `${project.stars != null || project.linesOfCode != null ? " · " : ""}${project.lastUpdated}`
                          : ""}
                      </p>
                    )}
                </div>
              </>
            )

            return href ? (
              <a
                key={`${project.code}-${project.title}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card"
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                {CardInner}
              </a>
            ) : (
              <div
                key={`${project.code}-${project.title}-${index}`}
                className="project-card"
                style={project.isPrivate ? { opacity: 0.85 } : undefined}
              >
                {CardInner}
              </div>
            )
          })}
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
  )
}
