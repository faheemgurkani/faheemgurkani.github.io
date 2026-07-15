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
          <span className="command">tree skills/ --modules</span>
        </div>
        <div className="terminal-row">
          <span className="output">
            {"> Indexing skill modules"}
            <ProcessingDots />
          </span>
        </div>

        {data.skills.map((mod) => (
          <div key={mod.id} className="terminal-skill-module">
            <div className="terminal-row">
              <span className="prompt">{"guest@system:~$"}</span>
              <span className="command">{`cat ${mod.path}manifest.mod`}</span>
            </div>
            <div className="terminal-row">
              <span className="output terminal-module-header">
                {`> [${mod.code}] ${mod.category.toUpperCase()}  ·  ${mod.items.length} PACKAGES`}
              </span>
            </div>
            {mod.items.map((skill) => (
              <div key={skill.name} className="terminal-row terminal-skill-row">
                <span className="output">
                  {`  [${skill.bar}] ${String(skill.level).padStart(3, " ")}%  ${skill.name.toUpperCase()}`}
                </span>
              </div>
            ))}
          </div>
        ))}

        <div className="terminal-row">
          <span className="prompt">{"guest@system:~$"}</span>
          <span className="command">status --complete</span>
        </div>
        <div className="terminal-row">
          <span className="output">
            {`> ${data.skills.length} modules loaded. `}
            <span className="cursor-blink">_</span>
          </span>
        </div>
      </section>
    </div>
  )
}
