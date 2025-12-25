export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface Experience {
  company: string;
  role: string;
  location: string;
  period: string;
  points: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  details: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}