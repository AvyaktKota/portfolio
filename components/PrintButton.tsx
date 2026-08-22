"use client";

/**
 * The only client component in the resume section. The print stylesheet does
 * the real work; this just makes it discoverable for anyone who would not
 * think to hit Cmd+P on a portfolio.
 */
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="cap scrim border border-rule px-3.5 py-2 text-ink-2 transition-colors duration-200 hover:border-rule-hi hover:text-ink print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
