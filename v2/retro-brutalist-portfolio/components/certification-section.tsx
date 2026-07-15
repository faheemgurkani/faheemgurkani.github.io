import { certificationData } from "@/lib/portfolio-data"

interface CertificationSectionProps {
  data?: typeof certificationData
}

export function CertificationSection({ data = certificationData }: CertificationSectionProps) {
  return (
    <div className="section-stack">
      <h2 className="section-title">Certification</h2>
      <p style={{ color: "var(--accent-retro)", fontSize: "0.75rem", marginTop: "-8px" }}>
        CREDENTIAL_STORE · {data.items.length} ENTRIES
      </p>

      <div className="timeline">
        {data.items.map((item, index) => (
          <div key={index} className="timeline-item">
            <span className="project-tag">{item.code}</span>
            <h4 className="timeline-title">{item.title}</h4>
            <p className="timeline-period">{item.period}</p>
            <p className="timeline-description">{item.description}</p>
          </div>
        ))}
      </div>

      <a
        href={data.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-retro"
        style={{ display: "inline-block", textDecoration: "none", width: "fit-content" }}
      >
        VIEW_ON_LINKEDIN →
      </a>
    </div>
  )
}
