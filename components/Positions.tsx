import { findings, orgLabels, positions } from "@/lib/content";

export default function Positions() {
  return (
    <section id="positions" className="border-t border-rule">
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-8">
        <h2 className="text-headline font-semibold tracking-[-0.02em] text-ink">
          Positions
        </h2>

        <div className="mt-6 border-t border-rule">
          {positions.map((p) => (
            <article
              key={p.org}
              /* strict row banding with an addressed margin: the code column
                 sits where the eye already looks for it */
              className="grid gap-x-8 gap-y-3 border-b border-rule py-6 md:grid-cols-[11rem_minmax(0,1fr)]"
            >
              <div className="flex flex-col gap-1">
                <span className="tnum text-meta text-ink-2">{p.span}</span>
                <span className="cap">{p.place}</span>
              </div>

              <div>
                <h3 className="text-title-xs font-semibold tracking-[-0.01em] text-ink">
                  {p.title}
                  <span className="text-ink-3"> · </span>
                  <span className="font-medium text-ink-2">{orgLabels[p.org]}</span>
                </h3>
                <p className="mt-2.5 max-w-[72ch] text-body leading-[1.7] text-ink-2">
                  {p.note}
                </p>
                <ul className="mt-3.5 flex flex-wrap gap-x-2 gap-y-2">
                  {p.findings.map((n) => {
                    const f = findings.find((x) => x.n === n);
                    if (!f) return null;
                    return (
                      <li key={n}>
                        <a
                          href={`#f-${n}`}
                          className="flex items-center gap-2 border border-rule px-2.5 py-1.5 text-meta text-ink-2 no-underline transition-colors duration-200 hover:border-rule-hi hover:text-ink"
                        >
                          <span className="cap tnum">
                            {String(n).padStart(2, "0")}
                          </span>
                          {f.name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
