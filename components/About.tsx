"use client";

import React, { useState } from 'react';
import Section from './ui/Section';
import { ChevronDown, ChevronUp } from 'lucide-react';

const About: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Section id="about" title="About Me">
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 text-neutral-300 leading-relaxed space-y-4 text-lg">
          <p>
            I am a dedicated AI and Machine Learning Engineer with a strong
            foundation in Computer Science and Artificial Intelligence.
            Currently pursuing my Bachelor's at the{" "}
            <a
              href="https://isb.nu.edu.pk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-2 hover:text-neutral-200 transition-colors"
            >
              National University of Computer and Emerging Sciences (Islamabad
              Campus)
            </a>
            , I have consistently demonstrated academic excellence, ranking on
            the Dean's List twice.
          </p>
          <p>
            My technical expertise bridges the gap between research and
            production engineering. I specialize in building sophisticated
            pipelines involving <strong>Large Language Models (LLMs)</strong>,
            <strong>Computer Vision</strong>, <strong>Agentic Workflows</strong>{" "}
            (RAG, MCP) and emerging AI architectures and frameworks.
          </p>
          <p>
            Beyond modeling, I possess robust{" "}
            <strong>backend engineering</strong> skills, capable of deploying
            complex and scalable <strong>AI systems</strong> using techniques
            like:
            <strong> Docker</strong>, <strong>Python/FastAPI</strong>,{" "}
            <strong>React/NextJS</strong>, <strong>MongoDB/Redis</strong>,{" "}
            <strong>TypeScript/TailwindCSS</strong> and{" "}
            <strong>Microservices Architecture</strong>. I have also expanded my
            skill set into
            <strong>Cloud Computing</strong> and <strong>DevOps</strong> with{" "}
            <strong>AWS</strong> and <strong>GCP</strong>, combining my{" "}
            <strong>backend</strong> 
            understanding with scalable deployment.
          </p>
          {expanded && (
            <p>
              Outside of academics, I've actively contributed to the Google
              Developer Groups (GDG) community on campus, leading teams within
              "PR-Internals" and "Technical - Projects" departments. My
              contributions also include providing supervision and consultation
              to the "Research" team at the IEEE Computer Society - FAST
              Islamabad society. These roles taught me teamwork, communication,
              and how to manage technical communities.
            </p>
          )}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 text-lg font-medium text-neutral-400 hover:text-neutral-200 transition-colors mt-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-5 h-5" />
                See less
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                See more
              </>
            )}
          </button>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-sm h-fit">
          <h3 className="text-white font-bold mb-4 border-b border-neutral-800 pb-2">
            Focus Areas
          </h3>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Research & Development
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Generative AI & LLMs
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Computer Vision
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              RAG & Agentic Systems
            </li>
            {/* <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Microservices & MLOps
            </li> */}
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Cloud Computing & DevOps
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
};

export default About;