"use client"

import { useEffect, useState } from "react"
import { aboutData } from "@/lib/portfolio-data"
import { fetchGitHubStats } from "@/lib/github"
import { ProcessingDots } from "@/components/processing-dots"
import { StatCounter, type StatItem } from "@/components/stat-counter"

interface AboutSectionProps {
  data?: typeof aboutData
}

interface GitHubStatsResponse {
  yearsActive: number
  publicRepos: number
  totalStars: number
  followers: number
}

function buildStats(live?: GitHubStatsResponse | null): StatItem[] {
  if (!live) return aboutData.stats
  return [
    {
      value: `${String(live.yearsActive).padStart(2, "0")}+`,
      label: "Years XP",
      target: live.yearsActive,
      suffix: "+",
      pad: 2,
    },
    {
      value: String(live.publicRepos).padStart(3, "0"),
      label: "Repos",
      target: live.publicRepos,
      pad: 3,
    },
    {
      value: String(live.totalStars).padStart(3, "0"),
      label: "Stars",
      target: live.totalStars,
      pad: 3,
    },
    {
      value: String(live.followers).padStart(3, "0"),
      label: "Followers",
      target: live.followers,
      pad: 3,
    },
  ]
}

export function AboutSection({ data = aboutData }: AboutSectionProps) {
  const [stats, setStats] = useState<StatItem[]>(data.stats)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchGitHubStats()
      .then((payload: GitHubStatsResponse) => {
        if (cancelled || typeof payload.publicRepos !== "number") return
        setStats(buildStats(payload))
        setLive(true)
      })
      .catch(() => {
        if (!cancelled) setStats(data.stats)
      })
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
        {stats.map((stat, index) => (
          <div key={`${stat.label}-${stat.target}`} className="stat-item">
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
