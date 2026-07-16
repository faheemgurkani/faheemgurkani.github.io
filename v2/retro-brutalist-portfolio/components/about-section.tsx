"use client"

import { useEffect, useState } from "react"
import { aboutData } from "@/lib/portfolio-data"
import { fetchGitHubStats, type GitHubStats } from "@/lib/github"
import { ProcessingDots } from "@/components/processing-dots"
import { StatCounter, type StatItem } from "@/components/stat-counter"
import { GitHubHeatmap } from "@/components/github-heatmap"
import { AboutHeadline } from "@/components/about-headline"
import { SpotifyNowPlaying } from "@/components/spotify-now-playing"

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
      label: "Lines of Code",
      target: linesK,
      suffix: "k",
    },
  ]
}

function buildProfileKpis(live?: Partial<GitHubStats> | null): StatItem[] {
  const followers = live?.followers ?? 0
  const repos = live?.publicRepos ?? 0
  const contribs = live?.contributionsLastYear ?? 0
  const following = live?.following ?? 0

  return [
    {
      value: String(followers).padStart(2, "0"),
      label: "Followers",
      target: followers,
      pad: 2,
    },
    {
      value: String(repos).padStart(2, "0"),
      label: "Public Repos",
      target: repos,
      pad: 2,
    },
    {
      value: String(contribs),
      label: "Contribs / Yr",
      target: contribs,
    },
    {
      value: String(following).padStart(2, "0"),
      label: "Following",
      target: following,
      pad: 2,
    },
  ]
}

export function AboutSection({ data = aboutData }: AboutSectionProps) {
  const [stats, setStats] = useState<StatItem[]>(data.stats)
  const [profileKpis, setProfileKpis] = useState<StatItem[]>(buildProfileKpis())

  useEffect(() => {
    let cancelled = false

    async function loadLive() {
      try {
        const payload = await fetchGitHubStats({ enrichLanguages: false })
        if (cancelled) return
        setStats(buildStats(payload))
        setProfileKpis(buildProfileKpis(payload))
      } catch {
        if (cancelled) return
        try {
          const res = await fetch(`/data/github-stats.json?t=${Date.now()}`, {
            cache: "no-store",
          })
          if (res.ok) {
            const baked = (await res.json()) as GitHubStats
            setStats(buildStats(baked))
            setProfileKpis(buildProfileKpis(baked))
            return
          }
        } catch {
          /* ignore */
        }
        setStats(data.stats)
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
      <h2 className="section-title">About Me</h2>

      <div className="about-intro-grid">
        <div className="about-intro-copy">
          <p style={{ color: "var(--accent-retro)", marginBottom: "10px" }}>
            {data.initMessage}
            <ProcessingDots /> ]
          </p>
          <AboutHeadline />
          <p className="about-description">{data.description}</p>
        </div>
        <div className="about-intro-spotify">
          <SpotifyNowPlaying />
        </div>
      </div>

      <div>
        <h3 className="subsection-title">Portfolio Signals</h3>
        <div className="stats-bar-stack">
          <div className="stats-bar stats-bar-compact stats-bar-merged">
            {stats.map((stat) => (
              <div key={`${stat.label}-${stat.target}-${stat.suffix ?? ""}`} className="stat-item">
                <StatCounter stat={stat} />
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="stats-bar stats-bar-compact stats-bar-merged stats-bar-merged-bottom">
            {profileKpis.map((stat) => (
              <div key={`${stat.label}-${stat.target}`} className="stat-item">
                <StatCounter stat={stat} />
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GitHubHeatmap />

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
