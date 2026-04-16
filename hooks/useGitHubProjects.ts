"use client";

import { useState, useEffect } from 'react';
import { Project } from '../types';
// Curated project cards from constants (currently not shown; only GitHub projects are displayed).
// import { PROJECTS } from '../constants';
// import { mergeProjects } from '../lib/projects';

/**
 * Fetches GitHub projects via the server API route so GITHUB_TOKEN from .env.local is used.
 */
async function fetchProjectsFromApi(): Promise<Project[]> {
  const res = await fetch('/api/github-projects');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `API error: ${res.status}`);
  }
  return res.json();
}

export function useGitHubProjects(): {
  projects: Project[];
  loading: boolean;
  error: string | null;
} {
  // Only GitHub projects are shown; curated PROJECTS from constants are commented out.
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const fromGitHub = await fetchProjectsFromApi();
        if (!cancelled) {
          // setProjects(mergeProjects(PROJECTS, fromGitHub)); // show curated + GitHub
          setProjects(fromGitHub);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load GitHub projects');
          setProjects([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
