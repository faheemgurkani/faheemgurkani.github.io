"use client";

import { useEffect, useState } from "react";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setIsDark(current !== "light");
  }, []);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-[72px] h-[32px] rounded-full bg-surface border border-border transition-colors cursor-pointer shrink-0 flex items-center justify-between px-[8px]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      <span
        className={`flex items-center justify-center size-[20px] shrink-0 transition-opacity duration-200 ${
          isDark ? "opacity-40" : "opacity-100"
        }`}
      >
        <SunIcon className="text-foreground" />
      </span>
      <span
        className={`absolute top-[4px] z-10 w-[24px] h-[24px] rounded-full bg-white transition-all duration-300 ${
          isDark ? "left-[38px]" : "left-[4px]"
        }`}
      />
      <span
        className={`flex items-center justify-center size-[20px] shrink-0 transition-opacity duration-200 ${
          isDark ? "opacity-100" : "opacity-40"
        }`}
      >
        <MoonIcon className="text-foreground" />
      </span>
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  );
}
