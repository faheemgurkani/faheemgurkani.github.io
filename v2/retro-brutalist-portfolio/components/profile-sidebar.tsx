"use client"

import { useEffect } from "react"
import { WindowControls } from "@/components/window-controls"
import { profileData, socialLinks } from "@/lib/portfolio-data"
import { SocialIcon } from "@/components/social-icons"

interface ProfileSidebarProps {
  data?: typeof profileData
}

export function ProfileSidebar({ data = profileData }: ProfileSidebarProps) {
  useEffect(() => {
    function updateClock() {
      const now = new Date()
      const timeStr =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0") +
        ":" +
        now.getSeconds().toString().padStart(2, "0")
      const statusElement = document.querySelector(".system-status")
      if (statusElement) {
        statusElement.textContent = `SYS_UP: ${timeStr} | CPU: ${Math.floor(Math.random() * 20) + 5}%`
      }
    }
    updateClock()
    const interval = setInterval(updateClock, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="profile-sidebar">
      <div className="sidebar-logo">{data.name}</div>

      <div className="window-frame sidebar-portrait">
        <div className="window-header">
          <span>PROFILE_PICTURE.PNG</span>
          <WindowControls />
        </div>
        <img src={data.avatar} alt={data.name} className="hero-image sidebar-image" />
      </div>

      <p className="sidebar-title">{data.title}</p>

      <div className="sidebar-divider" />

      <div className="sidebar-info-grid">
        <div className="sidebar-info-item">
          <span className="sidebar-info-label">EMAIL</span>
          <a href={`mailto:${data.email}`} className="sidebar-info-value">
            {data.email}
          </a>
        </div>
        <div className="sidebar-info-item">
          <span className="sidebar-info-label">PHONE</span>
          <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="sidebar-info-value">
            {data.phone}
          </a>
        </div>
        <div className="sidebar-info-item">
          <span className="sidebar-info-label">LOCATION</span>
          <span className="sidebar-info-value">{data.location}</span>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-social">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-social-link"
          >
            <SocialIcon label={link.label} />
            {link.label}
          </a>
        ))}
      </div>

      <div className="system-status sidebar-status">SYS_UP: 00:00:00 | CPU: 12%</div>
    </aside>
  )
}
