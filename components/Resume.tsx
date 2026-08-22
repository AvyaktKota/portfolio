import {
  findings,
  orgLabels,
  person,
  positions,
  projects,
  toolkit,
} from "@/lib/content";
import PrintButton from "./PrintButton";

/**
 * The resume, rendered from the same typed content as the rest of the page.
 *
 * Deliberately not a hosted PDF. A second document would drift from this one
 * and would carry things this site does not publish — a phone number, and
 * figures that are not ours to disclose. Everything here is already on the
 * page above; this is the scannable arrangement of it, for the reader who
 * wants the whole record in one screen rather than a scroll.
 *
 * `@media print` in globals.css hides everything else on the page, so Cmd+P
 * produces a clean one-document PDF from exactly this markup.
 */

/** A dated row: the span sits in its own column, where the eye looks for it. */
function Row({
  span,
  place,
  children,
}: {
  span: string;
  place?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="grid gap-x-8 gap-y-2 border-b border-rule py-5 md:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-1">
        <span className="tnum text-meta text-ink-2">{span}</span>
        {place && <span className="cap">{place}</span>}
      </div>
      <div>{children}</div>
    </article>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-9 first:mt-7">
      <h3 className="cap border-b border-rule pb-2 text-ink">{title}</h3>
      {children}
    </div>
  );
}

export default function Resume() {
  return (
    <section id="resume" className="border-t border-rule">
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <h2 className="text-headline font-semibold tracking-[-0.02em] text-ink">
            Resume
          </h2>
          <PrintButton />
        </div>

        {/* the identity block: only shown in print, where there is no page
            around it to say whose document this is */}
        <div className="hidden print:block">
          <p className="text-title font-semibold text-ink">{person.name}</p>
          <p className="mt-1 text-body text-ink-2">
            {person.role} · {person.email} · {person.githubHandle} ·{" "}
            {person.linkedinHandle}
          </p>
        </div>

        <Group title="Education">
          <Row span={person.educationSpan} place={person.place}>
            <h4 className="text-title-xs font-semibold tracking-[-0.01em] text-ink">
              {person.degree}
            </h4>
            <p className="mt-1.5 text-body text-ink-2">{person.school}</p>
          </Row>
        </Group>

        <Group title="Experience">
          {positions.map((p) => (
            <Row key={p.org} span={p.span} place={p.place}>
              <h4 className="text-title-xs font-semibold tracking-[-0.01em] text-ink">
                {p.title}
                <span className="text-ink-3"> · </span>
                <span className="font-medium text-ink-2">{orgLabels[p.org]}</span>
              </h4>
              <ul className="mt-2.5 flex flex-col gap-2">
                {p.findings.map((n) => {
                  const f = findings.find((x) => x.n === n);
                  if (!f) return null;
                  return (
                    <li
                      key={n}
                      className="max-w-[80ch] pl-4 -indent-4 text-body leading-[1.65] text-ink-2 before:mr-2 before:text-ink-3 before:content-['—']"
                    >
                      {f.did}
                    </li>
                  );
                })}
              </ul>
            </Row>
          ))}
        </Group>

        <Group title="Projects">
          {projects.map((pr) => (
            <Row key={pr.name} span={pr.year}>
              <h4 className="text-title-xs font-semibold tracking-[-0.01em] text-ink">
                {pr.name}
              </h4>
              <p className="mt-1.5 max-w-[80ch] text-body leading-[1.65] text-ink-2">
                {pr.detail}
              </p>
              {pr.award && (
                <p className="mt-2 text-body-sm text-cat-amber">{pr.award}</p>
              )}
              <p className="mt-2 text-meta text-ink-3">{pr.stack.join(" · ")}</p>
            </Row>
          ))}
        </Group>

        <Group title="Technical skills">
          <dl className="border-b border-rule">
            {toolkit.map((g) => (
              <div
                key={g.group}
                className="grid gap-x-8 gap-y-1 border-b border-rule py-3.5 last:border-b-0 md:grid-cols-[11rem_minmax(0,1fr)]"
              >
                <dt className="cap text-ink-2">{g.group}</dt>
                <dd className="text-body text-ink-2">{g.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </Group>
      </div>
    </section>
  );
}
