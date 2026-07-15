import { blogData } from "./portfolio-data"

export type BlogPost = (typeof blogData.posts)[number] & {
  source?: "Medium" | "Substack"
  publishedAt?: string
}

const MEDIUM_RSS = "https://medium.com/feed/@faheemgurkani"
/** Primary publication — profile @faheemgurkani does not expose a usable /feed. */
const SUBSTACK_RSS = "https://therepresentationmanifold.substack.com/feed"
const RSS2JSON = "https://api.rss2json.com/v1/api.json"

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
    const tags = (item.categories ?? [])
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 4)
    const category =
      source === "Medium"
        ? tags[0]
          ? tags[0].replace(/-/g, " ")
          : "Medium"
        : "Substack"

    return {
      code: source === "Medium" ? `MED_${String(i + 1).padStart(3, "0")}` : `SUB_${String(i + 1).padStart(3, "0")}`,
      title: item.title?.trim() || "Untitled",
      category: category.replace(/\b\w/g, (c) => c.toUpperCase()),
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

/** Merge Medium + Substack, newest first; dedupe near-identical titles. */
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

  const seen = new Set<string>()
  const deduped: BlogPost[] = []
  for (const post of posts) {
    const key = normaliseTitle(post.title)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push({
      ...post,
      code: `LOG_${String(deduped.length + 1).padStart(3, "0")}`,
    })
  }

  return deduped
}

export const BLOG_FEED_META = {
  mediumRss: MEDIUM_RSS,
  substackRss: SUBSTACK_RSS,
  substackPublication: "https://therepresentationmanifold.substack.com",
} as const
