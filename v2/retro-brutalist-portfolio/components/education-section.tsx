import { resumeData } from "@/lib/portfolio-data"

interface EducationSectionProps {
  data?: typeof resumeData
}

export function EducationSection({ data = resumeData }: EducationSectionProps) {
  return (
    <div className="section-stack">
      <h2 className="section-title">Education</h2>
      <div className="timeline">
        {data.education.map((item, index) => (
          <div key={index} className="timeline-item">
            <span className="project-tag">{item.code}</span>
            <h4 className="timeline-title">{item.title}</h4>
            <p className="timeline-period">{item.period}</p>
            <p className="timeline-description">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
