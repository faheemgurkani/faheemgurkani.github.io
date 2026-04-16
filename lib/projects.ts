import { Project } from '../types';
import { PROJECTS } from '../constants';

/**
 * Normalize title for deduplication (lowercase, no extra spaces).
 */
function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Merge manual projects (from constants) with GitHub projects.
 * Manual projects appear first. Duplicates by title are skipped (manual wins).
 */
export function mergeProjects(manual: Project[], fromGitHub: Project[]): Project[] {
  const seen = new Set(manual.map((p) => normalizeTitle(p.title)));
  const added: Project[] = [];

  for (const p of fromGitHub) {
    const key = normalizeTitle(p.title);
    if (seen.has(key)) continue;
    seen.add(key);
    added.push(p);
  }

  return [...manual, ...added];
}

/**
 * Default merged list: constants PROJECTS + empty (no GitHub yet).
 */
export function getDefaultProjects(): Project[] {
  return [...PROJECTS];
}
