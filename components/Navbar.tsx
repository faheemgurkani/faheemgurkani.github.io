"use client";

import React, { useState, useEffect } from "react";
import { Terminal } from "lucide-react";

declare module "react" {
  interface HTMLAttributes<T> {
    popoverTarget?: string;
    popoverTargetAction?: "show" | "hide" | "toggle";
    popover?: "auto" | "manual" | "hint" | "";
  }
}

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
];

const SECTION_IDS = ["about", "experience", "projects", "skills", "contact"];

function smoothScroll(href: string) {
  if (href.startsWith("#")) {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
}

function getActiveSection(): string | null {
  if (typeof window === "undefined") return null;
  const viewportMark = window.innerHeight * 0.35;
  let active: string | null = null;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= viewportMark) active = id;
  }
  return active;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setActiveSection(getActiveSection());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => {
    const dialog = document.getElementById(
      "navigation-menu-dialog",
    ) as HTMLDialogElement | null;
    if (dialog && typeof (dialog as any).hidePopover === "function") {
      (dialog as any).hidePopover();
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-5 left-0 right-0 w-full z-50 bg-transparent backdrop-blur-md max-sm:top-4">
      <div className="flex items-center justify-between gap-[32px] px-[100px] max-xl:px-[60px] max-sm:px-[30px] max-md:gap-[20px] py-0 relative w-full max-w-[1440px] mx-auto">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center overflow-clip px-0 py-[8px] relative shrink-0 text-white font-bold text-2xl cursor-pointer"
          aria-label="Home"
        >
          <Terminal className="w-7 h-7 mr-2.5 text-white" />
          <span>
            faheem<span className="text-neutral-500">.dev</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="flex items-center gap-[12px] shrink-0 max-xl:hidden">
          <nav
            className="flex gap-[32px] items-center justify-center rounded-full border border-border border-solid bg-transparent px-[28px] py-[10px] max-xl:px-[22px] max-xl:py-[8px] shrink-0"
            aria-label="Main navigation"
          >
            {navLinks.map(({ name, href }) => {
              const id = href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <a
                  key={name}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScroll(href);
                  }}
                  className={`leading-[24px] relative shrink-0 text-[17px] ml-px transition-colors hover:text-white ${
                    isActive ? "font-bold text-white underline underline-offset-4" : "font-normal text-foreground"
                  }`}
                >
                  {name}
                </a>
              );
            })}
          </nav>

          <div
            className="min-w-px w-px h-[24px] bg-neutral-400 shrink-0 self-center"
            aria-hidden="true"
          />

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              smoothScroll("#contact");
            }}
            className="flex items-center relative shrink-0 text-[17px] text-center transition-colors cursor-pointer border border-border border-solid text-foreground hover:bg-surface nav-cta-btn font-semibold py-[10px] px-[24px] max-xl:py-[8px] max-xl:px-[20px] justify-center rounded-full"
          >
            Contact Me
          </a>
        </div>

        {/* Mobile nav */}
        <div className="xl:hidden flex items-center gap-[12px]">
          <button
            onClick={() => setIsMenuOpen(true)}
            popoverTarget="navigation-menu-dialog"
            popoverTargetAction="show"
            className="flex items-center px-[22px] py-[12px] max-sm:px-[18px] max-sm:py-[8px] relative rounded-[12px] shrink-0 font-normal text-[17px] text-center transition-colors cursor-pointer border border-border border-solid text-foreground hover:bg-surface"
          >
            MENU
          </button>
        </div>

        {/* Mobile popover dialog */}
        <dialog
          id="navigation-menu-dialog"
          popover="auto"
          open={isMenuOpen}
          className="xl:hidden fixed top-0 left-0 w-full h-full bg-background z-50"
          onClose={() => setIsMenuOpen(false)}
        >
          <div className="flex flex-col gap-[40px] items-center justify-center relative shrink-0 p-[100px] max-sm:p-[40px]">
            <button
              onClick={closeMenu}
              popoverTarget="navigation-menu-dialog"
              popoverTargetAction="hide"
              className="flex items-center px-[22px] py-[12px] max-sm:px-[18px] max-sm:py-[8px] relative rounded-[12px] shrink-0 font-normal text-[17px] text-center transition-colors cursor-pointer border border-border border-solid text-foreground hover:bg-surface"
            >
              CLOSE
            </button>
            {navLinks.map(({ name, href }) => {
              const id = href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <a
                  key={name}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    closeMenu();
                    smoothScroll(href);
                  }}
                  className={`leading-[24px] relative shrink-0 text-[17px] ml-px ${
                    isActive ? "font-bold text-white underline underline-offset-4" : "font-normal text-foreground"
                  }`}
                  popoverTarget="navigation-menu-dialog"
                  popoverTargetAction="hide"
                >
                  {name}
                </a>
              );
            })}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                smoothScroll("#contact");
              }}
              className="flex items-center px-[22px] py-[12px] max-sm:px-[18px] max-sm:py-[8px] relative rounded-[12px] shrink-0 font-normal text-[17px] text-center transition-colors cursor-pointer border border-border border-solid text-foreground hover:bg-surface justify-center"
              popoverTarget="navigation-menu-dialog"
              popoverTargetAction="hide"
            >
              Contact Me
            </a>
          </div>
        </dialog>
      </div>
    </nav>
  );
};

export default Navbar;
