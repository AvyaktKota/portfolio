"use client";

import { useCallback, useRef, useState } from "react";
import { domainLabels, findings, orgLabels, type Finding } from "@/lib/content";
import { tintFor, tintVar } from "@/lib/tint";

const STEP = 38;

export default function Chart() {
  const [selected, setSelected] = useState<number>(findings[0].n);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onGridKey = useCallback((e: React.KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = i + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = findings.length - 1;
    else return;
    e.preventDefault();
    next = Math.max(0, Math.min(findings.length - 1, next));
    cellRefs.current[next]?.focus();
    setSelected(findings[next].n);
  }, []);

  const active: Finding = findings.find((f) => f.n === selected) ?? findings[0];
  const activeTint = tintVar[tintFor(active)];

  return (
    <section className="border-t border-rule py-6">
      {/* The beat centres on THIS block, so the heading and every row are on
          screen when the points land. The record panel sits outside it. */}
      <div id="chart" className="mx-auto max-w-[1440px] px-5 pt-8 lg:px-8">
        <h2 className="text-headline font-semibold leading-none tracking-[-0.02em] text-ink">
          Here&rsquo;s what I&rsquo;ve done
        </h2>
        <p className="mt-3 max-w-[62ch] text-body leading-relaxed text-ink-2">
          Seven pieces of production and research work. Some are problems nobody
          could see; some are things I built so a problem could not stay hidden.
          Pick one to read what it looked like before, what measuring it showed,
          and what I did.
        </p>

        <div
          role="tablist"
          aria-label="Findings"
          aria-orientation="vertical"
          className="mt-6 border-t border-rule"
        >
          {findings.map((f, i) => {
            const t = tintFor(f);
            const on = f.n === selected;
            return (
              <button
                key={f.n}
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                role="tab"
                id={`f-${f.n}`}
                aria-selected={on}
                aria-controls="finding-record"
                tabIndex={on ? 0 : -1}
                onClick={() => setSelected(f.n)}
                onKeyDown={(e) => onGridKey(e, i)}
                style={
                  {
                    "--step-delay": `${i * STEP}ms`,
                    boxShadow: on ? `inset 0 0 0 1px ${tintVar[t]}` : "none",
                  } as React.CSSProperties
                }
                className={`group flex w-full items-center gap-4 border-b border-rule px-4 py-4 text-left transition-colors duration-[130ms] sm:gap-6 sm:px-5 ${
                  on ? "bg-cell-hi" : "scrim hover:bg-cell-hi"
                }`}
              >
                {/* the number carries the kind of work — one element, no legend */}
                <span
                  className="tnum w-6 shrink-0 text-meta font-medium"
                  style={{ color: tintVar[t] }}
                >
                  {String(f.n).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-title-xs font-semibold leading-snug text-ink">
                    {f.name}
                  </span>
                  <span className="mt-1 block text-meta text-ink-2">
                    {orgLabels[f.org]} &middot; {domainLabels[f.domain]}
                  </span>
                </span>

                <span className="hidden shrink-0 text-right sm:block">
                  <span className="tnum block text-metric-sm font-medium leading-none text-ink">
                    {f.cell.value}
                  </span>
                  <span className="cap mt-1 block max-w-[13rem]">{f.cell.unit}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 lg:px-8">
        <article
          id="finding-record"
          role="tabpanel"
          aria-labelledby={`f-${active.n}`}
          tabIndex={-1}
          key={active.n}
          className="anim-record scrim border border-rule"
        >
          <header
            className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-rule px-5 py-4"
            style={{ borderTop: `2px solid ${activeTint}` }}
          >
            <span className="tnum text-meta font-medium" style={{ color: activeTint }}>
              {String(active.n).padStart(2, "0")}
            </span>
            <h3 className="text-title font-semibold tracking-[-0.015em] text-ink">
              {active.name}
            </h3>
            <span className="text-body-sm text-ink-2">{orgLabels[active.org]}</span>
          </header>

          <div className="grid gap-px bg-rule md:grid-cols-3">
            <Step label="Before" body={active.visible} muted />
            <Step label="What measuring it showed" body={active.found} tint={activeTint} />
            <Step label="What I did" body={active.did} />
          </div>

          <div className="grid border-t border-rule sm:grid-cols-3">
            {active.metrics.map((m, i) => (
              <div
                key={m.label}
                className={`scrim border-b border-rule px-5 py-5 sm:border-b-0 ${
                  i < 2 || active.metrics.length < 3 ? "sm:border-r sm:border-rule" : ""
                }`}
              >
                <div className="tnum text-headline font-medium leading-none tracking-[-0.02em] text-ink">
                  {m.value}
                </div>
                <div className="mt-2 text-meta text-ink-2">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="scrim flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-rule px-5 py-3">
            {active.stack.map((s) => (
              <span key={s} className="cap text-ink-2">
                {s}
              </span>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function Step({
  label,
  body,
  tint,
  muted,
}: {
  label: string;
  body: string;
  tint?: string;
  muted?: boolean;
}) {
  return (
    <div className="scrim px-5 py-5">
      <div className="cap" style={tint ? { color: tint } : undefined}>
        {label}
      </div>
      <p
        className={`mt-2.5 max-w-[58ch] text-body leading-[1.65] ${
          muted ? "text-ink-3" : "text-ink-2"
        }`}
      >
        {body}
      </p>
    </div>
  );
}
