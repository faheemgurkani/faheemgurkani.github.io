"use client"

import { useEffect, useState } from "react"
import { aboutData } from "@/lib/portfolio-data"

const ROTATE_MS = 2800
const FADE_MS = 360

export function AboutHeadline() {
  const roles = aboutData.headlineRoles
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let swapTimer: number | undefined

    const id = window.setInterval(() => {
      setVisible(false)
      swapTimer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % roles.length)
        setVisible(true)
      }, FADE_MS)
    }, ROTATE_MS)

    return () => {
      window.clearInterval(id)
      if (swapTimer) window.clearTimeout(swapTimer)
    }
  }, [roles.length])

  const role = roles[index]

  return (
    <h3 className="about-headline">
      <span className="about-headline-prefix">Researcher &</span>
      <span className="about-headline-tail">
        <span className="about-headline-role-wrap">
          <span className={`about-headline-role ${visible ? "is-visible" : "is-hidden"}`}>
            {role}
          </span>
        </span>
        <span className="about-headline-suffix"> Engineer</span>
      </span>
    </h3>
  )
}
