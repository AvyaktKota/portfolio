"use client";

import { useEffect, useRef } from "react";
import { person } from "@/lib/content";

/**
 * The real photograph, laid exactly where the point-picture lands and faded up
 * as that beat reaches centre. Points cannot resolve finer than a point, so the
 * cloud converges and then hands off to the actual image; scrolling away hands
 * it back. Sits above the canvas and below all content.
 */
export default function PictureReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const frame = () => {
      const anchor = document.getElementById("picture");
      if (anchor) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        // the same rect the picture formation uses, so the handoff is seamless
        const scl = Math.min(w / person.portrait.width, h / person.portrait.height) * 0.88;
        const dw = person.portrait.width * scl;
        const dh = person.portrait.height * scl;
        const ox = (w - dw) * (w >= 900 ? 0.74 : 0.5);
        const oy = (h - dh) / 2;

        const r = anchor.getBoundingClientRect();
        const centre = r.top + r.height / 2;
        const d = Math.abs(centre - h / 2) / (h * 0.5);
        const k = Math.min(1, Math.max(0, 1 - d));
        const o = k * k * (3 - 2 * k);

        el.style.width = `${dw}px`;
        el.style.height = `${dh}px`;
        el.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
        el.style.opacity = String(o);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 opacity-0 will-change-[opacity,transform]"
    >
      <picture>
        <source srcSet={person.portrait.webp} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative,
            already sized and format-switched by <picture>; next/image would
            add a loader dependency and break static export */}
        <img
          src={person.portrait.jpg}
          alt=""
          width={person.portrait.width}
          height={person.portrait.height}
          className="h-full w-full object-cover"
        />
      </picture>
    </div>
  );
}
