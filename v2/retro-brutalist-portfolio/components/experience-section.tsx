import { resumeData } from "@/lib/portfolio-data"
import { ExpandableBullets } from "@/components/expandable-bullets"

interface ExperienceSectionProps {
  data?: typeof resumeData
}

export function ExperienceSection({ data = resumeData }: ExperienceSectionProps) {
  const { jobs, societies } = data.experience

  return (
    <div className="section-stack">
      <h2 className="section-title">Experience</h2>

      <div className="experience-group">
        <h3 className="subsection-title">Jobs & Internships</h3>
        <div className="timeline">
          {jobs.map((item) => (
            <article key={item.code} className="timeline-item timeline-job">
              <span className="project-tag">{item.code}</span>
              <h4 className="timeline-title">{item.title}</h4>
              <p className="timeline-meta">
                {item.company} · {item.employmentType}
              </p>
              <p className="timeline-period">
                {item.period}
                {item.duration ? ` · ${item.duration}` : ""}
              </p>
              <p className="timeline-location">{item.location}</p>
              <ExpandableBullets bullets={item.bullets} id={item.code} />
              {item.skills?.length ? (
                <p className="timeline-skills">◇ {item.skills.join(", ")}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div className="experience-group">
        <h3 className="subsection-title">Societies & Volunteer Work</h3>
        <div className="timeline">
          {societies.map((org) => (
            <article key={org.code} className="timeline-item timeline-org">
              <span className="project-tag">{org.code}</span>
              <h4 className="timeline-title">{org.organization}</h4>
              <p className="timeline-meta">
                {org.employmentType} · {org.duration}
              </p>
              <p className="timeline-period">{org.period}</p>
              <p className="timeline-location">{org.location}</p>

              <div className="timeline-nested">
                {org.roles.map((role, index) => (
                  <div key={`${org.code}-${index}`} className="timeline-nested-item">
                    <span className="timeline-nested-dot" aria-hidden />
                    <div className="timeline-nested-content">
                      <h5 className="timeline-nested-title">{role.title}</h5>
                      <p className="timeline-nested-period">
                        {role.period}
                        {role.duration ? ` · ${role.duration}` : ""}
                      </p>
                      {role.bullets?.length ? (
                        <ExpandableBullets
                          bullets={role.bullets}
                          id={`${org.code}-${index}`}
                        />
                      ) : null}
                      {role.skills?.length ? (
                        <p className="timeline-skills">◇ {role.skills.join(", ")}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
