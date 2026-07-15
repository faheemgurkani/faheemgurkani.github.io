import { GITHUB_USERNAME } from "./portfolio-data"

const GITHUB_API = "https://api.github.com"

export const EXCLUDED_REPOS = new Set<string>([
  "learning",
  "practical-deep-learning-using-pytorch",
  "imc-prosperity-3",
  "faheemgurkani.github.io",
  "faheemgurkani",
])

export interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  fork?: boolean
  topics?: string[]
  language: string | null
}

export interface PortfolioProject {
  code: string
  title: string
  category: string
  image: string
  tags: string
  description: string
  repoUrl?: string
  homepage?: string
  stars?: number
  forks?: number
  lastUpdated?: string
  updatedAtRaw?: string
  linesOfCode?: number
}

export interface GitHubStats {
  yearsActive: number
  publicRepos: number
  projectCount: number
  totalStars: number
  followers: number
  following: number
  /** Estimated from language byte totals (~50 bytes/line). */
  linesOfCode: number
  linesOfCodeK: number
  totalLanguageBytes: number
  fetchedAt: string
}

function getToken(): string | undefined {
  if (typeof process === "undefined") return undefined
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined
}

function authHeaders(extraAccept?: string): HeadersInit {
  const token = getToken()
  return {
    Accept:
      extraAccept ??
      "application/vnd.github.v3+json, application/vnd.github.mercy-preview+json",
    ...(token ? { Authorization: `token ${token}` } : {}),
  }
}

export function formatTitle(repoName: string): string {
  return repoName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function stripMarkdownFromTitle(raw: string): string {
  return raw
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    .trim()
}

export function formatLastUpdated(updatedAt: string): string {
  const date = new Date(updatedAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function categorizeRepo(repo: GitHubRepo): string {
  const blob = [
    repo.name,
    repo.description ?? "",
    repo.language ?? "",
    ...(repo.topics ?? []),
  ]
    .join(" ")
    .toLowerCase()

  if (
    /vision|detect|image|yolo|detr|pose|camera|opencv|grad-cam|segmentation|tracking|facial|malaria|traffic/.test(
      blob,
    )
  ) {
    return "computer vision"
  }
  if (
    /llm|rag|agent|langgraph|langchain|openai|mcp|nlp|transformer|chatbot|generative|neural/.test(
      blob,
    )
  ) {
    return "ai/ml"
  }
  if (/api|fastapi|flask|grpc|microservice|backend|server|docker/.test(blob)) {
    return "backend"
  }
  if (/c\+\+|openmp|pthread|asm|parallel|os-level|matrix/.test(blob)) {
    return "systems"
  }
  if (repo.language === "Python" || repo.language === "Jupyter Notebook") {
    return "ai/ml"
  }
  if (repo.language === "C++" || repo.language === "Assembly") {
    return "systems"
  }
  return "backend"
}

function tagsFromRepo(repo: GitHubRepo, languages?: Record<string, number>): string {
  const parts: string[] = []
  if (languages && Object.keys(languages).length > 0) {
    const total = Object.values(languages).reduce((a, b) => a + b, 0)
    Object.entries(languages)
      .map(([lang, n]) => ({ lang, pct: total ? (n / total) * 100 : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3)
      .forEach(({ lang }) => parts.push(lang.toUpperCase().replace(/\s+/g, "_")))
  } else if (repo.language) {
    parts.push(repo.language.toUpperCase().replace(/\s+/g, "_"))
  }
  ;(repo.topics ?? []).slice(0, 2).forEach((t) =>
    parts.push(t.toUpperCase().replace(/-/g, "_")),
  )
  if (parts.length === 0) parts.push("GITHUB")
  return parts.map((p) => `#${p}`).join(" ")
}

function estimateLines(bytes: number): number {
  return Math.max(0, Math.round(bytes / 50))
}

async function githubFetch(url: string, extraAccept?: string): Promise<Response> {
  const res = await fetch(url, { headers: authHeaders(extraAccept) })
  if (res.status === 401 && getToken()) {
    return fetch(url, {
      headers: {
        Accept:
          extraAccept ??
          "application/vnd.github.v3+json, application/vnd.github.mercy-preview+json",
      },
    })
  }
  return res
}

export async function fetchRepoLanguages(repo: string): Promise<Record<string, number>> {
  const res = await githubFetch(
    `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo}/languages`,
    "application/vnd.github.v3+json",
  )
  if (!res.ok) return {}
  return res.json()
}

export async function fetchRepoReadmeTitle(repo: string): Promise<string | null> {
  const res = await githubFetch(
    `${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo}/readme`,
    "application/vnd.github.v3.raw",
  )
  if (!res.ok) return null
  const text = await res.text()
  for (const line of text.split("\n")) {
    const match = /^#{1,6}\s+(.+)$/.exec(line.trim())
    if (match) return stripMarkdownFromTitle(match[1].trim())
  }
  return null
}

function filterPortfolioRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos.filter(
    (r) =>
      !r.fork &&
      !EXCLUDED_REPOS.has(r.name.toLowerCase()) &&
      (r.description || r.topics?.length || r.language),
  )
}

/** Full KPI payload — uses GITHUB_TOKEN when available (build / Node). */
export async function fetchGitHubStats(options?: {
  includeLines?: boolean
}): Promise<GitHubStats> {
  const includeLines = options?.includeLines ?? Boolean(getToken())

  const [userRes, reposRes] = await Promise.all([
    githubFetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`, "application/vnd.github.v3+json"),
    githubFetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner`),
  ])

  if (!userRes.ok) throw new Error(`GitHub user API error: ${userRes.status}`)
  if (!reposRes.ok) throw new Error(`GitHub repos API error: ${reposRes.status}`)

  const user = await userRes.json()
  const repos: GitHubRepo[] = await reposRes.json()
  const filtered = filterPortfolioRepos(repos)
  const created = new Date(user.created_at)
  const yearsActive = Math.max(
    1,
    Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 365.25)),
  )
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0)

  let totalLanguageBytes = 0
  if (includeLines) {
    const languageMaps = await Promise.all(
      filtered.map((r) => fetchRepoLanguages(r.name).catch(() => ({}))),
    )
    totalLanguageBytes = languageMaps.reduce(
      (sum, map) => sum + Object.values(map).reduce((a, b) => a + b, 0),
      0,
    )
  }

  const linesOfCode = estimateLines(totalLanguageBytes)
  const linesOfCodeK = Math.max(1, Math.round(linesOfCode / 1000))

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
    fetchedAt: new Date().toISOString(),
  }
}

