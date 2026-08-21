"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cloud, { type Beat } from "./Cloud";
import PictureReveal from "./PictureReveal";
import {
  drift,
  helix,
  makeBoxes,
  makeMark,
  makePortrait,
  parity,
  craft,
  ambient,
  type CellRect,
  type Formation,
} from "@/lib/formations";
import { person } from "@/lib/content";

/** The logo: a hairline frame with the monogram inside, sampled to points. */
function useMark(): Formation | null {
  const [f, setF] = useState<Formation | null>(null);
  useEffect(() => {
    let dead = false;
    const build = () => {
      if (dead) return;
      const S = 420;
      const c = document.createElement("canvas");
      c.width = S;
      c.height = S;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.clearRect(0, 0, S, S);
      // frame in white, monogram in red
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.strokeRect(14, 14, S - 28, S - 28);
      ctx.strokeRect(40, 40, S - 80, S - 80);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // fit three letters inside the inner frame
      let size = 150;
      const inner = S - 120;
      do {
        ctx.font = `800 ${size}px Archivo, ui-sans-serif, system-ui, sans-serif`;
        if (ctx.measureText("APK").width <= inner) break;
        size -= 4;
      } while (size > 40);
      ctx.fillText("APK", S / 2, S / 2 - 4);
      const d = ctx.getImageData(0, 0, S, S).data;
      const a = new Float32Array(S * S);
      const rgbm = new Float32Array(S * S * 3);
      for (let i = 0, p = 0; i < a.length; i++, p += 4) {
        a[i] = d[p + 3] / 255;
        rgbm[i * 3] = d[p] / 255;
        rgbm[i * 3 + 1] = d[p + 1] / 255;
        rgbm[i * 3 + 2] = d[p + 2] / 255;
      }
      setF(makeMark(a, rgbm, S, S));
    };
    if (document.fonts?.ready) document.fonts.ready.then(build);
    else build();
    return () => {
      dead = true;
    };
  }, []);
  return f;
}

/** The picture, sampled from the real photograph — colour, tone and all. */
function usePicture(): Formation | null {
  const [f, setF] = useState<Formation | null>(null);
  useEffect(() => {
    let dead = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = person.portrait.webp;
    img.onload = () => {
      if (dead) return;
      const iw = 250;
      const ih = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * iw));
      const c = document.createElement("canvas");
      c.width = iw;
      c.height = ih;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, iw, ih);
      const d = ctx.getImageData(0, 0, iw, ih).data;
      const lum = new Float32Array(iw * ih);
      const rgb = new Float32Array(iw * ih * 3);
      for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
        const r0 = d[p] / 255, g0 = d[p + 1] / 255, b0 = d[p + 2] / 255;
        rgb[i * 3] = r0;
        rgb[i * 3 + 1] = g0;
        rgb[i * 3 + 2] = b0;
        lum[i] = 0.2126 * r0 + 0.7152 * g0 + 0.0722 * b0;
      }
      const edge = new Float32Array(iw * ih);
      let emax = 1e-6;
      for (let y = 1; y < ih - 1; y++) {
        for (let x = 1; x < iw - 1; x++) {
          const at = (xx: number, yy: number) => lum[yy * iw + xx];
          const gx =
            -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1) +
            at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1);
          const gy =
            -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) +
            at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1);
          const m = Math.hypot(gx, gy);
          edge[y * iw + x] = m;
          if (m > emax) emax = m;
        }
      }
      for (let i = 0; i < edge.length; i++) edge[i] /= emax;
      setF(makePortrait(lum, edge, rgb, iw, ih));
    };
    img.onerror = () => setF(null);
    return () => {
      dead = true;
    };
  }, []);
  return f;
}

export default function Stage() {
  const mark = useMark();
  const picture = usePicture();

  const [webgl, setWebgl] = useState<boolean | null>(null);
  useEffect(() => {
    // WebGL support is a DOM fact, only knowable after mount. One write, once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(!!document.createElement("canvas").getContext("webgl2"));
  }, []);

  /* The boxes are taken from the real cells, measured relative to the grid's
     own centre, so the point field lands exactly where the content will be. */
  const rectsRef = useRef<CellRect[]>([]);
  useEffect(() => {
    const measure = () => {
      const list = document.querySelector('[role="tablist"]');
      if (!list) return;
      // Document coordinates. The shader subtracts scroll, so the box field
      // sits exactly on the real cells at any scroll offset rather than
      // approximately, which is what "the boxes become the content" requires.
      rectsRef.current = [...list.querySelectorAll('[role="tab"]')].map((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return {
          x: r.left + window.scrollX,
          y: r.top + window.scrollY,
          w: r.width,
          h: r.height,
        };
      });
    };
    measure();
    const t = setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // The closure is stored, not called, during render — the cloud invokes it on
  // a later frame, by which time the cells have been measured.
  // eslint-disable-next-line react-hooks/refs
  const boxes = useMemo(() => makeBoxes(() => rectsRef.current), []);

  const beats: Beat[] = useMemo(
    () => [
      { anchor: "hero", formation: mark ?? drift },
      { anchor: "picture", formation: picture ?? drift },
      { anchor: "chart", formation: boxes },
      { anchor: "measure", formation: craft },
      { anchor: "parity", formation: parity },
      { anchor: "enrichment", formation: helix },
      { anchor: "positions", formation: ambient },
      { anchor: "projects", formation: ambient },
      { anchor: "toolkit", formation: ambient },
      { anchor: "contact", formation: ambient },
    ],
    [mark, picture, boxes],
  );

  if (webgl === false) {
    return (
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <picture>
          <source srcSet={person.portrait.webp} type="image/webp" />
          <img
            src={person.portrait.jpg}
            alt=""
            width={person.portrait.width}
            height={person.portrait.height}
            className="h-[75vh] w-auto opacity-30"
          />
        </picture>
      </div>
    );
  }

  return (
    <>
      <Cloud key={`${mark ? "m" : "-"}${picture ? "p" : "-"}`} beats={beats} />
      <PictureReveal />
    </>
  );
}
