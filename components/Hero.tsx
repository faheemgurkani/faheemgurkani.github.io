"use client";

import React from 'react';
import InteractiveGridBackground from './ui/InteractiveGridBackground';
import ResumeDropdown from './ResumeDropdown';
import SocialLinksDropdown from './SocialLinksDropdown';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-neutral-950">
      <InteractiveGridBackground 
        className="absolute inset-0 z-0"
        gridSize={40}
      >
        <div className="min-h-screen flex items-center justify-center pt-20 relative z-10 pointer-events-none">
          <div className="max-w-4xl mx-auto px-4 text-center pointer-events-auto">
            <div className="inline-block px-3 py-1 mb-6 border border-neutral-800 rounded-full bg-neutral-900/50">
              <span className="text-sm text-neutral-400">Available for Backend and R&D Roles</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 [word-spacing:-0.5ch]">
              Muhammad Faheem
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              AI Engineer & Researcher focused on <span className="text-white">Deep Learning</span>, <span className="text-white">Generative AI</span>, and scalable <span className="text-white">Backend Systems</span>.
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
              <ResumeDropdown variant="hero" />
              <div
                className="min-w-[3px] w-[3px] h-9 bg-neutral-300 shrink-0 self-center"
                aria-hidden="true"
              />
              <div className="-ml-2">
                <SocialLinksDropdown variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </InteractiveGridBackground>
    </section>
  );
};

export default Hero;