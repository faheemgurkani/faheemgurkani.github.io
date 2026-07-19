"use client"

import { PortfolioSiblingLink } from "@/components/portfolio-sibling-link"
import type { ActiveSection } from "@/components/section-nav-bar"
import { publicationsData } from "@/lib/portfolio-data"

interface PublicationsSectionProps {
  data?: typeof publicationsData
  onNavigateToSection?: (section: ActiveSection) => void
}

type PublicationItem =
  | (typeof publicationsData.accepted)[number]
  | (typeof publicationsData.inPreparation)[number]

function PublicationCitation({ item }: { item: PublicationItem }) {
  return (
    <p className="timeline-description publication-citation">
      {item.authors}, <em>{item.title}</em>
      {"venue" in item && item.venue ? `, ${item.venue}` : ""}
      {"details" in item && item.details ? `. ${item.details}` : "."}
    </p>
  )
}

export function PublicationsSection({
  data = publicationsData,
  onNavigateToSection,
}: PublicationsSectionProps) {
  return (
    <div className="section-stack">
      <header className="section-heading-block">
        <h2 className="section-title">Publications & Research</h2>
        {onNavigateToSection && (
          <PortfolioSiblingLink
            target="projects"
            onNavigate={onNavigateToSection}
          />
        )}
      </header>

      <div className="experience-group">
        <h3 className="subsection-title">Accepted</h3>
        <div className="timeline">
          {data.accepted.map((item) => (
            <article key={item.code} className="timeline-item">
              <span className="project-tag">{item.code}</span>
              <PublicationCitation item={item} />
            </article>
          ))}
        </div>
      </div>

      <div className="experience-group">
        <h3 className="subsection-title">In Preparation / Active Submission</h3>
        <div className="timeline">
          {data.inPreparation.map((item) => (
            <article key={item.code} className="timeline-item">
              <span className="project-tag">{item.code}</span>
              <PublicationCitation item={item} />
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
