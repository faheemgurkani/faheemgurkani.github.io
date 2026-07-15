"use client"

import { useEffect, useState } from "react"
import { fetchTopLanguages, type LanguageStat } from "@/lib/github"
import { ProcessingDots } from "@/components/processing-dots"

const REFRESH_MS = 10 * 60 * 1000

export function GitHubLanguageBars() {
  const [langs, setLangs] = useState<LanguageStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchTopLanguages(8)
        if (!cancelled) {
          setLangs(data)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setLangs([])
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

  return (
    <section className="terminal-section terminal-compact">
      <div className="terminal-header">LANG_TELEMETRY.SH</div>
      <div className="terminal-row">
        <span className="prompt">{"guest@system:~$"}</span>
        <span className="command">analyze --top-langs --public-repos</span>
      </div>
      <div className="terminal-row">
        <span className="output">
          {loading ? (
            <>
              {"> Sampling repository language bytes"}
              <ProcessingDots />
            </>
          ) : (
            `> ${langs.length} languages ranked by estimated repo weight`
          )}
        </span>
      </div>

      {!loading &&
        langs.map((lang) => {
          const filled = Math.max(1, Math.round((lang.percent / 100) * 24))
          const bar = `${"█".repeat(filled)}${"░".repeat(24 - filled)}`
          return (
            <div key={lang.name} className="terminal-row terminal-skill-row">
              <span className="output">
                {`  [${bar}] ${String(lang.percent).padStart(5, " ")}%  ${lang.name.toUpperCase()}`}
              </span>
            </div>
          )
        })}
    </section>
  )
}
