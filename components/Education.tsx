import React from 'react';
import Section from './ui/Section';
import { EDUCATION } from '../constants';

const Education: React.FC = () => {
  return (
    <Section id="education" title="Education">
      <div className="space-y-8">
        {EDUCATION.map((edu, index) => (
          <div key={index} className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{edu.institution}</h3>
              <p className="text-lg text-neutral-300 mt-1">{edu.degree}</p>
              <ul className="mt-4 space-y-1">
                {edu.details.map((detail, idx) => (
                  <li key={idx} className="text-neutral-400 text-sm flex items-start gap-2">
                    <span className="text-neutral-600 mt-1.5 w-1 h-1 bg-neutral-600 rounded-full flex-shrink-0"></span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-neutral-500 font-mono text-sm whitespace-nowrap bg-neutral-900/50 px-3 py-1 rounded border border-neutral-800 h-fit">
              {edu.period}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Education;