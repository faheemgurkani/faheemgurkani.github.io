export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  /** GitHub repo URL (for dynamic projects). */
  repoUrl?: string;
  /** Live demo / homepage URL. */
  homepage?: string;
  stars?: number;
  forks?: number;
  /** Human-readable, e.g. "3 days ago". */
  lastUpdated?: string;
  /** ISO 8601 date string for accurate sort comparison. */
  updatedAtRaw?: string;
  /** True when the project is sourced from resume but has no public GitHub repo. */
  isPrivate?: boolean;
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
