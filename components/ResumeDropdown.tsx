"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import { RESUME_OPTIONS } from "../constants";
import { NoiseBackground } from "./ui/noise-background";

type Variant = "hero" | "contact";

const NOISE_GRADIENT_COLORS = [
  "rgb(255, 255, 255)",
  "rgb(220, 220, 220)",
  "rgb(180, 180, 180)",
];

const innerButtonBase =
  "h-full w-full cursor-pointer rounded-full flex items-center justify-center gap-2 font-semibold text-black transition-all duration-100 active:scale-[0.98] " +
  "bg-gradient-to-r from-neutral-100 via-neutral-100 to-white shadow-[0px_2px_0px_0px_rgba(250,250,250,0.8)_inset,0px_0.5px_1px_0px_rgba(163,163,163,0.4)] " +
  "dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_#0a0a0a_inset,0px_1px_0px_0px_rgba(38,38,38,0.8)]";

const heroButtonSize = "px-5 py-3 text-base";
const contactButtonSize = "px-5 py-3 text-base";

const ResumeDropdown: React.FC<{ variant?: Variant }> = ({
  variant = "hero",
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative ${variant === "contact" ? "w-full min-w-0" : "inline-block"}`}
      ref={menuRef}
    >
      <NoiseBackground
        containerClassName={
          variant === "hero"
            ? "w-fit p-2 rounded-full"
            : "w-full p-2 rounded-full"
        }
        gradientColors={NOISE_GRADIENT_COLORS}
        speed={0.45}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`${innerButtonBase} ${variant === "hero" ? heroButtonSize : contactButtonSize}`}
          aria-haspopup="menu"
          aria-expanded={open ? "true" : "false"}
          aria-label="Download resume options"
        >
          <Download
            className={
              variant === "hero" ? "w-5 h-5 shrink-0" : "w-4 h-4 shrink-0"
            }
          />
          <span>Download Resume</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </NoiseBackground>

      {open && (
        <ul
          role="menu"
          className={`absolute z-50 mt-2 flex flex-col gap-2 p-2 backdrop-blur-2xl backdrop-saturate-150 ${
            variant === "contact"
              ? "left-0 right-0 w-full"
              : "left-1/2 w-max min-w-0 -translate-x-1/2"
          }`}
          aria-label="Resume format options"
        >
          {RESUME_OPTIONS.map(({ label, path, filename }) => (
            <li key={path} role="none">
              <a
                href={path}
                download={filename}
                role="menuitem"
                className={
                  variant === "hero"
                    ? "block w-full rounded-full border border-neutral-600/30 bg-transparent px-5 py-2.5 text-left text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-400/50 hover:text-white"
                    : "block w-full rounded-full border border-neutral-600/30 bg-transparent px-5 py-2.5 text-left text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-400/50 hover:text-white"
                }
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResumeDropdown;