/** Lightweight client fetch (no language fan-out). */
export async function fetchGitHubStatsLite(): Promise<GitHubStats> {
  return fetchGitHubStats({ includeLines: false })
}

export async function fetchGitHubProjects(options?: {
  enrich?: boolean
}): Promise<PortfolioProject[]> {
  const enrich = options?.enrich ?? Boolean(getToken())

  const res = await githubFetch(
    `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`,
  )

  if (!res.ok) {
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || "GitHub API rate limit exceeded.")
    }
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const repos: GitHubRepo[] = await res.json()
  const filtered = filterPortfolioRepos(repos)

  let languagesPerRepo: Record<string, number>[] = filtered.map(() => ({}))
  let readmeTitles: (string | null)[] = filtered.map(() => null)

  if (enrich) {
    ;[languagesPerRepo, readmeTitles] = await Promise.all([
      Promise.all(filtered.map((r) => fetchRepoLanguages(r.name).catch(() => ({})))),
      Promise.all(filtered.map((r) => fetchRepoReadmeTitle(r.name).catch(() => null))),
    ])
  }

  return filtered.map((repo, i) => {
    const bytes = Object.values(languagesPerRepo[i] ?? {}).reduce((a, b) => a + b, 0)
    const title = readmeTitles[i]?.trim() || formatTitle(repo.name)
    return {
      code: `REPO_${String(i + 1).padStart(2, "0")}`,
      title,
      category: categorizeRepo(repo),
      image: `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`,
      tags: tagsFromRepo(repo, languagesPerRepo[i]),
      description: repo.description || "No description provided.",
      repoUrl: repo.html_url,
      homepage: repo.homepage || undefined,
      stars: repo.stargazers_count,
      forks: repo.forks_count > 0 ? repo.forks_count : undefined,
      lastUpdated: formatLastUpdated(repo.updated_at),
      updatedAtRaw: repo.updated_at,
      linesOfCode: bytes > 0 ? estimateLines(bytes) : undefined,
    }
  })
}
