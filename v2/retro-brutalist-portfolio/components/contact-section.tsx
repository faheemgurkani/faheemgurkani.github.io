"use client"

import { useState } from "react"
import {
  socialLinks,
  FORMSUBMIT_ENDPOINT,
  RESUME_OPTIONS,
  contactData,
} from "@/lib/portfolio-data"
import { ProcessingDots } from "@/components/processing-dots"

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setStatus("sending")

    try {
      const res = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
      if (!res.ok) throw new Error("submit failed")
      setStatus("sent")
      form.reset()
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="section-stack">
      <h2 className="section-title">Contact</h2>

      <section className="terminal-section terminal-compact">
        <div className="terminal-header">CONTACT_PROTOCOL.SH</div>
        <div className="terminal-row">
          <span className="prompt">{"guest@system:~$"}</span>
          <span className="command">run contact_protocol.sh</span>
        </div>
        <div className="terminal-row">
          <span className="output">
            {"> Establishing secure connection"}
            <ProcessingDots />
          </span>
        </div>
        <div className="terminal-row">
          <span className="output">{contactData.intro}</span>
        </div>
      </section>

      <div className="services-grid" style={{ marginBottom: "8px" }}>
        <div className="service-card">
          <span className="project-tag">EMAIL</span>
          <h4 className="service-title">Direct Line</h4>
          <p className="service-description">
            <a href={`mailto:${contactData.email}`} style={{ color: "inherit" }}>
              {contactData.email}
            </a>
          </p>
        </div>
        <div className="service-card">
          <span className="project-tag">PHONE</span>
          <h4 className="service-title">Voice Channel</h4>
          <p className="service-description">{contactData.phone}</p>
        </div>
        <div className="service-card">
          <span className="project-tag">LOC</span>
          <h4 className="service-title">Base</h4>
          <p className="service-description">{contactData.location}</p>
        </div>
        <div className="service-card">
          <span className="project-tag">CV</span>
          <h4 className="service-title">Resume Packs</h4>
          <p className="service-description" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {RESUME_OPTIONS.map((resume) => (
              <a
                key={resume.path}
                href={resume.path}
                download={resume.filename}
                style={{ color: "var(--accent-retro)" }}
              >
                ↓ {resume.label}
              </a>
            ))}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="contact-form">
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_subject" value="New Portfolio Contact Submission" />
        <input type="hidden" name="_template" value="table" />

        <div className="contact-form-row">
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              FULL_NAME
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Enter name..."
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              EMAIL_ADDR
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter email..."
              required
            />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="message" className="form-label">
            MESSAGE_BODY
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            className="form-input form-textarea"
            placeholder="Write your message..."
            required
          />
        </div>
        <button type="submit" className="btn-retro" disabled={status === "sending"}>
          {status === "sending"
            ? "TRANSMITTING..."
            : status === "sent"
              ? "MESSAGE_SENT ✓"
              : status === "error"
                ? "RETRY_TRANSMIT"
                : "TRANSMIT MESSAGE"}
        </button>
      </form>

      <footer className="contact-footer">
        <div className="footer-logo">
          <p
            style={{
              color: "var(--accent-retro)",
              fontSize: "0.8rem",
              marginBottom: "10px",
            }}
          >
            END_OF_PAGE
          </p>
          <h2>
            Faheem.dev
            <br />
            {new Date().getFullYear()}©
          </h2>
        </div>
        <div className="contact-footer-links">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-footer-link"
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>

      <p className="copyright contact-copyright">
        BUILT ON THE EDGE OF THE WEB. ALL RIGHTS RESERVED.
      </p>
    </div>
  )
}
