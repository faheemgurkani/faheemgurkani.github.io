import { blogData } from "./portfolio-data"

export type BlogPost = (typeof blogData.posts)[number] & {
  source?: "Medium" | "Substack"
  publishedAt?: string
}

const MEDIUM_RSS = "https://medium.com/feed/@faheemgurkani"
/** Primary publication — profile @faheemgurkani does not expose a usable /feed. */
const SUBSTACK_RSS = "https://therepresentationmanifold.substack.com/feed"
const RSS2JSON = "https://api.rss2json.com/v1/api.json"

const PLATFORM_LABELS = new Set(["medium", "substack"])

type Rss2JsonItem = {
  title?: string
  link?: string
  pubDate?: string
  description?: string
  content?: string
  categories?: string[]
  author?: string
}

type Rss2JsonResponse = {
  status?: string
  items?: Rss2JsonItem[]
  message?: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length
  return `${Math.max(3, Math.round(words / 200))} min`
}

function formatDate(pubDate?: string): string {
  if (!pubDate) return ""
  const d = new Date(pubDate)
  if (Number.isNaN(d.getTime())) return pubDate
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Drop platform labels from RSS categories / tags. */
function cleanTags(categories: string[] | undefined): string[] {
  return (categories ?? [])
    .map((c) => c.trim())
    .filter(Boolean)
    .filter((c) => !PLATFORM_LABELS.has(c.toLowerCase()))
    .slice(0, 4)
}

function cleanCategory(raw: string | undefined): string {
  if (!raw?.trim()) return "Essay"
  const cleaned = raw.trim().replace(/-/g, " ")
  if (PLATFORM_LABELS.has(cleaned.toLowerCase())) return "Essay"
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * True when titles are the same article across Medium / Substack
 * (exact match, containment, or high token overlap).
 */
function isSameArticle(a: string, b: string): boolean {
  if (a === b) return true
  if (a.length >= 24 && b.length >= 24 && (a.includes(b) || b.includes(a))) {
    return true
  }
  const ta = new Set(a.split(" ").filter((w) => w.length > 2))
  const tb = new Set(b.split(" ").filter((w) => w.length > 2))
  if (ta.size === 0 || tb.size === 0) return false
  let overlap = 0
  for (const w of ta) if (tb.has(w)) overlap++
  const ratio = overlap / Math.min(ta.size, tb.size)
  return ratio >= 0.85 && overlap >= 4
}

function getServerApiKey(): string | undefined {
  if (typeof window !== "undefined") return undefined
  if (typeof process === "undefined") return undefined
  return process.env.RSS2JSON_API_KEY || undefined
}

async function fetchRssViaRss2Json(
  rssUrl: string,
  source: "Medium" | "Substack",
): Promise<BlogPost[]> {
  const params = new URLSearchParams({ rss_url: rssUrl })
  const key = getServerApiKey()
  if (key) {
    params.set("api_key", key)
    params.set("count", "15")
  }

  const res = await fetch(`${RSS2JSON}?${params.toString()}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`${source} feed HTTP ${res.status}`)

  const data = (await res.json()) as Rss2JsonResponse
  if (data.status !== "ok" || !Array.isArray(data.items)) {
    throw new Error(data.message || `${source} feed parse failed`)
  }

  return data.items.map((item, i) => {
    const raw = item.content || item.description || ""
    const excerpt = stripHtml(raw).slice(0, 180)
    const tags = cleanTags(item.categories)
    const category = cleanCategory(tags[0])

    return {
      code:
        source === "Medium"
          ? `MED_${String(i + 1).padStart(3, "0")}`
          : `SUB_${String(i + 1).padStart(3, "0")}`,
      title: item.title?.trim() || "Untitled",
      category,
      date: formatDate(item.pubDate),
      readTime: estimateReadTime(stripHtml(raw)),
      excerpt: excerpt ? `${excerpt}${excerpt.length >= 180 ? "…" : ""}` : "No excerpt available.",
      tags,
      href: (item.link || "").split("?")[0],
      source,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
    }
  })
}

/** Prefer Medium when the same piece exists on both platforms. */
function sourceRank(source?: string): number {
  return source === "Medium" ? 0 : 1
}

/** Merge Medium + Substack, newest first; drop cross-platform duplicates. */
export async function fetchLiveBlogPosts(): Promise<BlogPost[]> {
  const results = await Promise.allSettled([
    fetchRssViaRss2Json(MEDIUM_RSS, "Medium"),
    fetchRssViaRss2Json(SUBSTACK_RSS, "Substack"),
  ])

  const posts: BlogPost[] = []
  for (const r of results) {
    if (r.status === "fulfilled") posts.push(...r.value)
  }

  if (posts.length === 0) {
    throw new Error("No blog posts fetched from Medium or Substack")
  }

  posts.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return db - da
  })

  const kept: BlogPost[] = []
  for (const post of posts) {
    const key = normaliseTitle(post.title)
    const dupIndex = kept.findIndex((existing) =>
      isSameArticle(normaliseTitle(existing.title), key),
    )
    if (dupIndex >= 0) {
      // Prefer Medium when the same piece is cross-posted
      if (sourceRank(post.source) < sourceRank(kept[dupIndex].source)) {
        kept[dupIndex] = {
          ...post,
          code: kept[dupIndex].code,
          tags: cleanTags(post.tags),
          category: cleanCategory(post.category),
        }
      }
      continue
    }
    kept.push({
      ...post,
      code: `LOG_${String(kept.length + 1).padStart(3, "0")}`,
      tags: cleanTags(post.tags),
      category: cleanCategory(post.category),
    })
  }

  return kept
}

export const BLOG_FEED_META = {
  mediumRss: MEDIUM_RSS,
  substackRss: SUBSTACK_RSS,
  substackPublication: "https://therepresentationmanifold.substack.com",
} as const
