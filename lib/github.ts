import { Project } from "../types";
import { PERSONAL_INFO } from "../constants";

const GITHUB_USERNAME = PERSONAL_INFO.social.github;
const GITHUB_API = "https://api.github.com";

// Repositories that should never be shown as portfolio projects.
// Names are normalized to match the actual GitHub repo names.
const EXCLUDED_REPOS = new Set<string>([
  "learning",
  "practical-deep-learning-using-pytorch",
  "imc-prosperity-3",
  "faheemgurkani.github.io",
  "faheemgurkani",
]);

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork?: boolean;
  topics?: string[];
  language: string | null;
  languages_url?: string;
}

function formatTitle(repoName: string): string {
  return repoName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Convert language bytes (from /repos/:owner/:repo/languages) to tags with percentages. */
function getTechnologiesFromLanguages(bytes: Record<string, number>): string[] {
  const total = Object.values(bytes).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(bytes)
    .map(([lang, n]) => ({ lang, pct: (n / total) * 100 }))
    .sort((a, b) => b.pct - a.pct)
    .map(({ lang, pct }) => `${lang} (${pct.toFixed(1)}%)`);
}

/** Fallback when languages API is not available: primary language + topics. */
function getTechnologiesFallback(repo: GitHubRepo): string[] {
  const techs = new Set<string>();
  if (repo.language) techs.add(repo.language);
  if (repo.topics?.length) repo.topics.forEach((t) => techs.add(t));
  return Array.from(techs);
}

function formatLastUpdated(updatedAt: string): string {
  const date = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function mapGitHubRepoToProject(
  repo: GitHubRepo,
  languagesBytes?: Record<string, number>,
  readmeTitle?: string | null,
): Project {
  const technologies =
    languagesBytes && Object.keys(languagesBytes).length > 0
      ? getTechnologiesFromLanguages(languagesBytes)
      : getTechnologiesFallback(repo);

  const titleFromReadme = readmeTitle?.trim();

  return {
    // Prefer the README's first markdown heading as the display title, if available.
    title:
      titleFromReadme && titleFromReadme.length > 0
        ? titleFromReadme
        : formatTitle(repo.name),
    description: repo.description || "No description provided.",
    technologies,
    repoUrl: repo.html_url,
    homepage: repo.homepage || undefined,
    stars: repo.stargazers_count,
    forks: repo.forks_count > 0 ? repo.forks_count : undefined,
    lastUpdated: formatLastUpdated(repo.updated_at),
    updatedAtRaw: repo.updated_at,
  };
}

/** Fetches language bytes for a repo (same as GitHub's Languages breakdown). */
export async function fetchRepoLanguages(
  owner: string,
  repo: string,
): Promise<Record<string, number>> {
  const token = typeof process !== "undefined" && process.env?.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    ...(token && { Authorization: `token ${token}` }),
  };
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
    headers,
  });
  if (!res.ok) return {};
  return res.json();
}

/** Strip markdown formatting from README title (e.g. **bold**, *italic*, `code`). */
function stripMarkdownFromTitle(raw: string): string {
  return raw
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    .trim();
}

/** Fetch the README for a repo and try to extract its first markdown heading as the title. */
export async function fetchRepoReadmeTitle(
  owner: string,
  repo: string,
): Promise<string | null> {
  const token = typeof process !== "undefined" && process.env?.GITHUB_TOKEN;
  const headers: HeadersInit = {
    // Ask for raw content so we can parse markdown directly.
    Accept: "application/vnd.github.v3.raw",
    ...(token && { Authorization: `token ${token}` }),
  };

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
    headers,
  });

  if (!res.ok) {
    return null;
  }

  const text = await res.text();
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for the first markdown heading, e.g. "# My Project" or "# **Bold Title**"
    const match = /^#{1,6}\s+(.+)$/.exec(trimmed);
    if (match) {
      return stripMarkdownFromTitle(match[1].trim());
    }
  }

  return null;
}

export async function fetchGitHubRepos(): Promise<Project[]> {
  const token = typeof process !== "undefined" && process.env?.GITHUB_TOKEN;
  const headers: HeadersInit = {
    // Include mercy-preview so the API returns repo topics (tags) like on GitHub's UI
    Accept:
      "application/vnd.github.v3+json, application/vnd.github.mercy-preview+json",
    ...(token && { Authorization: `token ${token}` }),
  };

  const res = await fetch(
    `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`,
    { headers },
  );

  if (!res.ok) {
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || "GitHub API rate limit exceeded.");
    }
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const repos: GitHubRepo[] = await res.json();
  const filtered = repos.filter(
    (r) =>
      !r.fork &&
      !EXCLUDED_REPOS.has(r.name.toLowerCase()) &&
      (r.description || r.topics?.length || r.language),
  );

  // Fetch language breakdown for each repo (like GitHub's Languages section)
  const languagesPerRepo = await Promise.all(
    filtered.map((r) =>
      fetchRepoLanguages(GITHUB_USERNAME, r.name).catch(() => ({})),
    ),
  );

  // Fetch README titles in parallel as well and prefer them over formatted repo names.
  const readmeTitles = await Promise.all(
    filtered.map((r) =>
      fetchRepoReadmeTitle(GITHUB_USERNAME, r.name).catch(() => null),
    ),
  );

  return filtered.map((repo, i) =>
    mapGitHubRepoToProject(repo, languagesPerRepo[i], readmeTitles[i]),
  );
}
