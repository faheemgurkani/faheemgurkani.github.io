"use client"

import { useEffect, useState } from "react"
import { aboutData } from "@/lib/portfolio-data"
import { fetchGitHubStats, type GitHubStats } from "@/lib/github"
import { ProcessingDots } from "@/components/processing-dots"
import { StatCounter, type StatItem } from "@/components/stat-counter"

interface AboutSectionProps {
  data?: typeof aboutData
}

const REFRESH_MS = 5 * 60 * 1000

function buildStats(live?: Partial<GitHubStats> | null): StatItem[] {
  if (!live || typeof live.projectCount !== "number") return aboutData.stats

  const years = live.yearsActive ?? 3
  const projects = live.projectCount ?? live.publicRepos ?? 0
  const stars = live.totalStars ?? 0
  const linesK =
    live.linesOfCodeK ??
    (live.linesOfCode ? Math.max(1, Math.round(live.linesOfCode / 1000)) : 1)

  return [
    {
      value: `${String(years).padStart(2, "0")}+`,
      label: "Years XP",
      target: years,
      suffix: "+",
      pad: 2,
    },
    {
      value: String(projects).padStart(3, "0"),
      label: "Projects",
      target: projects,
      pad: 3,
    },
    {
      value: String(stars).padStart(3, "0"),
      label: "Stars",
      target: stars,
      pad: 3,
    },
    {
      value: `${linesK}k`,
      label: "Lines",
      target: linesK,
      suffix: "k",
    },
  ]
}

export function AboutSection({ data = aboutData }: AboutSectionProps) {
  const [stats, setStats] = useState<StatItem[]>(data.stats)
  const [live, setLive] = useState(false)
  const [syncedAt, setSyncedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadLive() {
      try {
        const payload = await fetchGitHubStats({ enrichLanguages: false })
        if (cancelled) return
        setStats(buildStats(payload))
        setLive(true)
        setSyncedAt(payload.fetchedAt)
      } catch {
        if (cancelled) return
        // Offline / rate-limit fallback only
        try {
          const res = await fetch(`/data/github-stats.json?t=${Date.now()}`, {
            cache: "no-store",
          })
          if (res.ok) {
            const baked = (await res.json()) as GitHubStats
            setStats(buildStats(baked))
            setLive(false)
            setSyncedAt(baked.fetchedAt ?? null)
            return
          }
        } catch {
          /* ignore */
        }
        setStats(data.stats)
        setLive(false)
      }
    }

    loadLive()
    const id = window.setInterval(loadLive, REFRESH_MS)
    const onFocus = () => loadLive()
    window.addEventListener("focus", onFocus)

    return () => {
      cancelled = true
      window.clearInterval(id)
      window.removeEventListener("focus", onFocus)
    }
  }, [data.stats])

  return (
    <div className="section-stack">
      <div>
        <h2 className="section-title">About Me</h2>
        <p style={{ color: "var(--accent-retro)", marginBottom: "10px" }}>
          {data.initMessage}
          <ProcessingDots /> ]
          {live ? " · LIVE_GITHUB_KPI" : syncedAt ? " · CACHED_FALLBACK" : ""}
        </p>
        <h3 className="about-headline">
          {data.headlineParts.before}
          <span>{data.headlineParts.highlight}</span>
          {data.headlineParts.after}
        </h3>
        <p className="about-description">{data.description}</p>
      </div>

      <div className="stats-bar stats-bar-compact">
        {stats.map((stat) => (
          <div key={`${stat.label}-${stat.target}-${stat.suffix ?? ""}`} className="stat-item">
            <StatCounter stat={stat} />
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="subsection-title">What I&apos;m Doing</h3>
        <div className="services-grid">
          {data.services.map((service, index) => (
            <div key={index} className="service-card">
              <span className="project-tag">{service.code}</span>
              <h4 className="service-title">{service.title}</h4>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="marquee-container marquee-compact">
        <div className="marquee-text">
          {[...data.marquee, ...data.marquee].map((item, index) => (
            <span key={index}>{item} • </span>
          ))}
        </div>
      </div>
    </div>
  )
}
