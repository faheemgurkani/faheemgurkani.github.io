import React from 'react';
import Section from './ui/Section';
import { SKILLS } from '../constants';

const Skills: React.FC = () => {
  const strongSkills = ["Python", "PyTorch"];

  return (
    <Section id="skills" title="Technical Skills">
      <div className="space-y-8">
        {SKILLS.map((category, index) => (
          <div key={index}>
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 border-b border-neutral-900 pb-2">
              {category.category}
            </h3>
            <div className="flex flex-wrap gap-3">
              {category.skills.map((skill) => {
                const isStrong = strongSkills.includes(skill);
                return (
                  <div 
                    key={skill}
                    className={`bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm rounded-sm hover:border-neutral-600 hover:bg-neutral-800 transition-colors cursor-default ${
                      isStrong 
                        ? "text-white font-bold underline underline-offset-4 decoration-neutral-500" 
                        : "text-neutral-300"
                    }`}
                  >
                    {skill}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Skills;