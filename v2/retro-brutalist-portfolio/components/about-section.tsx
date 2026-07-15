"use client"

import { useEffect, useState } from "react"
import { aboutData } from "@/lib/portfolio-data"
import { fetchGitHubStatsLite, type GitHubStats } from "@/lib/github"
import { ProcessingDots } from "@/components/processing-dots"
import { StatCounter, type StatItem } from "@/components/stat-counter"

interface AboutSectionProps {
  data?: typeof aboutData
}

function buildStats(live?: Partial<GitHubStats> | null): StatItem[] {
  if (!live || typeof live.projectCount !== "number") return aboutData.stats

  const years = live.yearsActive ?? 3
  const projects = live.projectCount ?? live.publicRepos ?? 0
  const stars = live.totalStars ?? 0
  const linesK =
    live.linesOfCodeK ??
    (live.linesOfCode ? Math.max(1, Math.round(live.linesOfCode / 1000)) : undefined)

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
    linesK != null
      ? {
          value: `${linesK}k`,
          label: "Lines",
          target: linesK,
          suffix: "k",
        }
      : {
          value: String(live.followers ?? 0).padStart(3, "0"),
          label: "Followers",
          target: live.followers ?? 0,
          pad: 3,
        },
  ]
}

export function AboutSection({ data = aboutData }: AboutSectionProps) {
  const [stats, setStats] = useState<StatItem[]>(data.stats)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      let baked: Partial<GitHubStats> | null = null
      try {
        const res = await fetch("/data/github-stats.json", { cache: "no-store" })
        if (res.ok) baked = await res.json()
      } catch {
        /* optional bake */
      }

      try {
        const lite = await fetchGitHubStatsLite()
        if (cancelled) return
        setStats(
          buildStats({
            ...baked,
            ...lite,
            // Keep authenticated LOC from bake when live lite has none
            linesOfCode: lite.linesOfCode || baked?.linesOfCode,
            linesOfCodeK: lite.linesOfCodeK || baked?.linesOfCodeK,
            totalLanguageBytes: lite.totalLanguageBytes || baked?.totalLanguageBytes,
          }),
        )
        setLive(true)
      } catch {
        if (cancelled) return
        if (baked) {
          setStats(buildStats(baked))
          setLive(true)
        } else {
          setStats(data.stats)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [data.stats])

  return (
    <div className="section-stack">
      <div>
        <h2 className="section-title">About Me</h2>
        <p style={{ color: "var(--accent-retro)", marginBottom: "10px" }}>
          {data.initMessage}
          <ProcessingDots /> ]
          {live ? " · LIVE_GITHUB_KPI" : ""}
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
