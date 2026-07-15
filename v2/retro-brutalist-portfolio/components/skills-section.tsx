import { resumeData } from "@/lib/portfolio-data"
import { ProcessingDots } from "@/components/processing-dots"

interface SkillsSectionProps {
  data?: typeof resumeData
}

export function SkillsSection({ data = resumeData }: SkillsSectionProps) {
  return (
    <div className="section-stack">
      <h2 className="section-title">Skills</h2>
      <section className="terminal-section terminal-compact">
        <div className="terminal-header">SYSTEM_CONSOLE.EXE</div>
        <div className="terminal-row">
          <span className="prompt">{"guest@system:~$"}</span>
          <span className="command">fetch skills --all</span>
        </div>
        <div className="terminal-row">
          <span className="output">
            {"> Analyzing core competencies"}
            <ProcessingDots />
          </span>
        </div>
        {data.skills.map((skill, index) => (
          <div key={index} className="terminal-row">
            <span className="output">
              {`[${skill.bar}] ${skill.level}% - ${skill.name.toUpperCase()}`}
            </span>
          </div>
        ))}
        <div className="terminal-row">
          <span className="prompt">{"guest@system:~$"}</span>
          <span className="command">status --complete</span>
        </div>
        <div className="terminal-row">
          <span className="output">
            {"> All modules loaded. "}
            <span className="cursor-blink">_</span>
          </span>
        </div>
      </section>
    </div>
  )
}
