"use client"

import { useState } from "react"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { AboutSection } from "@/components/about-section"
import { EducationSection } from "@/components/education-section"
import { ExperienceSection } from "@/components/experience-section"
import { SkillsSection } from "@/components/skills-section"
import { CertificationSection } from "@/components/certification-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { BlogSection } from "@/components/blog-section"
import { ContactSection } from "@/components/contact-section"

const sections = ["about", "experience", "portfolio", "skills", "certification", "education", "blog", "contact"] as const

export default function Home() {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]>("about")

  return (
    <div className="portfolio-layout">
      <div className="portfolio-container">
        <div className="portfolio-grid-layout">
          <ProfileSidebar />

          <main className="main-panel">
            <div className="section-nav-sticky">
              <nav className="section-nav">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`section-nav-btn ${activeSection === section ? "section-nav-btn-active" : ""}`}
                  >
                    {section}
                  </button>
                ))}
              </nav>
            </div>

            <div className="section-content">
              {activeSection === "about" && <AboutSection />}
              {activeSection === "experience" && <ExperienceSection />}
              {activeSection === "portfolio" && <PortfolioSection />}
              {activeSection === "skills" && <SkillsSection />}
              {activeSection === "certification" && <CertificationSection />}
              {activeSection === "education" && <EducationSection />}
              {activeSection === "blog" && <BlogSection />}
              {activeSection === "contact" && <ContactSection />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
