"use client"

import { useState } from "react"

const DEFAULT_VISIBLE = 2

interface ExpandableBulletsProps {
  bullets: string[]
  id: string
}

export function ExpandableBullets({ bullets, id }: ExpandableBulletsProps) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = bullets.length > DEFAULT_VISIBLE
  const visible = expanded ? bullets : bullets.slice(0, DEFAULT_VISIBLE)

  if (bullets.length === 0) return null

  return (
    <div className="timeline-bullets-wrap">
      <ul className="timeline-bullets" id={`bullets-${id}`}>
        {visible.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          className="timeline-more-btn"
          aria-expanded={expanded}
          aria-controls={`bullets-${id}`}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "less" : "…more"}
        </button>
      )}
    </div>
  )
}
