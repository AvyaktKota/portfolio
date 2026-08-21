import { alsoOnGithub, projects } from "@/lib/content";
import { AwardIcon, ExternalIcon, GithubIcon } from "./Icons";

export default function Projects() {
  return (
    <section id="projects" className="border-t border-rule">
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-8">
        <h2 className="text-headline font-semibold tracking-[-0.02em] text-ink">
          Projects
        </h2>

        <div className="mt-6 flex flex-col gap-px border border-rule bg-rule">
          {projects.map((p) => (
            <article
              key={p.name}
              className="scrim grid gap-x-8 gap-y-6 p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:p-7"
            >
              <div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="text-title-sm font-semibold tracking-[-0.015em] text-ink">
                    {p.name}
                  </h3>
                  <span className="tnum cap">{p.year}</span>
                </div>

                <p className="mt-3 max-w-[70ch] text-body-lg leading-[1.6] text-ink">
                  {p.blurb}
                </p>
                <p className="mt-3 max-w-[70ch] text-body leading-[1.7] text-ink-2">
                  {p.detail}
                </p>

                {p.award ? (
                  <p className="mt-4 flex items-start gap-2.5 text-body-sm text-cat-amber">
                    <AwardIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    {p.award}
                  </p>
                ) : null}

                {p.metrics ? (
                  <div className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
                    {p.metrics.map((m) => (
                      <div key={m.label}>
                        <div className="tnum text-metric-lg font-medium leading-none tracking-[-0.02em] text-ink">
                          {m.value}
                        </div>
                        <div className="mt-1.5 text-meta text-ink-2">{m.label}</div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
                  {p.stack.map((s) => (
                    <span key={s} className="cap text-ink-2">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid w-full grid-cols-1 gap-px bg-rule sm:flex sm:w-fit sm:flex-wrap">
                  {p.href ? (
                    <a
                      href={p.href}
                      className="flex items-center gap-2 bg-cell-hi px-4 py-2.5 text-body-sm text-ink no-underline transition-colors duration-200 hover:bg-rule"
                    >
                      <GithubIcon className="h-4 w-4" />
                      Source
                    </a>
                  ) : null}
                  {p.demo ? (
                    <a
                      href={p.demo}
                      className="flex items-center gap-2 bg-cell-hi px-4 py-2.5 text-body-sm text-ink no-underline transition-colors duration-200 hover:bg-rule"
                    >
                      <ExternalIcon className="h-4 w-4" />
                      Live demo
                    </a>
                  ) : (
                    <span className="flex items-center gap-2 bg-cell-hi px-4 py-2.5 text-body-sm text-ink-3">
                      <ExternalIcon className="h-4 w-4" />
                      Demo — slot reserved
                    </span>
                  )}
                </div>
              </div>

              {/* capture plate. Hatched until a real image lands, so an unfilled
                  slot reads as designed rather than broken. */}
              <figure className="m-0 self-start border border-rule">
                {p.capture ? (
                  <img
                    src={p.capture}
                    alt={`${p.name} interface`}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="hatched flex aspect-[4/3] items-center justify-center bg-ground/60">
                    <span className="cap bg-ground px-2 py-1 text-center">
                      {p.captureAwaiting ?? "Capture"} — reserved
                    </span>
                  </div>
                )}
              </figure>
            </article>
          ))}
        </div>

        {alsoOnGithub.length > 0 ? (
          <div className="mt-5 flex flex-col gap-1.5">
            <span className="cap">Also on GitHub</span>
            <ul className="flex flex-col gap-1">
              {alsoOnGithub.map((r) => (
                <li key={r.name} className="text-body-sm text-ink-3">
                  <a
                    href={r.href}
                    className="text-ink-2 transition-colors duration-200 hover:text-ink"
                  >
                    {r.name}
                  </a>
                  <span> — {r.blurb.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
