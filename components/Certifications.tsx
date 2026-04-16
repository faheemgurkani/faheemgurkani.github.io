import React from 'react';
import Section from './ui/Section';
import { CERTIFICATIONS } from '../constants';
import { Award } from 'lucide-react';

const Certifications: React.FC = () => {
  return (
    <Section id="certifications" title="Certifications">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CERTIFICATIONS.map((cert, index) => (
          <a 
            key={index} 
            href="https://www.linkedin.com/in/muhammad-faheem-367a1b279/details/certifications/"
            target="_blank" 
            rel="noreferrer"
            className="flex items-start gap-4 p-4 border border-neutral-900 bg-neutral-900/20 rounded-sm hover:border-neutral-700 transition-colors group block"
          >
            <div className="mt-1">
              <Award className="w-5 h-5 text-neutral-500 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium group-hover:text-neutral-200 transition-colors truncate pr-2">{cert.name}</h4>
              <div className="flex justify-between items-center mt-1 text-sm text-neutral-500">
                <span className="truncate mr-2">{cert.issuer}</span>
                <span className="font-mono text-xs border border-neutral-800 px-2 py-0.5 rounded group-hover:border-neutral-600 transition-colors whitespace-nowrap">{cert.year}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
};

export default Certifications;