import { blogData } from "@/lib/portfolio-data"

interface BlogSectionProps {
  data?: typeof blogData
}

export function BlogSection({ data = blogData }: BlogSectionProps) {
  return (
    <div className="section-stack">
      <h2 className="section-title">System Logs</h2>
      <p style={{ color: "var(--accent-retro)", fontSize: "0.75rem", marginTop: "-8px" }}>
        MEDIUM_FEED · {data.posts.length} LOGS
      </p>

      <div className="blog-grid">
        {data.posts.map((post, index) => (
          <article key={index} className="blog-card">
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
              <div className="blog-tags">
                {post.tags.map((tag, i) => (
                  <span key={i} className="blog-tag">
                    #{tag}
                  </span>
                ))}
              </div>
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
    </div>
  )
}
