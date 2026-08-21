"use client";

import { useEffect, useState } from "react";
import { person, resumeHref, sections } from "@/lib/content";

/**
 * Absent for the opening, because the first viewport is the artifact and
 * nothing else. It arrives once you have left the hero, so the rest of the
 * scroll is never a one-way trip.
 */
export default function Nav() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 1.02);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Sections"
      aria-hidden={!shown}
      className={`scrim-deep fixed inset-x-0 top-0 z-30 border-b border-rule transition-[opacity,transform] duration-500 ${
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-3 lg:px-8">
        <a href="#hero" className="cap text-ink no-underline">
          {person.short}
        </a>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {sections.map((s) => (
            <li key={s.id} className="hidden sm:block">
              <a
                href={`#${s.id}`}
                className="cap text-ink-3 no-underline transition-colors duration-200 hover:text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
          {resumeHref && (
            <li>
              <a
                href={resumeHref}
                className="cap text-ink-2 no-underline transition-colors duration-200 hover:text-ink"
              >
                Resume
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
