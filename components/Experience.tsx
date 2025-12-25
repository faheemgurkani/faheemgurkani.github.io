import React from 'react';
import Section from './ui/Section';
import { EXPERIENCE } from '../constants';
import { Calendar, MapPin } from 'lucide-react';

const Experience: React.FC = () => {
  return (
    <Section id="experience" title="Experience">
      <div className="">
        {EXPERIENCE.map((job, index) => (
          <div key={index} className="relative pl-8 border-l border-neutral-800 pb-12 last:pb-0">
            {/* Timeline Dot */}
            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-white rounded-full"></div>
            
            <div className="mb-2">
              <h3 className="text-xl font-bold text-white">{job.role}</h3>
              <div className="text-lg text-neutral-400 font-medium mb-1">{job.company}</div>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-500 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {job.period}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
              </div>
            </div>
            
            <ul className="mt-4 space-y-2">
              {job.points.map((point, idx) => (
                <li key={idx} className="text-neutral-400 leading-relaxed text-sm pl-4 relative before:content-['>'] before:absolute before:left-0 before:text-neutral-600">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Experience;