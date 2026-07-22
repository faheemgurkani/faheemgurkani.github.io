import { GITHUB_USERNAME } from "./portfolio-data";

const GITHUB_API = "https://api.github.com";

export const EXCLUDED_REPOS = new Set<string>([
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
  /** Last push / commit activity (prefer over updated_at for “recently worked”). */
  pushed_at?: string;
  fork?: boolean;
  topics?: string[];
  language: string | null;
  /** Repo visibility from GitHub API (requires auth for private repos). */
  private?: boolean;
  /** Repo size in kilobytes (GitHub API). */
  size?: number;
}

export interface StackLanguage {
  name: string;
  percent: number;
}

export interface PortfolioProject {
  code: string;
  title: string;
  category: string;
  image: string;
  tags: string;
  description: string;
  repoUrl?: string;
  homepage?: string;
  stars?: number;
  forks?: number;
  lastUpdated?: string;
  updatedAtRaw?: string;
  linesOfCode?: number;
  /** Tech tags for stack filtering (language names / topics). */
  technologies?: string[];
  /** Top repo languages by byte share (from GitHub /languages). */
  stackLanguages?: StackLanguage[];
  isPrivate?: boolean;
}

export interface GitHubStats {
  yearsActive: number;
  publicRepos: number;
  projectCount: number;
  totalStars: number;
  followers: number;
  following: number;
  /** Estimated LOC (language bytes when enriched, else repo size). */
  linesOfCode: number;
  linesOfCodeK: number;
  totalLanguageBytes: number;
  /** Contributions in the last year (public graph; may undercount private). */
  contributionsLastYear?: number;
  fetchedAt: string;
  live: boolean;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface ContributionCalendar {
  total: number;
  contributions: ContributionDay[];
  fetchedAt: string;
  live: boolean;
}

export interface LanguageStat {
  name: string;
  bytes: number;
  percent: number;
}

/** Only available in Node/build — never expose to the browser. */
function getServerToken(): string | undefined {
  if (typeof window !== "undefined") return undefined;
  if (typeof process === "undefined") return undefined;
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
}

function redactSecrets(text: string): string {
  return text
    .replace(/\bghp_[A-Za-z0-9]{20,}\b/g, "[REDACTED]")
    .replace(/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "[REDACTED]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/\btoken\s+[A-Za-z0-9._-]+/gi, "token [REDACTED]");
}

function apiHeaders(extraAccept?: string): HeadersInit {
  const token = getServerToken();
  return {
    Accept:
      extraAccept ??
      "application/vnd.github+json, application/vnd.github.mercy-preview+json",
    "X-GitHub-Api-Version": "2026-03-10",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function formatTitle(repoName: string): string {
  return repoName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripMarkdownFromTitle(raw: string): string {
  return raw
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    .trim();
}

export function formatLastUpdated(updatedAt: string): string {
  const date = new Date(updatedAt);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function categorizeRepo(repo: GitHubRepo): string {
  const blob = [
    repo.name,
    repo.description ?? "",
    repo.language ?? "",
    ...(repo.topics ?? []),
  ]
    .join(" ")
    .toLowerCase();

  if (
    /vision|detect|image|yolo|detr|pose|camera|opencv|grad-cam|segmentation|tracking|facial|malaria|traffic/.test(
      blob,
    )
  ) {
    return "computer vision";
  }
  if (
    /llm|rag|agent|langgraph|langchain|openai|mcp|nlp|transformer|chatbot|generative|neural/.test(
      blob,
    )
  ) {
    return "ai/ml";
  }
  if (/api|fastapi|flask|grpc|microservice|backend|server|docker/.test(blob)) {
    return "backend";
  }
  if (/c\+\+|openmp|pthread|asm|parallel|os-level|matrix/.test(blob)) {
    return "systems";
  }
  if (repo.language === "Python" || repo.language === "Jupyter Notebook") {
    return "ai/ml";
  }
  if (repo.language === "C++" || repo.language === "Assembly") {
    return "systems";
  }
  return "backend";
}

function tagsFromRepo(
  repo: GitHubRepo,
  languages?: Record<string, number>,
): string {
  const parts: string[] = [];
  if (languages && Object.keys(languages).length > 0) {
    const total = Object.values(languages).reduce((a, b) => a + b, 0);
    Object.entries(languages)
      .map(([lang, n]) => ({ lang, pct: total ? (n / total) * 100 : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3)
      .forEach(({ lang }) =>
        parts.push(lang.toUpperCase().replace(/\s+/g, "_")),
      );
  } else if (repo.language) {
    parts.push(repo.language.toUpperCase().replace(/\s+/g, "_"));
  }
  (repo.topics ?? [])
    .slice(0, 2)
    .forEach((t) => parts.push(t.toUpperCase().replace(/-/g, "_")));
  if (parts.length === 0) parts.push("GITHUB");
  return parts.map((p) => `#${p}`).join(" ");
}

function estimateLines(bytes: number): number {
  return Math.max(0, Math.round(bytes / 50));
}

export function stackLanguagesFromMap(
  map: Record<string, number>,
  limit = 3,
): StackLanguage[] {
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  if (!total) return [];
  return Object.entries(map)
    .map(([name, bytes]) => ({
      name,
      percent: Math.round((bytes / total) * 1000) / 10,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit);
}

function linesFromRepoSizeKb(sizeKb?: number): number {
  if (!sizeKb || sizeKb <= 0) return 0;
  return estimateLines(sizeKb * 1024);
}

async function githubFetch(
  url: string,
  extraAccept?: string,
): Promise<Response> {
  const res = await fetch(url, {
    headers: apiHeaders(extraAccept),
    cache: "no-store",
  });
  if (res.status === 401 && getServerToken()) {
    return fetch(url, {
      headers: {
        Accept:
          extraAccept ??
          "application/vnd.github.v3+json, application/vnd.github.mercy-preview+json",
      },
      cache: "no-store",
    });
  }
  return res;
}

export async function fetchRepoLanguages(
  repo: string,
): Promise<Record<string, number>> {
  const res = await githubFetch(
    `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo}/languages`,
    "application/vnd.github.v3+json",
  );
  if (!res.ok) return {};
  return res.json();
}

export async function fetchRepoReadmeTitle(
  repo: string,
): Promise<string | null> {
  const res = await githubFetch(
    `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo}/readme`,
    "application/vnd.github.v3.raw",
  );
  if (!res.ok) return null;
  const text = await res.text();
  for (const line of text.split("\n")) {
    const match = /^#{1,6}\s+(.+)$/.exec(line.trim());
    if (match) return stripMarkdownFromTitle(match[1].trim());
  }
  return null;
}

function filterPortfolioRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos.filter(
    (r) =>
      !r.fork &&
      !EXCLUDED_REPOS.has(r.name.toLowerCase()) &&
      (r.private || r.description || r.topics?.length || r.language),
  );
}

async function fetchOwnedRepos(tokenAvailable: boolean): Promise<GitHubRepo[]> {
  if (!tokenAvailable) {
    const res = await githubFetch(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed&type=owner`,
    );
    if (!res.ok) {
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "GitHub API rate limit exceeded.");
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }
    return res.json();
  }

  const repos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const res = await githubFetch(
      `${GITHUB_API}/user/repos?visibility=all&affiliation=owner&sort=pushed&per_page=100&page=${page}`,
    );
    if (!res.ok) {
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "GitHub API rate limit exceeded.");
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }
    const batch: GitHubRepo[] = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return repos.filter(
    (r) => !r.fork && !EXCLUDED_REPOS.has(r.name.toLowerCase()),
  );
}

/**
 * Live GitHub KPIs.
 * Browser: public API (always fresh on each visit).
 * Build/Node with token: optional language-byte LOC enrichment.
 */
export async function fetchGitHubStats(options?: {
  /** Fetch /languages per repo (server/token only — expensive). */
  enrichLanguages?: boolean;
}): Promise<GitHubStats> {
  const enrichLanguages = Boolean(options?.enrichLanguages && getServerToken());

  const [userRes, reposRes] = await Promise.all([
    githubFetch(
      `${GITHUB_API}/users/${GITHUB_USERNAME}`,
      "application/vnd.github.v3+json",
    ),
    githubFetch(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner&sort=pushed`,
    ),
  ]);

  if (!userRes.ok) throw new Error(`GitHub user API error: ${userRes.status}`);
  if (!reposRes.ok)
    throw new Error(`GitHub repos API error: ${reposRes.status}`);

  const user = await userRes.json();
  const repos: GitHubRepo[] = await reposRes.json();
  const filtered = filterPortfolioRepos(repos);
  const created = new Date(user.created_at);
  const yearsActive = Math.max(
    1,
    Math.floor(
      (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 365.25),
    ),
  );
  const totalStars = repos.reduce(
    (sum, r) => sum + (r.stargazers_count ?? 0),
    0,
  );

  let totalLanguageBytes = 0;
  if (enrichLanguages) {
    const languageMaps = await Promise.all(
      filtered.map((r) =>
        fetchRepoLanguages(r.name).catch((): Record<string, number> => ({})),
      ),
    );
    totalLanguageBytes = languageMaps.reduce((sum, map) => {
      const bytes = Object.values(map).reduce((a, b) => a + b, 0);
      return sum + bytes;
    }, 0);
  } else {
    // Live path: estimate from GitHub's repo size (KB) — no extra API calls.
    totalLanguageBytes = filtered.reduce(
      (sum, r) => sum + (r.size ?? 0) * 1024,
      0,
    );
  }

  const linesOfCode = estimateLines(totalLanguageBytes);
  const linesOfCodeK = Math.max(1, Math.round(linesOfCode / 1000));

  let contributionsLastYear: number | undefined;
  try {
    const cal = await fetchContributionCalendar();
    contributionsLastYear = cal.total;
  } catch {
    /* optional */
  }

  return {
    yearsActive,
    publicRepos: user.public_repos ?? repos.length,
    projectCount: filtered.length,
    totalStars,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    linesOfCode,
    linesOfCodeK,
    totalLanguageBytes,
    contributionsLastYear,
    fetchedAt: new Date().toISOString(),
    live: true,
  };
}

/** @deprecated use fetchGitHubStats — kept for callers */
export async function fetchGitHubStatsLite(): Promise<GitHubStats> {
  return fetchGitHubStats({ enrichLanguages: false });
}

const CONTRIBUTIONS_API = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

/**
 * Contribution heatmap data.
 * Prefers baked GraphQL calendar (private-aware) when live public mirror undercounts,
 * but always tries the live public API first for freshness.
 */
export async function fetchContributionCalendar(): Promise<ContributionCalendar> {
  let live: ContributionCalendar | null = null;

  try {
    const res = await fetch(CONTRIBUTIONS_API, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as {
        total?: { lastYear?: number } | number;
        contributions?: ContributionDay[];
      };
      const total =
        typeof data.total === "number"
          ? data.total
          : (data.total?.lastYear ?? 0);
      const contributions = (data.contributions ?? []).map((d) => ({
        date: d.date,
        count: d.count ?? 0,
        level: Math.min(4, Math.max(0, d.level ?? 0)),
      }));
      live = {
        total,
        contributions,
        fetchedAt: new Date().toISOString(),
        live: true,
      };
    }
  } catch {
    /* fall through */
  }

  try {
    const baked = await fetch(
      `/data/github-contributions.json?t=${Date.now()}`,
      {
        cache: "no-store",
      },
    );
    if (baked.ok) {
      const json = (await baked.json()) as ContributionCalendar;
      // Prefer baked if it has a higher total (private contributions via GraphQL bake).
      if (!live || (json.total ?? 0) > (live.total ?? 0)) {
        return {
          ...json,
          live: false,
        };
      }
    }
  } catch {
    /* ignore */
  }

  if (live) return live;
  throw new Error("Contribution calendar unavailable");
}

/**
 * Aggregate language bytes across owned non-fork repos (primary language counts live;
 * byte-accurate when language maps are available from bake).
 */
export async function fetchTopLanguages(limit = 8): Promise<LanguageStat[]> {
  try {
    const res = await githubFetch(
      `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner&sort=pushed`,
    );
    if (!res.ok) throw new Error(`repos ${res.status}`);
    const repos: GitHubRepo[] = await res.json();
    const filtered = filterPortfolioRepos(repos);

    // Live path: weight by repo size attributed to primary language (cheap, no N+1).
    const bytesByLang: Record<string, number> = {};
    for (const repo of filtered) {
      if (!repo.language) continue;
      const weight = Math.max(1, (repo.size ?? 1) * 1024);
      bytesByLang[repo.language] = (bytesByLang[repo.language] ?? 0) + weight;
    }

    const total = Object.values(bytesByLang).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(bytesByLang)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percent: Math.round((bytes / total) * 1000) / 10,
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, limit);
  } catch {
    const baked = await fetch(`/data/github-languages.json?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!baked.ok) return [];
    const json = (await baked.json()) as LanguageStat[];
    return json.slice(0, limit);
  }
}

/**
 * Live GitHub projects.
 * Browser always uses the public repos list (no token — never expose secrets client-side).
 * Server/build with token uses /user/repos to include private repositories.
 */
export async function fetchGitHubProjects(options?: {
  enrich?: boolean;
}): Promise<PortfolioProject[]> {
  const token = getServerToken();
  const enrich = Boolean(options?.enrich && token);

  const repos = await fetchOwnedRepos(Boolean(token));
  const filtered = filterPortfolioRepos(repos);

  let languagesPerRepo: Record<string, number>[] = filtered.map(() => ({}));
  let readmeTitles: (string | null)[] = filtered.map(() => null);

  if (enrich) {
    [languagesPerRepo, readmeTitles] = await Promise.all([
      Promise.all(
        filtered.map((r) => fetchRepoLanguages(r.name).catch(() => ({}))),
      ),
      Promise.all(
        filtered.map((r) => fetchRepoReadmeTitle(r.name).catch(() => null)),
      ),
    ]);
  }

  return filtered.map((repo, i) => {
    const langBytes = Object.values(languagesPerRepo[i] ?? {}).reduce(
      (a, b) => a + b,
      0,
    );
    const lines =
      langBytes > 0
        ? estimateLines(langBytes)
        : linesFromRepoSizeKb(repo.size) || undefined;
    const title = readmeTitles[i]?.trim() || formatTitle(repo.name);
    const technologies: string[] = [];
    if (repo.language) technologies.push(repo.language);
    for (const t of repo.topics ?? []) {
      if (!technologies.includes(t)) technologies.push(t);
    }
    // Prefer language % tags when enriched
    if (languagesPerRepo[i] && Object.keys(languagesPerRepo[i]).length > 0) {
      const total = Object.values(languagesPerRepo[i]).reduce(
        (a, b) => a + b,
        0,
      );
      const fromLangs = Object.entries(languagesPerRepo[i])
        .map(([lang, n]) => ({ lang, pct: total ? (n / total) * 100 : 0 }))
        .sort((a, b) => b.pct - a.pct)
        .map(({ lang }) => lang);
      for (const lang of fromLangs) {
        if (!technologies.includes(lang)) technologies.push(lang);
      }
    }
    const stackLanguages = stackLanguagesFromMap(languagesPerRepo[i] ?? {});

    return {
      code: `REPO_${String(i + 1).padStart(2, "0")}`,
      title,
      category: categorizeRepo(repo),
      image: repo.private
        ? "/placeholder.svg"
        : `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`,
      tags: tagsFromRepo(repo, languagesPerRepo[i]),
      description: repo.description || "No description provided.",
      repoUrl: repo.private ? undefined : repo.html_url,
      homepage: repo.private ? undefined : repo.homepage || undefined,
      stars: repo.stargazers_count,
      forks: repo.forks_count > 0 ? repo.forks_count : undefined,
      lastUpdated: formatLastUpdated(repo.pushed_at || repo.updated_at),
      updatedAtRaw: repo.pushed_at || repo.updated_at,
      linesOfCode: lines,
      technologies,
      ...(stackLanguages.length > 0 ? { stackLanguages } : {}),
      isPrivate: Boolean(repo.private),
    };
  });
}
