import { person, resumeHref } from "@/lib/content";

/**
 * The opening. One artifact, alone in black. The only chrome is a mark saying
 * whose site this is, and a way out for anyone who does not want the show.
 */
export default function Hero() {
  return (
    <section id="hero" className="relative flex h-screen flex-col justify-between">
      <div className="flex items-start justify-between px-5 pt-5 lg:px-8 lg:pt-6">
        <span className="cap text-ink-2">{person.short}</span>
        <span className="cap hidden text-ink-3 sm:block">{person.role}</span>
      </div>

      <div className="flex items-end justify-between gap-6 px-5 pb-6 lg:px-8 lg:pb-8">
        <span className="cap anim-fade-up text-ink-3" style={{ ["--step-delay" as string]: "1900ms" }}>
          Scroll
        </span>
        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2">
          <a
            href="#chart"
            className="cap text-ink-3 no-underline transition-colors duration-200 hover:text-ink"
          >
            Skip to the work
          </a>
          {resumeHref && (
            <a
              href={resumeHref}
              className="cap text-ink-3 no-underline transition-colors duration-200 hover:text-ink"
            >
              Resume
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
