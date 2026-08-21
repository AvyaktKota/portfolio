/**
 * Authored icon set. One family, 1.5px stroke on a 24 grid, square caps to
 * match the chart's hairline ruling. No unicode glyphs anywhere on the site.
 */
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  "aria-hidden": true,
  focusable: false,
};

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2.75" y="5.25" width="18.5" height="13.5" />
      <path d="M2.75 6.5 12 13.25 21.25 6.5" />
    </svg>
  );
}

export function GithubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" className={className}>
      <path d="M12 1.75a10.25 10.25 0 0 0-3.24 19.98c.51.1.7-.22.7-.49l-.01-1.9c-2.85.62-3.45-1.2-3.45-1.2-.47-1.18-1.14-1.5-1.14-1.5-.93-.63.07-.62.07-.62 1.03.07 1.57 1.06 1.57 1.06.92 1.57 2.4 1.12 2.99.86.09-.66.36-1.12.65-1.38-2.28-.26-4.67-1.14-4.67-5.06 0-1.12.4-2.03 1.05-2.75-.1-.26-.46-1.3.1-2.71 0 0 .86-.28 2.82 1.05a9.76 9.76 0 0 1 5.14 0c1.96-1.33 2.82-1.05 2.82-1.05.56 1.41.21 2.45.1 2.71.66.72 1.05 1.63 1.05 2.75 0 3.93-2.39 4.8-4.68 5.05.37.32.7.94.7 1.9l-.01 2.82c0 .27.18.6.7.49A10.25 10.25 0 0 0 12 1.75Z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" className={className}>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.75h4v11.5H3V9.75Zm6.5 0h3.83v1.57h.06c.53-.95 1.84-1.95 3.79-1.95 4.05 0 4.8 2.5 4.8 5.76v6.12h-4v-5.43c0-1.3-.02-2.96-1.9-2.96-1.9 0-2.19 1.4-2.19 2.86v5.53h-4V9.75Z" />
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5.25 2.75h8.5l5 5v13.5h-13.5z" />
      <path d="M13.75 2.75v5h5" />
      <path d="M8.5 12.5h7M8.5 16h7" />
    </svg>
  );
}

export function ExternalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9.5 4.75H4.75v14.5h14.5V14.5" />
      <path d="M13.5 4.75h5.75v5.75" />
      <path d="M19.25 4.75 11 13" />
    </svg>
  );
}

export function AwardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="9.5" r="5.75" />
      <path d="M8.25 14.5 6.75 21.25 12 18.75l5.25 2.5-1.5-6.75" />
    </svg>
  );
}
