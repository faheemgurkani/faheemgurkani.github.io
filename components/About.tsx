import React from 'react';
import Section from './ui/Section';

const About: React.FC = () => {
  return (
    <Section id="about" title="About Me">
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 text-neutral-300 leading-relaxed space-y-4 text-lg">
          <p>
            I am a dedicated AI and Machine Learning Engineer with a strong foundation in Computer Science and Artificial Intelligence. 
            Currently pursuing my Bachelor's at the National University of Computer and Emerging Sciences, 
            I have consistently demonstrated academic excellence, ranking on the Dean's List.
          </p>
          <p>
            My technical expertise bridges the gap between research and production engineering. 
            I specialize in building sophisticated pipelines involving <strong>Large Language Models (LLMs)</strong>, 
            <strong>Computer Vision</strong>, and <strong>Agentic Workflows</strong> (RAG, MCP). 
          </p>
          <p>
            Beyond modeling, I possess robust backend engineering skills, capable of deploying complex AI systems using 
            <strong>Docker</strong>, <strong>FastAPI</strong>, and <strong>gRPC</strong>. I am passionate about solving real-world problems 
            through scalable, intelligent automation and rigorous engineering practices.
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-sm h-fit">
          <h3 className="text-white font-bold mb-4 border-b border-neutral-800 pb-2">Focus Areas</h3>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Generative AI & LLMs
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Computer Vision (Detection/Segmentation)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              RAG & Agentic Systems
            </li>
             <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              Microservices & MLOps
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
};

export default About;