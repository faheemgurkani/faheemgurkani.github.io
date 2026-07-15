"use client"

import { useEffect, useState } from "react"
import {
  SPOTIFY_PROFILE_URL,
  SPOTIFY_WIDGET_URL,
} from "@/lib/portfolio-data"
import { WindowControls } from "@/components/window-controls"

const REFRESH_MS = 45_000

export function SpotifyNowPlaying() {
  const [src, setSrc] = useState(SPOTIFY_WIDGET_URL)

  useEffect(() => {
    const tick = () => {
      setSrc(`${SPOTIFY_WIDGET_URL}&t=${Date.now()}`)
    }
    const id = window.setInterval(tick, REFRESH_MS)
    const onFocus = () => tick()
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearInterval(id)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  return (
    <div className="window-frame signal-frame">
      <div className="window-header">
        <span>SPOTIFY_NOW_PLAYING.SYS</span>
        <WindowControls />
      </div>
      <div className="signal-frame-body spotify-frame-body">
        <div className="signal-frame-meta">
          <span className="project-tag">AUDIO</span>
          <p className="signal-frame-title">Live listening feed</p>
        </div>
        <a
          href={SPOTIFY_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-widget-link"
        >
          <img
            src={src}
            alt="Spotify now playing"
            className="spotify-widget-img"
            loading="lazy"
          />
        </a>
      </div>
    </div>
  )
}
