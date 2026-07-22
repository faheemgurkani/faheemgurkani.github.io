"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  fetchContributionCalendar,
  type ContributionCalendar,
} from "@/lib/github"
import { GITHUB_USERNAME } from "@/lib/portfolio-data"
import { WindowControls } from "@/components/window-controls"

const ActivityCalendar = dynamic(
  () =>
    import("react-activity-calendar").then((mod) => mod.ActivityCalendar),
  { ssr: false },
)

const REFRESH_MS = 30 * 60 * 1000
const BLOCK_MARGIN = 3
const WEEKDAY_LABEL_OFFSET = 34

const THEME = {
  light: ["#121212", "#5c5c5c", "#858585", "#b0b0b0", "#efefef"],
  dark: ["#121212", "#5c5c5c", "#858585", "#b0b0b0", "#efefef"],
}

export function GitHubHeatmap() {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [blockSize, setBlockSize] = useState(12)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchContributionCalendar()
        if (!cancelled) {
          setCalendar(data)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setCalendar(null)
          setLoading(false)
        }
      }
    }

    load()
    const id = window.setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const updateSize = () => {
      const weeks = Math.max(
        52,
        Math.ceil((calendar?.contributions.length ?? 365) / 7),
      )
      const usable = Math.max(180, el.clientWidth - WEEKDAY_LABEL_OFFSET)
      const size = Math.floor((usable - (weeks - 1) * BLOCK_MARGIN) / weeks)
      setBlockSize(Math.max(9, Math.min(18, size)))
    }

    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(el)
    window.addEventListener("resize", updateSize)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", updateSize)
    }
  }, [calendar?.contributions.length])

  const total = calendar?.total ?? 0

  return (
    <div className="window-frame signal-frame">
      <div className="window-header">
        <span>GH_CONTRIBUTION_MAP.DAT</span>
        <WindowControls />
      </div>
      <div className="signal-frame-body">
        <div className="signal-frame-meta">
          <span className="project-tag">ACTIVITY</span>
          <p className="signal-frame-title">
            {loading
              ? "Syncing contribution graph…"
              : `${total} contributions in the last year`}
          </p>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="signal-frame-link"
          >
            github.com/{GITHUB_USERNAME} ↗
          </a>
        </div>

        <div className="heatmap-wrap" ref={wrapRef}>
          {calendar ? (
            <ActivityCalendar
              data={calendar.contributions}
              theme={THEME}
              colorScheme="dark"
              blockSize={blockSize}
              blockMargin={BLOCK_MARGIN}
              blockRadius={0}
              fontSize={11}
              maxLevel={4}
              showWeekdayLabels={["mon", "wed", "fri"]}
              labels={{
                totalCount: "{{count}} commits logged",
                legend: { less: "Less", more: "More" },
              }}
              tooltips={{
                activity: {
                  text: (activity) => {
                    const count = activity.count
                    const label = count === 1 ? "contribution" : "contributions"
                    const date = new Date(`${activity.date}T12:00:00`)
                    const when = date.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    return `${count} ${label} on ${when}`
                  },
                  placement: "top",
                  withArrow: true,
                },
              }}
            />
          ) : (
            <div className="heatmap-loading" aria-busy={loading} aria-hidden />
          )}
        </div>
      </div>
    </div>
  )
}
