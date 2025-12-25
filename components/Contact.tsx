"use client";

import React, { useState } from 'react';
import Section from './ui/Section';
import { PERSONAL_INFO } from '../constants';
import { Mail, Linkedin, Github, Phone, Copy, Check } from 'lucide-react';

const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Section id="contact" title="Get In Touch">
      <div className="grid md:grid-cols-2 gap-12 items-start pt-8">
        {/* Left Column: Info */}
        <div className="space-y-8">
          <p className="text-neutral-400 text-lg leading-relaxed">
            I am currently open to research collaborations and engineering roles in AI, Machine Learning, and Backend development. 
            Feel free to reach out directly or send a message using the form.
          </p>
          
          <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-sm">
             <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                Contact Information
             </h3>
             
             <div className="flex flex-col gap-6">
               <div className="flex items-center gap-4">
                 <a href={`mailto:${PERSONAL_INFO.email}`} className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors group flex-1 min-w-0">
                    <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-neutral-700 transition-colors shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="break-all">{PERSONAL_INFO.email}</span>
                 </a>
                 <button 
                  onClick={handleCopy}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
                  aria-label="Copy email"
                  title="Copy email"
                 >
                   {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>

               <div className="flex items-center gap-3 text-neutral-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center group-hover:bg-neutral-700 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="break-all">{PERSONAL_INFO.phone}</span>
               </div>
               
               <div className="flex gap-4 pt-2">
                <a 
                  href={`https://github.com/${PERSONAL_INFO.social.github}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 flex items-center justify-center gap-2 text-neutral-400 hover:text-white transition-colors border border-neutral-800 bg-neutral-900 px-4 py-3 rounded-sm hover:border-neutral-600"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                </a>
                <a 
                  href={`https://linkedin.com/in/${PERSONAL_INFO.social.linkedin}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 flex items-center justify-center gap-2 text-neutral-400 hover:text-[#0077b5] transition-colors border border-neutral-800 bg-neutral-900 px-4 py-3 rounded-sm hover:border-[#0077b5]"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                </a>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-neutral-900/30 border border-neutral-800 p-8 rounded-sm">
          <form action="https://formsubmit.co/32703517175793864b061a2c1063759f" method="POST" className="space-y-4">
             {/* FormSubmit Configuration */}
             <input type="hidden" name="_captcha" value="false" />
             <input type="hidden" name="_subject" value="New Portfolio Contact Submission" />

             <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-500 mb-2">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-700"
                  placeholder="Your name"
                />
             </div>
             
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-500 mb-2">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-700"
                  placeholder="your.email@example.com"
                />
             </div>
             
             <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-500 mb-2">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  required
                  rows={5}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-neutral-600 transition-colors placeholder:text-neutral-700 resize-none"
                  placeholder="How can we collaborate?"
                ></textarea>
             </div>
             
             <button 
              type="submit" 
              className="w-full bg-white text-black font-bold py-3.5 px-6 rounded-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              Send Message
             </button>
          </form>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center text-neutral-600 text-sm mt-20 font-mono">
        <p>© {new Date().getFullYear()} {PERSONAL_INFO.name}. All rights reserved.</p>
        <p className="mt-2 md:mt-0 text-xs opacity-50">Built with React, TypeScript & Tailwind</p>
      </div>
    </Section>
  );
};

export default Contact;