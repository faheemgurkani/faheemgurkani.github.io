"use client"

import type { ActiveSection } from "@/components/section-nav-bar"

interface PortfolioSiblingLinkProps {
  target: Extract<ActiveSection, "projects" | "publications">
  onNavigate: (section: ActiveSection) => void
}

const LINK_COPY: Record<
  PortfolioSiblingLinkProps["target"],
  { label: string; hint: string }
> = {
  publications: {
    label: "Publications & Research",
    hint: "View peer-reviewed work and active submissions",
  },
  projects: {
    label: "Projects",
    hint: "Browse GitHub repos, demos, and work in progress",
  },
}

export function PortfolioSiblingLink({
  target,
  onNavigate,
}: PortfolioSiblingLinkProps) {
  const copy = LINK_COPY[target]

  return (
    <button
      type="button"
      className="portfolio-sibling-link"
      onClick={() => onNavigate(target)}
      aria-label={`Go to ${copy.label}`}
    >
      <span className="portfolio-sibling-link-body">
        <span className="portfolio-sibling-link-bracket" aria-hidden>
          [
        </span>
        <span className="portfolio-sibling-link-prefix">Also see</span>
        <span className="portfolio-sibling-link-sep" aria-hidden>
          /
        </span>
        <span className="portfolio-sibling-link-label">{copy.label}</span>
        <span className="portfolio-sibling-link-arrow" aria-hidden>
          ↗
        </span>
        <span className="portfolio-sibling-link-bracket" aria-hidden>
          ]
        </span>
      </span>
      <span className="sr-only">{copy.hint}</span>
    </button>
  )
}
