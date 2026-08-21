import { toolkit } from "@/lib/content";

export default function Toolkit() {
  return (
    <section id="toolkit" className="border-t border-rule">
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-8">
        <h2 className="text-headline font-semibold tracking-[-0.02em] text-ink">
          Toolkit
        </h2>

        {/* group columns — the chart's own arrangement */}
        <div className="mt-6 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
          {toolkit.map((g) => (
            <div key={g.group} className="scrim p-5">
              <h3 className="cap border-b border-rule pb-2.5 text-ink">{g.group}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {g.items.map((item) => (
                  <li key={item} className="text-body-sm leading-snug text-ink-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
