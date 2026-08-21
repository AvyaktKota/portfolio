import { person, resumeHref } from "@/lib/content";
import { DocumentIcon, GithubIcon, LinkedinIcon, MailIcon } from "./Icons";

/** The artifact has your face; this is where it gets your name and your claim. */
export default function Intro() {
  return (
    <section id="picture" className="read-left relative flex min-h-screen items-center px-5 lg:px-8">
      <div className="relative mx-auto w-full max-w-[1440px]">
        <h1 className="max-w-[16ch] text-[length:var(--text-display)] font-semibold leading-[0.94] tracking-[-0.035em] text-ink text-balance">
          {person.name}
        </h1>
        <p className="mt-6 max-w-[24ch] text-lead font-medium leading-[1.22] tracking-[-0.02em] text-ink text-balance">
          {person.thesis}
        </p>
        <p className="mt-5 max-w-[62ch] text-body-lg leading-[1.7] text-ink-2">
          {person.subthesis}
        </p>

        <div className="mt-8 grid w-full grid-cols-1 gap-px bg-rule sm:flex sm:w-fit sm:flex-wrap sm:items-center">
          <a
            href={`mailto:${person.email}`}
            className="flex items-center gap-2.5 bg-ink px-5 py-3 text-body font-medium text-ground no-underline transition-colors duration-200 hover:bg-ink-hi"
          >
            <MailIcon className="h-4 w-4" />
            {person.email}
          </a>
          {resumeHref && (
            <a
              href={resumeHref}
              className="scrim flex items-center gap-2.5 px-5 py-3 text-body font-medium text-ink no-underline transition-colors duration-200 hover:bg-cell-hi"
            >
              <DocumentIcon className="h-4 w-4" />
              Resume
            </a>
          )}
          <a
            href={person.github}
            className="scrim flex items-center gap-2.5 px-4 py-3 text-body text-ink-2 no-underline transition-colors duration-200 hover:bg-cell-hi hover:text-ink"
          >
            <GithubIcon className="h-4 w-4" />
            {person.githubHandle}
          </a>
          <a
            href={person.linkedin}
            className="scrim flex items-center gap-2.5 px-4 py-3 text-body text-ink-2 no-underline transition-colors duration-200 hover:bg-cell-hi hover:text-ink"
          >
            <LinkedinIcon className="h-4 w-4" />
            {person.linkedinHandle}
          </a>
        </div>

        {/* eligibility, stated early: internship recruiters filter on it first */}
        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-ink-2">
          <span>{person.degree}</span>
          <span className="text-ink-3">&middot;</span>
          <span>{person.schoolShort}</span>
          <span className="text-ink-3">&middot;</span>
          <span className="text-ink">{person.graduation}</span>
          <span className="text-ink-3">&middot;</span>
          <span>{person.place}</span>
        </p>
      </div>
    </section>
  );
}
