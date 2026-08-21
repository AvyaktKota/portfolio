import type { Metadata } from "next";
import { Archivo, Azeret_Mono } from "next/font/google";
import { person } from "@/lib/content";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  axes: ["wdth"],
});

const azeret = Azeret_Mono({
  subsets: ["latin"],
  variable: "--font-azeret",
  display: "swap",
  weight: ["400", "500", "600"],
});

const description =
  "Backend and ML engineer at SkyAccess, researcher at UCSD's Computer Vision Lab and Rana Lab. Shipped a company's first production ML model, and builds the instrumentation that makes silent failures loud.";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined);

const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: `${person.short} — ${person.role}`,
};

export const metadata: Metadata = {
  // Resolved from the deploy environment, so the social card gets absolute
  // URLs without hardcoding a domain. Vercel supplies the second one.
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: `${person.short} — ${person.role}`,
    template: `%s — ${person.short}`,
  },
  description,
  authors: [{ name: person.name }],
  keywords: [
    "backend engineer",
    "machine learning",
    "ONNX",
    "Postgres",
    "UC San Diego",
    "artificial intelligence",
  ],
  openGraph: {
    title: `${person.short} — ${person.role}`,
    description,
    type: "profile",
    locale: "en_US",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${person.short} — ${person.role}`,
    description,
    images: [ogImage],
  },
  robots: { index: true, follow: true },
};

/**
 * Direction contract. Emitted as a real HTML comment so it survives the
 * production build and can be grepped for the seed key. React cannot render a
 * bare comment node, so it rides inside a hidden, aria-hidden container.
 */
const CONTRACT = `<!--
THESIS: One artifact, transformed. A single point cloud is the whole site, and every state it takes is one of his real measurements. Refuses the scrolling-resume arrangement and the decorative-hero arrangement alike.
OWN-WORLD: Pure #000000 void, a 48,000-point WebGL cloud blended additively, five categorical hues each carrying exactly one meaning at a time, Archivo for language and Azeret Mono for measurement, content on blurred scrims because a live point field moves behind it. No rounded chrome, no gradients.
STORY: The visitor watches a mark become him, then watches the same points become the failures he found and the proofs he built, and leaves by email.
FIRST VIEWPORT: The artifact alone. A point-density portrait sampled from his own photograph, centred on black; a name mark top-left, a role mark top-right, and in the bottom corners the word Scroll and a way out to the work. Nothing else, and no navigation until the hero is behind you.
FORM: Point cloud governing the whole page as one continuous transformation; brief-pinned by the user over the roll, artifact chosen from four candidates; seed key 27fcd93c.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  alternateName: person.short,
  jobTitle: person.role,
  email: `mailto:${person.email}`,
  url: person.github,
  sameAs: [person.github, person.linkedin],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: person.school,
  },
  address: { "@type": "PostalAddress", addressLocality: "La Jolla", addressRegion: "CA" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${azeret.variable}`}>
      <body>
        <div hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
