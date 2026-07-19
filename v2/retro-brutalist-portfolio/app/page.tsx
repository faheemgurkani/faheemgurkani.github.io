"use client"

import { useCallback, useRef, useState } from "react"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { AboutSection } from "@/components/about-section"
import { EducationSection } from "@/components/education-section"
import { ExperienceSection } from "@/components/experience-section"
import { SkillsSection } from "@/components/skills-section"
import { CertificationSection } from "@/components/certification-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { PublicationsSection } from "@/components/publications-section"
import { BlogSection } from "@/components/blog-section"
import { ContactSection } from "@/components/contact-section"
import {
  SectionNavBar,
  type ActiveSection,
} from "@/components/section-nav-bar"

export default function Home() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("about")
  const sectionContentRef = useRef<HTMLDivElement>(null)

  const handleSectionChange = useCallback((section: ActiveSection) => {
    setActiveSection(section)
  }, [])

  const handlePortfolioNavigate = useCallback((section: ActiveSection) => {
    setActiveSection(section)
    sectionContentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }, [])

  return (
    <div className="portfolio-layout">
      <div className="portfolio-container">
        <div className="portfolio-grid-layout">
          <ProfileSidebar />

          <main className="main-panel">
            <div className="section-nav-sticky">
              <SectionNavBar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />
            </div>

            <div
              ref={sectionContentRef}
              className="section-content"
              key={activeSection}
            >
              {activeSection === "about" && <AboutSection />}
              {activeSection === "experience" && <ExperienceSection />}
              {activeSection === "projects" && (
                <PortfolioSection onNavigateToSection={handlePortfolioNavigate} />
              )}
              {activeSection === "publications" && (
                <PublicationsSection
                  onNavigateToSection={handlePortfolioNavigate}
                />
              )}
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
