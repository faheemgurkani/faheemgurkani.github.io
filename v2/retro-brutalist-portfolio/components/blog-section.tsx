"use client"

import { useEffect, useState } from "react"
import { blogData } from "@/lib/portfolio-data"
import { fetchLiveBlogPosts, type BlogPost } from "@/lib/blog"

const REFRESH_MS = 10 * 60 * 1000

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(blogData.posts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadLive() {
      try {
        const live = await fetchLiveBlogPosts()
        if (cancelled) return
        if (live.length > 0) {
          setPosts(live)
          return
        }
        throw new Error("empty")
      } catch {
        if (cancelled) return
        try {
          const res = await fetch(`/data/blog-posts.json?t=${Date.now()}`, {
            cache: "no-store",
          })
          if (res.ok) {
            const baked = await res.json()
            if (Array.isArray(baked?.posts) && baked.posts.length > 0) {
              setPosts(baked.posts)
              return
            }
          }
        } catch {
          /* ignore */
        }
        setPosts(blogData.posts)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLive()
    const id = window.setInterval(loadLive, REFRESH_MS)
    const onFocus = () => loadLive()
    window.addEventListener("focus", onFocus)

    return () => {
      cancelled = true
      window.clearInterval(id)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  return (
    <div className="section-stack">
      <h2 className="section-title">System Logs</h2>

      {loading && posts.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          SYNCING_MEDIUM_SUBSTACK…
        </p>
      ) : (
        <div className="blog-grid">
          {posts.map((post, index) => (
            <article key={`${post.href}-${index}`} className="blog-card">
              <div
                className="window-header"
                style={{ background: "var(--text-primary)", color: "var(--bg-color)" }}
              >
                <span>{post.code}</span>
              </div>
              <div className="blog-card-body">
                <div className="blog-meta">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-read-time">{post.readTime}</span>
                </div>
                <h3 className="blog-title">{post.title}</h3>
                <p className="blog-excerpt">{post.excerpt}</p>
                {post.tags.filter(
                  (tag) => !["medium", "substack"].includes(tag.toLowerCase()),
                ).length > 0 && (
                  <div className="blog-tags">
                    {post.tags
                      .filter((tag) => !["medium", "substack"].includes(tag.toLowerCase()))
                      .map((tag, i) => (
                        <span key={i} className="blog-tag">
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}
                <a
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blog-read-more"
                >
                  READ_LOG →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
