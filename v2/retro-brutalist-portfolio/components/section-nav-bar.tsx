"use client";

import { useEffect, useRef, useState } from "react";

export type ActiveSection =
  | "about"
  | "experience"
  | "projects"
  | "publications"
  | "skills"
  | "certification"
  | "education"
  | "blog"
  | "contact";

const SIMPLE_SECTIONS = [
  "about",
  "experience",
  "skills",
  "certification",
  "education",
  "blog",
  "contact",
] as const satisfies readonly ActiveSection[];

const PORTFOLIO_SECTIONS = [
  { id: "projects" as const, label: "projects" },
  { id: "publications" as const, label: "publications" },
];

interface SectionNavBarProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
}

export function SectionNavBar({
  activeSection,
  onSectionChange,
}: SectionNavBarProps) {
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);

  const portfolioActive =
    activeSection === "projects" || activeSection === "publications";

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        portfolioRef.current &&
        !portfolioRef.current.contains(event.target as Node)
      ) {
        setPortfolioOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="section-nav">
      {SIMPLE_SECTIONS.slice(0, 2).map((section) => (
        <button
          key={section}
          type="button"
          onClick={() => {
            setPortfolioOpen(false);
            onSectionChange(section);
          }}
          className={`section-nav-btn ${activeSection === section ? "section-nav-btn-active" : ""}`}
        >
          {section}
        </button>
      ))}

      <div
        className={`section-nav-dropdown ${portfolioOpen ? "section-nav-dropdown-open" : ""}`}
        ref={portfolioRef}
      >
        <button
          type="button"
          className={`section-nav-btn section-nav-dropdown-trigger ${portfolioActive ? "section-nav-btn-active" : ""} ${portfolioOpen ? "section-nav-dropdown-open" : ""}`}
          onClick={() => setPortfolioOpen((open) => !open)}
          aria-expanded={portfolioOpen}
          aria-haspopup="menu"
        >
          <span>portfolio</span>
          <span className="section-nav-chevron" aria-hidden>
            ▼
          </span>
        </button>

        {portfolioOpen && (
          <ul
            className="section-nav-menu"
            role="menu"
            aria-label="Portfolio sections"
          >
            {PORTFOLIO_SECTIONS.map((item) => (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  className={`section-nav-menu-item ${activeSection === item.id ? "section-nav-menu-item-active" : ""}`}
                  onClick={() => {
                    onSectionChange(item.id);
                    setPortfolioOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {SIMPLE_SECTIONS.slice(2).map((section) => (
        <button
          key={section}
          type="button"
          onClick={() => {
            setPortfolioOpen(false);
            onSectionChange(section);
          }}
          className={
            section === "contact"
              ? `section-nav-btn btn-retro ${activeSection === "contact" ? "section-nav-btn-active" : ""}`
              : `section-nav-btn ${activeSection === section ? "section-nav-btn-active" : ""}`
          }
        >
          {section}
        </button>
      ))}
    </nav>
  );
}
