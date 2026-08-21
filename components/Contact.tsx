import { person, resumeHref } from "@/lib/content";
import { DocumentIcon, GithubIcon, LinkedinIcon, MailIcon } from "./Icons";

export default function Contact() {
  return (
    <footer id="contact" className="border-t border-rule">
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-end">
        <div>
        <h2 className="max-w-[20ch] text-close font-semibold leading-[1.05] tracking-[-0.015em] text-ink text-balance">
          If something here is worth a conversation, I&rsquo;d like to have it.
        </h2>

        <div className="mt-9 grid w-full grid-cols-1 gap-px bg-rule sm:flex sm:w-fit sm:flex-wrap">
          <a
            href={`mailto:${person.email}`}
            className="flex items-center gap-2.5 bg-ink px-5 py-3.5 text-body font-medium text-ground no-underline transition-colors duration-200 hover:bg-ink-hi"
          >
            <MailIcon className="h-4 w-4" />
            {person.email}
          </a>
          {resumeHref && (
            <a
              href={resumeHref}
              className="flex items-center gap-2.5 scrim px-5 py-3.5 text-body font-medium text-ink no-underline transition-colors duration-200 hover:bg-cell-hi"
            >
              <DocumentIcon className="h-4 w-4" />
              Resume (PDF)
            </a>
          )}
          <a
            href={person.github}
            className="flex items-center gap-2.5 scrim px-5 py-3.5 text-body text-ink-2 no-underline transition-colors duration-200 hover:bg-cell-hi hover:text-ink"
          >
            <GithubIcon className="h-4 w-4" />
            {person.githubHandle}
          </a>
          <a
            href={person.linkedin}
            className="flex items-center gap-2.5 scrim px-5 py-3.5 text-body text-ink-2 no-underline transition-colors duration-200 hover:bg-cell-hi hover:text-ink"
          >
            <LinkedinIcon className="h-4 w-4" />
            {person.linkedinHandle}
          </a>
        </div>

        </div>
        {/* the cloud has been your face all the way down; here it resolves */}
        <figure className="scrim m-0 self-end border border-rule p-2">
          <picture>
            <source srcSet={person.portrait.webp} type="image/webp" />
            <img
              src={person.portrait.jpg}
              alt={`${person.short}, ${person.role}`}
              width={person.portrait.width}
              height={person.portrait.height}
              className="w-full object-cover"
            />
          </picture>
          <figcaption className="cap mt-2 px-1 pb-1">{person.short}</figcaption>
        </figure>
        </div>

        <div className="mt-14 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-rule pt-5">
          <span className="cap">{person.name}</span>
          <span className="cap">
            {person.degree} · {person.schoolShort}
          </span>
        </div>
      </div>
    </footer>
  );
}
