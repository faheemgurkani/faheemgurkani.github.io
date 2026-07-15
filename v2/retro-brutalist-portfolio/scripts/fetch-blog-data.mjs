/**
 * Bake Medium + Substack posts via public RSS (rss2json).
 * Optional RSS2JSON_API_KEY in .env for higher rate limits.
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

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

const MEDIUM_RSS = "https://medium.com/feed/@faheemgurkani"
const SUBSTACK_RSS = "https://therepresentationmanifold.substack.com/feed"
const RSS2JSON = "https://api.rss2json.com/v1/api.json"

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function estimateReadTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length
  return `${Math.max(3, Math.round(words / 200))} min`
}

function formatDate(pubDate) {
  if (!pubDate) return ""
  const d = new Date(pubDate)
  if (Number.isNaN(d.getTime())) return pubDate
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
}

function normaliseTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchSource(rssUrl, source) {
  const params = new URLSearchParams({ rss_url: rssUrl })
  if (process.env.RSS2JSON_API_KEY) {
    params.set("api_key", process.env.RSS2JSON_API_KEY)
    params.set("count", "15")
  }
  const res = await fetch(`${RSS2JSON}?${params}`)
  if (!res.ok) throw new Error(`${source} HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== "ok") throw new Error(data.message || `${source} failed`)
  return (data.items || []).map((item, i) => {
    const raw = item.content || item.description || ""
    const excerpt = stripHtml(raw).slice(0, 180)
    const tags = (item.categories || []).map((c) => c.trim()).filter(Boolean).slice(0, 4)
    return {
      code: source === "Medium" ? `MED_${String(i + 1).padStart(3, "0")}` : `SUB_${String(i + 1).padStart(3, "0")}`,
      title: (item.title || "Untitled").trim(),
      category: source === "Substack" ? "Substack" : tags[0] ? tags[0].replace(/-/g, " ") : "Medium",
      date: formatDate(item.pubDate),
      readTime: estimateReadTime(stripHtml(raw)),
      excerpt: excerpt ? `${excerpt}${excerpt.length >= 180 ? "…" : ""}` : "No excerpt available.",
      tags: tags.length ? tags : [source.toLowerCase()],
      href: (item.link || "").split("?")[0],
      source,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
    }
  })
}

async function main() {
  console.log("[fetch-blog-data] Fetching Medium + Substack RSS…")
  const settled = await Promise.allSettled([
    fetchSource(MEDIUM_RSS, "Medium"),
    fetchSource(SUBSTACK_RSS, "Substack"),
  ])

  const posts = []
  for (const r of settled) {
    if (r.status === "fulfilled") {
      posts.push(...r.value)
      console.log(`[fetch-blog-data] ${r.value[0]?.source}: ${r.value.length} posts`)
    } else {
      console.warn("[fetch-blog-data] source failed:", r.reason)
    }
  }

  if (!posts.length) {
    console.warn("[fetch-blog-data] No posts — keeping previous bake if any")
    return
  }

  posts.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return db - da
  })

  const seen = new Set()
  const deduped = []
  for (const post of posts) {
    const key = normaliseTitle(post.title)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push({ ...post, code: `LOG_${String(deduped.length + 1).padStart(3, "0")}` })
  }

  const outDir = resolve(root, "public/data")
  mkdirSync(outDir, { recursive: true })
  writeFileSync(
    resolve(outDir, "blog-posts.json"),
    JSON.stringify({ fetchedAt: new Date().toISOString(), posts: deduped }, null, 2),
  )
  console.log(`[fetch-blog-data] OK · ${deduped.length} posts baked`)
}

main().catch((err) => {
  console.error("[fetch-blog-data] Failed:", err)
  process.exit(0)
})
