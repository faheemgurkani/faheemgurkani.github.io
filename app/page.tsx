"use client";

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Experience from '../components/Experience';
import Projects from '../components/Projects';
import Skills from '../components/Skills';
import Certifications from '../components/Certifications';
import Education from '../components/Education';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-mono antialiased selection:bg-neutral-700 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Certifications />
        <Education />
        <Contact />
      </main>
    </div>
  );
}