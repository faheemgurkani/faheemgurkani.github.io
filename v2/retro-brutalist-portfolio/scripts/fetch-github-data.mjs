/**
 * Prefetch GitHub stats + projects using GITHUB_TOKEN from .env / .env.local.
 * Writes JSON into public/data for the static GitHub Pages build.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const GITHUB_USERNAME = "faheemgurkani"
const GITHUB_API = "https://api.github.com"

const EXCLUDED = new Set([
  "learning",
  "practical-deep-learning-using-pytorch",
  "imc-prosperity-3",
  "faheemgurkani.github.io",
  "faheemgurkani",
])

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(resolve(root, ".env"))
loadEnvFile(resolve(root, ".env.local"))

function headers(extraAccept) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  return {
    Accept:
      extraAccept ||
      "application/vnd.github.v3+json, application/vnd.github.mercy-preview+json",
    ...(token ? { Authorization: `token ${token}` } : {}),
  }
}

async function gh(url, accept) {
  const res = await fetch(url, { headers: headers(accept) })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`${res.status} ${url} ${body.slice(0, 120)}`)
  }
  return res
}

function formatTitle(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function stripMd(raw) {
  return raw.replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "").replace(/__/g, "").replace(/_/g, "").trim()
}

function formatLastUpdated(updatedAt) {
  const diffDays = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86400000)
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

function categorize(repo) {
  const blob = [repo.name, repo.description || "", repo.language || "", ...(repo.topics || [])]
    .join(" ")
    .toLowerCase()
  if (/vision|detect|image|yolo|detr|pose|camera|opencv|grad-cam|segmentation|tracking|facial|malaria|traffic/.test(blob))
    return "computer vision"
  if (/llm|rag|agent|langgraph|langchain|openai|mcp|nlp|transformer|chatbot|generative|neural/.test(blob))
    return "ai/ml"
  if (/api|fastapi|flask|grpc|microservice|backend|server|docker/.test(blob)) return "backend"
  if (/c\+\+|openmp|pthread|asm|parallel|os-level|matrix/.test(blob)) return "systems"
  if (repo.language === "Python" || repo.language === "Jupyter Notebook") return "ai/ml"
  if (repo.language === "C++" || repo.language === "Assembly") return "systems"
  return "backend"
}

function tagsFrom(repo, languages) {
  const parts = []
  if (languages && Object.keys(languages).length) {
    const total = Object.values(languages).reduce((a, b) => a + b, 0)
    Object.entries(languages)
      .map(([lang, n]) => ({ lang, pct: total ? (n / total) * 100 : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3)
      .forEach(({ lang }) => parts.push(lang.toUpperCase().replace(/\s+/g, "_")))
  } else if (repo.language) {
    parts.push(repo.language.toUpperCase().replace(/\s+/g, "_"))
  }
  ;(repo.topics || []).slice(0, 2).forEach((t) => parts.push(t.toUpperCase().replace(/-/g, "_")))
  if (!parts.length) parts.push("GITHUB")
  return parts.map((p) => `#${p}`).join(" ")
}

function estimateLines(bytes) {
  return Math.max(0, Math.round(bytes / 50))
}

async function fetchLanguages(repo) {
  const res = await gh(`${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo}/languages`, "application/vnd.github.v3+json")
  return res.json()
}

async function fetchReadmeTitle(repo) {
  const res = await fetch(`${GITHUB_API}/repos/${GITHUB_USERNAME}/${repo}/readme`, {
    headers: headers("application/vnd.github.v3.raw"),
  })
  if (!res.ok) return null
  const text = await res.text()
  for (const line of text.split("\n")) {
    const match = /^#{1,6}\s+(.+)$/.exec(line.trim())
    if (match) return stripMd(match[1].trim())
  }
  return null
}

async function main() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (!token) {
    console.warn("[fetch-github-data] No GITHUB_TOKEN — skip bake; client will use public API.")
    return
  }

  console.log("[fetch-github-data] Authenticated fetch starting…")

  const [userRes, reposRes] = await Promise.all([
    gh(`${GITHUB_API}/users/${GITHUB_USERNAME}`, "application/vnd.github.v3+json"),
    gh(`${GITHUB_API}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&type=owner`),
  ])
  const user = await userRes.json()
  const repos = await reposRes.json()
  const filtered = repos.filter(
    (r) =>
      !r.fork &&
      !EXCLUDED.has(r.name.toLowerCase()) &&
      (r.description || r.topics?.length || r.language),
  )

  const [languagesPerRepo, readmeTitles] = await Promise.all([
    Promise.all(filtered.map((r) => fetchLanguages(r.name).catch(() => ({})))),
    Promise.all(filtered.map((r) => fetchReadmeTitle(r.name).catch(() => null))),
  ])

  const totalLanguageBytes = languagesPerRepo.reduce(
    (sum, map) => sum + Object.values(map).reduce((a, b) => a + b, 0),
    0,
  )
  const linesOfCode = estimateLines(totalLanguageBytes)
  const linesOfCodeK = Math.max(1, Math.round(linesOfCode / 1000))
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
  const yearsActive = Math.max(
    1,
    Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365.25)),
  )

  const stats = {
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

  const projects = filtered.map((repo, i) => {
    const bytes = Object.values(languagesPerRepo[i] || {}).reduce((a, b) => a + b, 0)
    return {
      code: `REPO_${String(i + 1).padStart(2, "0")}`,
      title: (readmeTitles[i] || "").trim() || formatTitle(repo.name),
      category: categorize(repo),
      image: `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`,
      tags: tagsFrom(repo, languagesPerRepo[i]),
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

  const outDir = resolve(root, "public/data")
  mkdirSync(outDir, { recursive: true })
  writeFileSync(resolve(outDir, "github-stats.json"), JSON.stringify(stats, null, 2))
  writeFileSync(resolve(outDir, "github-projects.json"), JSON.stringify(projects, null, 2))

  console.log(
    `[fetch-github-data] OK · ${projects.length} projects · ~${linesOfCodeK}k LOC · ${totalStars} stars`,
  )
}

main().catch((err) => {
  console.error("[fetch-github-data] Failed:", err)
  process.exit(1)
})
