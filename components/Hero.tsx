"use client";

import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { PERSONAL_INFO } from '../constants';
import InteractiveGridBackground from './ui/InteractiveGridBackground';

const Hero: React.FC = () => {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen bg-neutral-950">
      <InteractiveGridBackground 
        className="absolute inset-0 z-0"
        gridSize={40}
      >
        <div className="min-h-screen flex items-center justify-center pt-16 relative z-10 pointer-events-none">
          <div className="max-w-4xl mx-auto px-4 text-center pointer-events-auto">
            <div className="inline-block px-3 py-1 mb-6 border border-neutral-800 rounded-full bg-neutral-900/50">
              <span className="text-sm text-neutral-400">Available for Backend and R&D Roles</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 [word-spacing:-0.5ch]">
              Muhammad Faheem
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              AI Engineer & Researcher focused on <span className="text-white">Deep Learning</span>, <span className="text-white">LLMs</span>, and scalable <span className="text-white">Backend Systems</span>.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <a 
                href="#contact" 
                onClick={scrollToContact}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-sm hover:bg-neutral-200 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Me
              </a>
              <a href={`https://github.com/${PERSONAL_INFO.social.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 border border-neutral-700 text-neutral-300 rounded-sm hover:border-white hover:text-white transition-colors bg-neutral-900/50">
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a href={`https://linkedin.com/in/${PERSONAL_INFO.social.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 border border-neutral-700 text-neutral-300 rounded-sm hover:border-[#0077b5] hover:text-[#0077b5] transition-colors bg-neutral-900/50">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
               <a href={`https://medium.com/@${PERSONAL_INFO.social.medium}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 border border-neutral-700 text-neutral-300 rounded-sm hover:border-white hover:text-white transition-colors bg-neutral-900/50">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.846 6.887c.03-.295-.083-.586-.303-.784l-2.24-2.7v-.403h6.958l5.378 11.795 4.728-11.795h6.633v.403l-1.916 1.837c-.165.126-.247.333-.213.538v13.498c-.034.204.048.411.213.537l1.871 1.837v.403h-9.412v-.403l1.939-1.882c.19-.19.19-.246.19-.537V11.625L11.206 22.112h-.784L4.852 7.788v9.982c-.06.287.038.583.258.784l2.464 2.992v.403h-7.576v-.403l2.464-2.992c.22-.201.318-.497.258-.784V6.887z"/>
                </svg>
                Medium
              </a>
            </div>
          </div>
        </div>
      </InteractiveGridBackground>
    </section>
  );
};

export default Hero;