"use client"

import { useEffect, useMemo, useState } from "react"
import { WindowControls } from "@/components/window-controls"
import { portfolioData, curatedProjects } from "@/lib/portfolio-data"
import { fetchGitHubProjects, type PortfolioProject } from "@/lib/github"

interface PortfolioSectionProps {
  data?: typeof portfolioData
}

export function PortfolioSection({ data = portfolioData }: PortfolioSectionProps) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [projects, setProjects] = useState<PortfolioProject[]>(data.projects)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"live" | "curated">("curated")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const bakedRes = await fetch("/data/github-projects.json", { cache: "no-store" })
        if (bakedRes.ok) {
          const baked = (await bakedRes.json()) as PortfolioProject[]
          if (!cancelled && Array.isArray(baked) && baked.length > 0) {
            setProjects(baked)
            setSource("live")
            setLoading(false)
            return
          }
        }
      } catch {
        /* fall through */
      }

      try {
        const payload = await fetchGitHubProjects({ enrich: false })
        if (cancelled) return
        if (Array.isArray(payload) && payload.length > 0) {
          setProjects(payload)
          setSource("live")
        } else {
          setProjects(curatedProjects)
          setSource("curated")
        }
      } catch {
        if (!cancelled) {
          setProjects(curatedProjects)
          setSource("curated")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const fromProjects = Array.from(new Set(projects.map((p) => p.category)))
    return ["all", ...fromProjects.filter((c) => c !== "all")]
  }, [projects])

  const filteredProjects =
    activeFilter === "all" ? projects : projects.filter((p) => p.category === activeFilter)

  return (
    <div className="section-stack">
      <h2 className="section-title">Latest Deployments</h2>
      <p style={{ color: "var(--accent-retro)", fontSize: "0.75rem", marginTop: "-8px" }}>
        {loading
          ? "SYNCING_GITHUB_REPOS..."
          : source === "live"
            ? `LIVE_GITHUB · ${projects.length} NODES`
            : `CURATED_FALLBACK · ${projects.length} NODES`}
      </p>

      <div className="filter-bar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`filter-btn ${activeFilter === category ? "filter-btn-active" : ""}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="portfolio-grid portfolio-grid-compact">
        {filteredProjects.map((project, index) => {
          const href = project.homepage || project.repoUrl
          const CardInner = (
            <>
              <div className="window-header" style={{ background: "#333", color: "#fff" }}>
                <span>{project.code}</span>
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
                  {project.description}
                </p>
                {(project.stars != null || project.lastUpdated || project.linesOfCode != null) && (
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
              key={`${project.code}-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card"
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              {CardInner}
            </a>
          ) : (
            <div key={`${project.code}-${index}`} className="project-card">
              {CardInner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
