"use client"

import { useEffect, useState } from "react"

export type StatItem = {
  value: string
  label: string
  target: number
  suffix?: string
  pad?: number
}

function formatStatValue(value: number, stat: StatItem) {
  const digits = stat.pad ? String(value).padStart(stat.pad, "0") : String(value)
  return `${digits}${stat.suffix ?? ""}`
}

export function StatCounter({ stat, duration = 1600 }: { stat: StatItem; duration?: number }) {
  const [display, setDisplay] = useState(() => formatStatValue(0, stat))

  useEffect(() => {
    const start = performance.now()
    let frame = 0

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(stat.target * eased)
      setDisplay(formatStatValue(current, stat))

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    setDisplay(formatStatValue(0, stat))
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [stat, duration])

  return <div className="stat-val">{display}</div>
}
