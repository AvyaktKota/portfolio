/**
 * A beat: one full viewport where the cloud holds a single measurement and a
 * quiet block of type says what you are looking at. The panel is a scrim
 * because there is a live point field behind it, not for decoration.
 */
export type BeatStat = { value: string; label: string };

export default function Beat({
  id,
  title,
  body,
  stats,
  side = "left",
  tint,
}: {
  id: string;
  title: string;
  body: string;
  stats: BeatStat[];
  side?: "left" | "right";
  tint?: string;
}) {
  return (
    <section
      id={id}
      className={`flex h-screen items-center px-5 lg:px-8 ${
        side === "right" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="scrim max-w-[30rem] border border-rule p-6 lg:p-7">
        <h2
          className="text-beat font-semibold leading-[1.08] tracking-[-0.025em] text-ink text-balance"
          style={tint ? { color: tint } : undefined}
        >
          {title}
        </h2>
        <p className="mt-3.5 max-w-[46ch] text-body leading-[1.65] text-ink-2">
          {body}
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="tnum text-metric-lg font-medium leading-none tracking-[-0.02em] text-ink">
                {s.value}
              </dt>
              <dd className="mt-1.5 text-meta text-ink-2">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
