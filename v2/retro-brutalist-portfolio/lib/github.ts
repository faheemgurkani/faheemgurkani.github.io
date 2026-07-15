import { GITHUB_USERNAME } from "./portfolio-data"

const GITHUB_API = "https://api.github.com"

const EXCLUDED_REPOS = new Set<string>([
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
}

export interface GitHubStats {
  yearsActive: number
  publicRepos: number
  totalStars: number
  followers: number
  following: number
  fetchedAt: string
}

function publicHeaders(extraAccept?: string): HeadersInit {
  return {
    Accept:
      extraAccept ??
      "application/vnd.github.v3+json, application/vnd.github.mercy-preview+json",
  }
}

function formatTitle(repoName: string): string {
  return repoName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatLastUpdated(updatedAt: string): string {
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

function categorizeRepo(repo: GitHubRepo): string {
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

function tagsFromRepo(repo: GitHubRepo): string {
  const parts: string[] = []
  if (repo.language) {
    parts.push(repo.language.toUpperCase().replace(/\s+/g, "_"))
  }
  ;(repo.topics ?? []).slice(0, 3).forEach((t) =>
    parts.push(t.toUpperCase().replace(/-/g, "_")),
  )
  if (parts.length === 0) parts.push("GITHUB")
  return parts.map((p) => `#${p}`).join(" ")
}

/** Live GitHub KPIs — safe for client-side / GitHub Pages (public API). */
export async function fetchGitHubStats(): Promise<GitHubStats> {
  const [userRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}`, {
      headers: publicHeaders("application/vnd.github.v3+json"),
    }),
    fetch(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner`, {
      headers: publicHeaders(),
    }),
  ])

  if (!userRes.ok) {
    throw new Error(`GitHub user API error: ${userRes.status}`)
  }
  if (!reposRes.ok) {
    throw new Error(`GitHub repos API error: ${reposRes.status}`)
  }

  const user = await userRes.json()
  const repos: GitHubRepo[] = await reposRes.json()
  const created = new Date(user.created_at)
  const yearsActive = Math.max(
    1,
    Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 365.25)),
  )
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0)

  return {
    yearsActive,
    publicRepos: user.public_repos ?? repos.length,
    totalStars,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    fetchedAt: new Date().toISOString(),
  }
}

/** Live GitHub projects — client-safe (no per-repo language/readme fan-out). */
export async function fetchGitHubProjects(): Promise<PortfolioProject[]> {
  const res = await fetch(
    `${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`,
    { headers: publicHeaders() },
  )

  if (!res.ok) {
    if (res.status === 403) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.message || "GitHub API rate limit exceeded.")
    }
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const repos: GitHubRepo[] = await res.json()
  const filtered = repos.filter(
    (r) =>
      !r.fork &&
      !EXCLUDED_REPOS.has(r.name.toLowerCase()) &&
      (r.description || r.topics?.length || r.language),
  )

  return filtered.map((repo, i) => ({
    code: `REPO_${String(i + 1).padStart(2, "0")}`,
    title: formatTitle(repo.name),
    category: categorizeRepo(repo),
    image: `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`,
    tags: tagsFromRepo(repo),
    description: repo.description || "No description provided.",
    repoUrl: repo.html_url,
    homepage: repo.homepage || undefined,
    stars: repo.stargazers_count,
    forks: repo.forks_count > 0 ? repo.forks_count : undefined,
    lastUpdated: formatLastUpdated(repo.updated_at),
    updatedAtRaw: repo.updated_at,
  }))
}
