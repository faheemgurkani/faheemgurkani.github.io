"use client";

import React, { useState } from 'react';
import Section from './ui/Section';
import { PROJECTS } from '../constants';
import { Folder, Github, ChevronDown, ChevronUp } from 'lucide-react';

const Projects: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show only first 4 projects initially, or all if expanded
  const visibleProjects = isExpanded ? PROJECTS : PROJECTS.slice(0, 4);

  return (
    <Section id="projects" title="Projects">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleProjects.map((project, index) => (
          <div key={index} className="group bg-neutral-900/50 border border-neutral-800 p-6 rounded-sm hover:border-neutral-600 transition-all duration-300 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <Folder className="w-8 h-8 text-neutral-500 group-hover:text-white transition-colors" />
              <a 
                href="https://github.com/faheemgurkani?tab=repositories" 
                target="_blank" 
                rel="noreferrer" 
                className="text-neutral-500 hover:text-white transition-colors duration-300"
                aria-label="View on GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-neutral-200">
              {project.title}
            </h3>
            
            <p className="text-neutral-400 text-sm mb-6 flex-grow leading-relaxed">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.technologies.map((tech) => (
                <span key={tech} className="text-xs font-mono text-neutral-500 bg-neutral-800/50 px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {PROJECTS.length > 4 && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col items-center gap-2 text-neutral-500 hover:text-white transition-colors group p-2"
          >
            <span className="text-sm font-medium tracking-widest uppercase">
              {isExpanded ? 'Show Less' : 'View All Projects'}
            </span>
            {isExpanded ? (
               <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform duration-300" />
            ) : (
               <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform duration-300" />
            )}
          </button>
        </div>
      )}
    </Section>
  );
};

export default Projects;