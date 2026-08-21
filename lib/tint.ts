import type { Domain, Finding } from "./content";

export type Tint = "cyan" | "amber" | "violet" | "teal";

export const tintVar: Record<Tint, string> = {
  cyan: "var(--color-cat-cyan)",
  amber: "var(--color-cat-amber)",
  violet: "var(--color-cat-violet)",
  teal: "var(--color-cat-teal)",
};

/** One fixed hue per kind of work. No control, no legend: the row says which
 *  kind it is in words, so the colour only has to be consistent. */
const domainTint: Record<Domain, Tint> = {
  backend: "cyan",
  infrastructure: "amber",
  ml: "violet",
  research: "teal",
};

export function tintFor(f: Finding): Tint {
  return domainTint[f.domain];
}
