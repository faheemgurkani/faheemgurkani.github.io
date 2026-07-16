"use client";

import { useEffect, useRef, useState } from "react";
import { WindowControls } from "@/components/window-controls";
import { profileData, socialLinks, RESUME_OPTIONS } from "@/lib/portfolio-data";
import { SocialIcon } from "@/components/social-icons";

interface ProfileSidebarProps {
  data?: typeof profileData;
}

type PerformanceMemory = Performance & {
  memory?: {
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};

function formatClock(now: Date) {
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatUptime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function readMemPercent() {
  const memory = (performance as PerformanceMemory).memory;
  if (!memory?.jsHeapSizeLimit) return null;
  return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
}

async function measureLatency() {
  const start = performance.now();
  try {
    await fetch(`${window.location.origin}${window.location.pathname || "/"}`, {
      method: "HEAD",
      cache: "no-store",
    });
    return Math.max(1, Math.round(performance.now() - start));
  } catch {
    return null;
  }
}

export function ProfileSidebar({ data = profileData }: ProfileSidebarProps) {
  const [socialOpen, setSocialOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const bootTimeRef = useRef<number | null>(null);
  const [clk, setClk] = useState("00:00:00");
  const [uptime, setUptime] = useState("00:00:00");
  const [cpu, setCpu] = useState(12);
  const [mem, setMem] = useState<number | null>(null);
  const [lat, setLat] = useState<number | null>(null);

  useEffect(() => {
    bootTimeRef.current = performance.timeOrigin;

    let cancelled = false;
    const ping = async () => {
      const nextLat = await measureLatency();
      if (!cancelled && nextLat !== null) setLat(nextLat);
    };
    void ping();
    const pingInterval = window.setInterval(() => {
      void ping();
    }, 30000);

    const tick = () => {
      const now = new Date();
      setClk(formatClock(now));

      if (bootTimeRef.current !== null) {
        setUptime(formatUptime(Date.now() - bootTimeRef.current));
      }

      setCpu((value) => {
        const drift = Math.round((Math.random() - 0.5) * 4);
        return Math.min(24, Math.max(5, value + drift));
      });

      setMem(readMemPercent());
    };

    tick();
    const clockInterval = window.setInterval(tick, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(pingInterval);
      window.clearInterval(clockInterval);
    };
  }, []);

  return (
    <aside className="profile-sidebar">
      <div className="sidebar-logo">{data.name}</div>

      <div className="window-frame sidebar-portrait">
        <div className="window-header">
          <span>PROFILE_PICTURE.PNG</span>
          <WindowControls />
        </div>
        <img
          src={data.avatar}
          alt={data.name}
          className="hero-image sidebar-image"
        />
      </div>

      <blockquote className="sidebar-quote">
        <p className="sidebar-quote-text">&ldquo;{data.quote.text}&rdquo;</p>
        <cite className="sidebar-quote-cite">&mdash; {data.quote.author}</cite>
      </blockquote>

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
          <a
            href={`tel:${data.phone.replace(/\s/g, "")}`}
            className="sidebar-info-value"
          >
            {data.phone}
          </a>
        </div>
        <div className="sidebar-info-item">
          <span className="sidebar-info-label">LOCATION</span>
          <span className="sidebar-info-value">{data.location}</span>
        </div>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-dropdown-grid">
        <div
          className={`sidebar-dropdown ${socialOpen ? "sidebar-dropdown-open" : ""}`}
        >
          <button
            type="button"
            className="sidebar-dropdown-trigger"
            onClick={() => {
              setSocialOpen((open) => !open);
              setResumeOpen(false);
            }}
            aria-expanded={socialOpen}
            aria-controls="sidebar-connect-panel"
          >
            <span>CONNECT</span>
            <span className="sidebar-dropdown-chevron" aria-hidden>
              ▼
            </span>
          </button>
          <div
            id="sidebar-connect-panel"
            className={`sidebar-dropdown-panel ${socialOpen ? "sidebar-dropdown-panel-open" : ""}`}
          >
            <div className="sidebar-dropdown-panel-inner">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-dropdown-link sidebar-dropdown-link-inline"
                >
                  <SocialIcon label={link.label} />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`sidebar-dropdown ${resumeOpen ? "sidebar-dropdown-open" : ""}`}
        >
          <button
            type="button"
            className="sidebar-dropdown-trigger"
            onClick={() => {
              setResumeOpen((open) => !open);
              setSocialOpen(false);
            }}
            aria-expanded={resumeOpen}
            aria-controls="sidebar-cv-panel"
          >
            <span>CV PACKS</span>
            <span className="sidebar-dropdown-chevron" aria-hidden>
              ▼
            </span>
          </button>
          <div
            id="sidebar-cv-panel"
            className={`sidebar-dropdown-panel ${resumeOpen ? "sidebar-dropdown-panel-open" : ""}`}
          >
            <div className="sidebar-dropdown-panel-inner">
              {RESUME_OPTIONS.map((resume) => (
                <a
                  key={resume.path}
                  href={resume.path}
                  download={resume.filename}
                  className="sidebar-dropdown-link"
                >
                  <span>↓ {resume.label}</span>
                  <span className="sidebar-dropdown-link-meta">PDF</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="system-status sidebar-status">
        <span>
          UPTIME: {uptime} | CLK: {clk}
        </span>
        <span className="sidebar-status-row">
          CPU: {cpu}%{mem !== null ? ` | MEM: ${mem}%` : ""} | LAT:{" "}
          {lat !== null ? `${lat}ms` : "—"}
        </span>
      </div>
    </aside>
  );
}
