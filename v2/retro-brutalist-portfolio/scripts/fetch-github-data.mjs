/**
 * Prefetch GitHub stats + projects using GITHUB_TOKEN from .env / .env.local.
 * Writes JSON into public/data for the static GitHub Pages build.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const GITHUB_USERNAME = "faheemgurkani";
const GITHUB_API = "https://api.github.com";

const EXCLUDED = new Set([
  "learning",
  "practical-deep-learning-using-pytorch",
  "imc-prosperity-3",
  "faheemgurkani.github.io",
  "faheemgurkani",
]);

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(root, ".env"));
loadEnvFile(resolve(root, ".env.local"));

/** Strip tokens/secrets before logging API error bodies. */
function redactSecrets(text) {
  return String(text)
    .replace(/\bghp_[A-Za-z0-9]{20,}\b/g, "[REDACTED]")
    .replace(/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "[REDACTED]")
    .replace(/\bBearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/\btoken\s+[A-Za-z0-9._-]+/gi, "token [REDACTED]");
}

function getToken() {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
}

function headers(extraAccept) {
  const token = getToken();
  return {
    Accept:
      extraAccept ||
      "application/vnd.github+json, application/vnd.github.mercy-preview+json",
    "X-GitHub-Api-Version": "2026-03-10",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function gh(url, accept) {
  const res = await fetch(url, { headers: headers(accept) });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `${res.status} ${url} ${redactSecrets(body).slice(0, 120)}`,
    );
  }
  return res;
}

