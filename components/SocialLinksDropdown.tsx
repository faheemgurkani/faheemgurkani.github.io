"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Github, Linkedin, X } from "lucide-react";
import { PERSONAL_INFO } from "../constants";

type Variant = "hero" | "contact";

/** Matches ResumeDropdown shell + inner padding and pill shape; static surface (no noise animation). */
const triggerShell = "rounded-full p-2";
const triggerButtonBase =
  "flex w-full cursor-pointer items-center justify-center gap-2 rounded-full text-base font-semibold transition-colors duration-100";
/** Hero: taller inner control to align with ResumeDropdown hero (py-3 + w-5 Download); width unchanged (px-5). */
const heroTriggerSize = "min-h-[52px] px-5 py-3.5";
const contactTriggerSize = "min-h-[48px] px-5 py-3";

const MediumIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M2.846 6.887c.03-.295-.083-.586-.303-.784l-2.24-2.7v-.403h6.958l5.378 11.795 4.728-11.795h6.633v.403l-1.916 1.837c-.165.126-.247.333-.213.538v13.498c-.034.204.048.411.213.537l1.871 1.837v.403h-9.412v-.403l1.939-1.882c.19-.19.19-.246.19-.537V11.625L11.206 22.112h-.784L4.852 7.788v9.982c-.06.287.038.583.258.784l2.464 2.992v.403h-7.576v-.403l2.464-2.992c.22-.201.318-.497.258-.784V6.887z" />
  </svg>
);

const SubstackIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.834h21.08V0z" />
  </svg>
);

const SocialLinksDropdown: React.FC<{ variant?: Variant }> = ({
  variant = "hero",
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const iconHero = "w-4 h-4 shrink-0";
  const iconContact = "w-5 h-5 shrink-0";
  const ic = variant === "hero" ? iconHero : iconContact;

  const items = [
    {
      key: "github",
      label: "GitHub",
      href: `https://github.com/${PERSONAL_INFO.social.github}`,
      hover: "hover:border-white hover:text-white",
      icon: <Github className={ic} />,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: PERSONAL_INFO.social.linkedinUrl,
      hover: "hover:border-[#0077b5] hover:text-[#0077b5]",
      icon: <Linkedin className={ic} />,
    },
    {
      key: "medium",
      label: "Medium",
      href: `https://medium.com/@${PERSONAL_INFO.social.medium}`,
      hover: "hover:border-white hover:text-white",
      icon: <MediumIcon className={ic} />,
    },
    {
      key: "substack",
      label: "Substack",
      href: PERSONAL_INFO.social.substack,
      hover: "hover:border-[#FF6719] hover:text-[#FF6719]",
      icon: <SubstackIcon className={ic} />,
    },
    {
      key: "x",
      label: "X",
      href: PERSONAL_INFO.social.x,
      hover: "hover:border-white hover:text-white",
      icon: <X className={ic} />,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const itemBase =
    variant === "hero"
      ? "flex w-full items-center gap-2 px-6 py-3 border border-neutral-600/30 text-neutral-300 rounded-full transition-colors bg-transparent hover:border-neutral-400/50 hover:text-white"
      : "flex w-full items-center justify-center gap-2 border border-neutral-600/30 bg-transparent px-4 py-3 rounded-full text-neutral-400 transition-colors hover:border-neutral-400/50 hover:text-white";

  const triggerButton =
    `${triggerButtonBase} ${variant === "hero" ? heroTriggerSize : contactTriggerSize} ` +
    (variant === "hero"
      ? "border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-white hover:text-white"
      : "border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-600 hover:text-white");

  return (
    <div
      className={`relative ${variant === "contact" ? "w-full min-w-0" : "inline-block"}`}
      ref={menuRef}
    >
      <div
        className={`${triggerShell} ${variant === "contact" ? "w-full" : "w-fit"}`}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={triggerButton}
          aria-haspopup="menu"
          aria-expanded={open ? "true" : "false"}
          aria-label="Social links menu"
        >
          <span>Socials</span>
          <ChevronDown
            className={`${variant === "hero" ? "h-5 w-5" : "h-4 w-4"} shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <ul
          role="menu"
          aria-label="Social profiles"
          className={`absolute z-50 mt-2 flex flex-col gap-2 p-2 backdrop-blur-2xl backdrop-saturate-150 ${
            variant === "contact"
              ? "left-0 right-0 w-full"
              : "left-1/2 w-max min-w-0 -translate-x-1/2"
          }`}
        >
          {items.map(({ key, label, href, hover, icon }) => (
            <li key={key} role="none">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                className={`${itemBase} ${hover}`}
                onClick={() => setOpen(false)}
              >
                {icon}
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SocialLinksDropdown;