async function fetchAllOwnedRepos() {
  const repos = [];
  let page = 1;

  while (true) {
    const res = await gh(
      `${GITHUB_API}/user/repos?visibility=all&affiliation=owner&sort=pushed&per_page=100&page=${page}`,
    );
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return repos;
}

function formatTitle(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripMd(raw) {
  return raw
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    .trim();
}

function formatLastUpdated(updatedAt) {
  const diffDays = Math.floor(
    (Date.now() - new Date(updatedAt).getTime()) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function categorize(repo) {
  const blob = [
    repo.name,
    repo.description || "",
    repo.language || "",
    ...(repo.topics || []),
  ]
    .join(" ")
    .toLowerCase();
  if (
    /vision|detect|image|yolo|detr|pose|camera|opencv|grad-cam|segmentation|tracking|facial|malaria|traffic/.test(
      blob,
    )
  )
    return "computer vision";
  if (
    /llm|rag|agent|langgraph|langchain|openai|mcp|nlp|transformer|chatbot|generative|neural/.test(
      blob,
    )
  )
    return "ai/ml";
  if (/api|fastapi|flask|grpc|microservice|backend|server|docker/.test(blob))
    return "backend";
  if (/c\+\+|openmp|pthread|asm|parallel|os-level|matrix/.test(blob))
    return "systems";
  if (repo.language === "Python" || repo.language === "Jupyter Notebook")
    return "ai/ml";
  if (repo.language === "C++" || repo.language === "Assembly") return "systems";
  return "backend";
}

function tagsFrom(repo, languages) {
  const parts = [];
  if (languages && Object.keys(languages).length) {
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
  (repo.topics || [])
    .slice(0, 2)
    .forEach((t) => parts.push(t.toUpperCase().replace(/-/g, "_")));
  if (!parts.length) parts.push("GITHUB");
  return parts.map((p) => `#${p}`).join(" ");
}

function estimateLines(bytes) {
  return Math.max(0, Math.round(bytes / 50));
}

function stackLanguagesFromMap(map, limit = 3) {
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

async function fetchLanguages(repoName, owner = GITHUB_USERNAME) {
  const res = await gh(
    `${GITHUB_API}/repos/${owner}/${repoName}/languages`,
    "application/vnd.github+json",
  );
  return res.json();
}

async function fetchReadmeTitle(repoName, owner = GITHUB_USERNAME) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repoName}/readme`, {
    headers: headers("application/vnd.github.v3.raw"),
  });
  if (!res.ok) return null;
  const text = await res.text();
  for (const line of text.split("\n")) {
    const match = /^#{1,6}\s+(.+)$/.exec(line.trim());
    if (match) return stripMd(match[1].trim());
  }
  return null;
}

async function main() {
  const token = getToken();
  if (!token) {
    console.warn(
      "[fetch-github-data] No GITHUB_TOKEN — skip bake; client will use public API.",
    );
    return;
  }

  console.log("[fetch-github-data] Authenticated fetch starting…");

  const [userRes, repos] = await Promise.all([
    gh(`${GITHUB_API}/user`, "application/vnd.github+json"),
    fetchAllOwnedRepos(),
  ]);
  const user = await userRes.json();
  const filtered = repos.filter(
    (r) =>
      (r.owner?.login || GITHUB_USERNAME).toLowerCase() ===
        GITHUB_USERNAME.toLowerCase() &&
      !r.fork &&
      !EXCLUDED.has(r.name.toLowerCase()) &&
      (r.private || r.description || r.topics?.length || r.language),
  );

  const [languagesPerRepo, readmeTitles] = await Promise.all([
    Promise.all(
      filtered.map((r) =>
        fetchLanguages(r.name, r.owner?.login || GITHUB_USERNAME).catch(
          () => ({}),
        ),
      ),
    ),
    Promise.all(
      filtered.map((r) =>
        fetchReadmeTitle(r.name, r.owner?.login || GITHUB_USERNAME).catch(
          () => null,
        ),
      ),
    ),
  ]);

  const totalLanguageBytes = languagesPerRepo.reduce(
    (sum, map) => sum + Object.values(map).reduce((a, b) => a + b, 0),
    0,
  );
  const linesOfCode = estimateLines(totalLanguageBytes);
  const linesOfCodeK = Math.max(1, Math.round(linesOfCode / 1000));
  const totalStars = repos.reduce(
    (sum, r) => sum + (r.stargazers_count || 0),
    0,
  );
  const yearsActive = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25),
    ),
  );

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
  };

  const projects = filtered.map((repo, i) => {
    const bytes = Object.values(languagesPerRepo[i] || {}).reduce(
      (a, b) => a + b,
      0,
    );
    const technologies = [];
    if (repo.language) technologies.push(repo.language);
    for (const t of repo.topics || []) {
      if (!technologies.includes(t)) technologies.push(t);
    }
    const langMap = languagesPerRepo[i] || {};
    if (Object.keys(langMap).length) {
      const total = Object.values(langMap).reduce((a, b) => a + b, 0);
      Object.entries(langMap)
        .map(([lang, n]) => ({ lang, pct: total ? (n / total) * 100 : 0 }))
        .sort((a, b) => b.pct - a.pct)
        .forEach(({ lang }) => {
          if (!technologies.includes(lang)) technologies.push(lang);
        });
    }
    const isPrivate = Boolean(repo.private);
    return {
      code: `REPO_${String(i + 1).padStart(2, "0")}`,
      title: (readmeTitles[i] || "").trim() || formatTitle(repo.name),
      category: categorize(repo),
      image: isPrivate
        ? "/placeholder.svg"
        : `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repo.name}`,
      tags: tagsFrom(repo, languagesPerRepo[i]),
      description: repo.description || "No description provided.",
      repoUrl: isPrivate ? undefined : repo.html_url,
      homepage: isPrivate ? undefined : repo.homepage || undefined,
      stars: repo.stargazers_count,
      forks: repo.forks_count > 0 ? repo.forks_count : undefined,
      lastUpdated: formatLastUpdated(repo.pushed_at || repo.updated_at),
      updatedAtRaw: repo.pushed_at || repo.updated_at,
      linesOfCode: bytes > 0 ? estimateLines(bytes) : undefined,
      technologies,
      stackLanguages: stackLanguagesFromMap(langMap),
      isPrivate,
    };
  });

  const outDir = resolve(root, "public/data");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    resolve(outDir, "github-stats.json"),
    JSON.stringify(stats, null, 2),
  );
  writeFileSync(
    resolve(outDir, "github-projects.json"),
    JSON.stringify(projects, null, 2),
  );

  // Top languages (byte-accurate from /languages)
  const langBytes = {};
  for (const map of languagesPerRepo) {
    for (const [lang, n] of Object.entries(map || {})) {
      langBytes[lang] = (langBytes[lang] || 0) + n;
    }
  }
  const langTotal = Object.values(langBytes).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(langBytes)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: Math.round((bytes / langTotal) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 10);
  writeFileSync(
    resolve(outDir, "github-languages.json"),
    JSON.stringify(languages, null, 2),
  );

  // Contribution calendar — prefer GraphHub GraphQL (includes private when token owns account)
  try {
    let total = 0;
    let contributions = [];

    const gqlRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2026-03-10",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query($login: String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                      contributionLevel
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { login: GITHUB_USERNAME },
      }),
    });

    if (gqlRes.ok) {
      const gql = await gqlRes.json();
      const cal =
        gql?.data?.user?.contributionsCollection?.contributionCalendar;
      if (cal) {
        total = cal.totalContributions ?? 0;
        const levelMap = {
          NONE: 0,
          FIRST_QUARTILE: 1,
          SECOND_QUARTILE: 2,
          THIRD_QUARTILE: 3,
          FOURTH_QUARTILE: 4,
        };
        contributions = (cal.weeks || []).flatMap((w) =>
          (w.contributionDays || []).map((d) => ({
            date: d.date,
            count: d.contributionCount ?? 0,
            level: levelMap[d.contributionLevel] ?? 0,
          })),
        );
      }
    }

    if (!contributions.length) {
      const calRes = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
      );
      if (calRes.ok) {
        const cal = await calRes.json();
        total =
          typeof cal.total === "number"
            ? cal.total
            : (cal.total?.lastYear ?? 0);
        contributions = (cal.contributions || []).map((d) => ({
          date: d.date,
          count: d.count ?? 0,
          level: Math.min(4, Math.max(0, d.level ?? 0)),
        }));
      }
    }

    if (contributions.length) {
      writeFileSync(
        resolve(outDir, "github-contributions.json"),
        JSON.stringify(
          {
            total,
            contributions,
            fetchedAt: new Date().toISOString(),
            live: false,
          },
          null,
          2,
        ),
      );
      stats.contributionsLastYear = total;
      writeFileSync(
        resolve(outDir, "github-stats.json"),
        JSON.stringify(stats, null, 2),
      );
    }
  } catch (err) {
    console.warn(
      "[fetch-github-data] Contributions bake skipped:",
      redactSecrets(err.message),
    );
  }

  const privateCount = projects.filter((p) => p.isPrivate).length;
  console.log(
    `[fetch-github-data] OK · ${projects.length} projects (${privateCount} private) · ~${linesOfCodeK}k LOC · ${totalStars} stars · ${languages.length} langs`,
  );
}

main().catch((err) => {
  console.error("[fetch-github-data] Failed:", redactSecrets(err.message));
  // Do not fail the static build — live client fetch still works; keep last baked JSON if any.
  process.exit(0);
});
