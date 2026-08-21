/**
 * Formations for the point cloud.
 *
 * Where a formation stands for a published measurement, the number of ACTIVE
 * points is the measured count itself — 8,760 genes, 346 of them significant.
 * Points beyond a formation's count fade out rather than being recycled as
 * filler, so the cloud visibly thins for a smaller dataset.
 *
 * Formations for NDA-bound work carry no measured count. Their counts are
 * illustrative and marked as such; never encode a confidential figure here,
 * as a count, a ratio, or a proportion of the geometry.
 *
 * All positions are in pixel space (0..w, 0..h). The vertex shader converts.
 */

export const POINTS = 130_000;

export type Formation = {
  id: string;
  /** How many points carry data here. The rest fade. */
  active: number;
  /** Fills `out` with x,y pairs in pixel space. A per-point formation also
   *  fills `tint` with rgb triples. */
  fill: (out: Float32Array, w: number, h: number, tint?: Float32Array) => void;
  /** rgb 0..1 */
  color: [number, number, number];
  /** Point size in CSS px. */
  size?: number;
  /** Per-point opacity multiplier. Colour portraits need less than data does. */
  alpha?: number;
  /** True when this formation carries its own per-point colour. */
  perPoint?: boolean;
  /** Idle drift multiplier. Ambient states hover; data states hold still. */
  idle?: number;
  /** True when positions are document-space; the shader subtracts scroll so
   *  the field stays locked to real elements at any scroll offset. */
  docAnchored?: boolean;
};

/* Deterministic RNG so every render is identical. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}
function gauss(r: () => number) {
  const u = Math.max(r(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

const CYAN: [number, number, number] = [0.32, 0.66, 0.89];
const TEAL: [number, number, number] = [0.2, 0.7, 0.65];
const VIOLET: [number, number, number] = [0.62, 0.55, 0.94];
const ROSE: [number, number, number] = [0.92, 0.48, 0.58];
const ICE: [number, number, number] = [0.78, 0.85, 0.89];

/* ---------------- drift: the opening field ---------------- */
export const drift: Formation = {
  id: "drift",
  active: POINTS,
  color: ICE,
  size: 2.0,
  fill(out, w, h) {
    const r = rng(0x1234abcd);
    for (let i = 0; i < POINTS; i++) {
      const a = r() * Math.PI * 2;
      const rad = Math.pow(r(), 0.55) * Math.min(w, h) * 0.62;
      out[i * 2] = w / 2 + Math.cos(a) * rad * 1.35;
      out[i * 2 + 1] = h / 2 + Math.sin(a) * rad;
    }
  },
};

/**
 * The portrait, sampled from the real photograph by luminance — darker pixels
 * attract more points, so the subject emerges from density. No geometric mask
 * stands in for his outline.
 */
export function makePortrait(
  lum: Float32Array,
  edge: Float32Array,
  rgb: Float32Array,
  iw: number,
  ih: number,
): Formation {
  /* Stratified, not random: walking the pixel grid and placing points in
     proportion to weight keeps features where they actually are. The whole
     photograph is sampled — no brightness gate — because his trousers are as
     bright as the salt flat behind him and a gate would erase them. */
  const r = rng(0x51f0a3);

  // Local contrast. A flat tone curve makes a face featureless; unsharp
  // masking against a local average puts the separation back.
  const blur = new Float32Array(iw * ih);
  for (let y = 0; y < ih; y++) {
    for (let x = 0; x < iw; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -2; dy <= 2; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= ih) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= iw) continue;
          sum += lum[yy * iw + xx];
          n++;
        }
      }
      blur[y * iw + x] = sum / n;
    }
  }

  const weight = new Float32Array(iw * ih);
  let total = 0;
  for (let i = 0; i < weight.length; i++) {
    const cr = rgb[i * 3];
    const cg = rgb[i * 3 + 1];
    const cb = rgb[i * 3 + 2];
    const mx = Math.max(cr, cg, cb);
    const mn = Math.min(cr, cg, cb);
    // Skin, found from the image's own colour rather than a hardcoded box:
    // warm, R > G > B, with real chroma and short of blown-out white. Face and
    // hands get the extra points; the pale salt flat behind him does not.
    const skin =
      cr > 0.3 && cr < 0.95 &&
      cr > cg && cg > cb &&
      cr - cg > 0.06 && cg - cb > 0.012 &&
      mx - mn > 0.06;
    // even base coverage so the image reads as a photograph, plus a lift on
    // detail so edges stay crisp instead of dissolving
    const wgt = (1 + 1.6 * Math.min(1, edge[i] * 3.0)) * (skin ? 3.4 : 1);
    weight[i] = wgt;
    total += wgt;
  }

  const px: number[] = [];
  const py: number[] = [];
  const col: number[] = [];
  const scale = total > 0 ? POINTS / total : 0;

  for (let y = 0; y < ih && px.length < POINTS; y++) {
    for (let x = 0; x < iw && px.length < POINTS; x++) {
      const idx = y * iw + x;
      const n = weight[idx] * scale;
      let k = Math.floor(n);
      if (r() < n - k) k++;
      if (k === 0) continue;

      let cr = rgb[idx * 3];
      let cg = rgb[idx * 3 + 1];
      let cb = rgb[idx * 3 + 2];
      const L = Math.max(0.02, 0.2126 * cr + 0.7152 * cg + 0.0722 * cb);
      const sharp = Math.min(1, Math.max(0, L + (L - blur[idx]) * 1.35));
      const targetL = Math.min(1, 0.03 + sharp * 1.24);
      const kk = targetL / L;
      cr *= kk; cg *= kk; cb *= kk;
      const mean = (cr + cg + cb) / 3;
      const sat = 0.35 + 0.65 * Math.min(1, Math.max(0, (L - 0.06) / 0.3));
      cr = Math.min(1, Math.max(0, mean + (cr - mean) * sat));
      cg = Math.min(1, Math.max(0, mean + (cg - mean) * sat));
      cb = Math.min(1, Math.max(0, mean + (cb - mean) * sat));
      const c = (Math.round(cr * 255) << 16) | (Math.round(cg * 255) << 8) | Math.round(cb * 255);

      for (let j = 0; j < k && px.length < POINTS; j++) {
        px.push(j === 0 ? x + 0.5 : x + r());
        py.push(j === 0 ? y + 0.5 : y + r());
        col.push(c);
      }
    }
  }

  const placed = px.length;

  const form: Formation = {
    id: "portrait",
    active: placed,
    color: ICE,
    size: 2.0,
    alpha: 0.95,
    perPoint: true,
    fill(out, w, h, tint) {
      const scl = Math.min(w / iw, h / ih) * 0.88;
      const dw = iw * scl;
      const dh = ih * scl;
      const ox = (w - dw) * (w >= 900 ? 0.74 : 0.5);
      const oy = (h - dh) / 2;
      for (let i = 0; i < placed; i++) {
        out[i * 2] = ox + (px[i] / iw) * dw;
        out[i * 2 + 1] = oy + (py[i] / ih) * dh;
        if (tint) {
          const c = col[i];
          tint[i * 3] = ((c >> 16) & 255) / 255;
          tint[i * 3 + 1] = ((c >> 8) & 255) / 255;
          tint[i * 3 + 2] = (c & 255) / 255;
        }
      }
      const rr = rng(0x77c0de);
      for (let i = placed; i < POINTS; i++) {
        const a = rr() * Math.PI * 2;
        const rad = (0.8 + rr() * 0.7) * Math.min(w, h);
        out[i * 2] = w / 2 + Math.cos(a) * rad;
        out[i * 2 + 1] = h / 2 + Math.sin(a) * rad;
        if (tint) { tint[i * 3] = 0.7; tint[i * 3 + 1] = 0.8; tint[i * 3 + 2] = 0.85; }
      }
    },
  };
  return form;
}

/**
 * A mark sampled from an alpha mask — used for the logo. Points are laid on
 * the mask's own pixel grid so the letterforms stay crisp rather than fuzzy.
 */
export function makeMark(
  alpha: Float32Array,
  rgb: Float32Array,
  iw: number,
  ih: number,
): Formation {
  const r = rng(0x10609);
  const px: number[] = [];
  const py: number[] = [];
  const col: number[] = [];
  let total = 0;
  for (let i = 0; i < alpha.length; i++) total += alpha[i];
  const scale = total > 0 ? POINTS / total : 0;
  for (let y = 0; y < ih && px.length < POINTS; y++) {
    for (let x = 0; x < iw && px.length < POINTS; x++) {
      const idx = y * iw + x;
      const a = alpha[idx];
      if (a <= 0.04) continue;
      const n = a * scale;
      let k = Math.floor(n);
      if (r() < n - k) k++;
      const c =
        (Math.round(rgb[idx * 3] * 255) << 16) |
        (Math.round(rgb[idx * 3 + 1] * 255) << 8) |
        Math.round(rgb[idx * 3 + 2] * 255);
      for (let j = 0; j < k && px.length < POINTS; j++) {
        px.push(j === 0 ? x + 0.5 : x + r());
        py.push(j === 0 ? y + 0.5 : y + r());
        col.push(c);
      }
    }
  }
  const placed = px.length;
  const form: Formation = {
    id: "mark",
    active: placed,
    color: ICE,
    size: 2.0,
    alpha: 0.95,
    perPoint: true,
    fill(out, w, h, tint) {
      const scl = Math.min(w / iw, h / ih) * 0.42;
      const dw = iw * scl;
      const dh = ih * scl;
      const ox = (w - dw) / 2;
      const oy = (h - dh) / 2;
      for (let i = 0; i < placed; i++) {
        out[i * 2] = ox + (px[i] / iw) * dw;
        out[i * 2 + 1] = oy + (py[i] / ih) * dh;
        if (tint) {
          const c = col[i];
          tint[i * 3] = ((c >> 16) & 255) / 255;
          tint[i * 3 + 1] = ((c >> 8) & 255) / 255;
          tint[i * 3 + 2] = (c & 255) / 255;
        }
      }
      const rr = rng(0x5a11ed);
      for (let i = placed; i < POINTS; i++) {
        const a = rr() * Math.PI * 2;
        const rad = (0.8 + rr() * 0.8) * Math.min(w, h);
        out[i * 2] = w / 2 + Math.cos(a) * rad;
        out[i * 2 + 1] = h / 2 + Math.sin(a) * rad;
        if (tint) { tint[i * 3] = 0.8; tint[i * 3 + 1] = 0.85; tint[i * 3 + 2] = 0.9; }
      }
    },
  };
  return form;
}

/**
 * The boxes, taken from the real cells. Points walk each cell's outline at an
 * even spacing, so the field lands exactly where the content will be.
 */
export type CellRect = { x: number; y: number; w: number; h: number };

export function makeBoxes(getRects: () => CellRect[]): Formation {
  const form: Formation = {
    id: "boxes",
    active: POINTS,
    color: CYAN,
    size: 1.7,
    alpha: 0.9,
    docAnchored: true,
    fill(out, w, h) {
      const rects = getRects();
      if (!rects.length) {
        const r = rng(0x0b0e5);
        for (let i = 0; i < POINTS; i++) {
          out[i * 2] = r() * w;
          out[i * 2 + 1] = r() * h;
        }
        form.active = 0;
        return;
      }
      const perims = rects.map((r) => 2 * (r.w + r.h));
      const totalP = perims.reduce((a, b) => a + b, 0);
      let i = 0;
      for (let c = 0; c < rects.length; c++) {
        const rct = rects[c];
        const share = Math.floor((perims[c] / totalP) * POINTS);
        const per = perims[c];
        for (let j = 0; j < share && i < POINTS; j++, i++) {
          // even walk of the perimeter — equal spacing on every edge
          let d = (j / share) * per;
          let x: number;
          let y: number;
          if (d < rct.w) { x = rct.x + d; y = rct.y; }
          else if ((d -= rct.w) < rct.h) { x = rct.x + rct.w; y = rct.y + d; }
          else if ((d -= rct.h) < rct.w) { x = rct.x + rct.w - d; y = rct.y + rct.h; }
          else { d -= rct.w; x = rct.x; y = rct.y + rct.h - d; }
          out[i * 2] = x;
          out[i * 2 + 1] = y;
        }
      }
      form.active = i;
      const rr = rng(0xdeadbe);
      for (; i < POINTS; i++) {
        out[i * 2] = rr() * w;
        out[i * 2 + 1] = rects[0].y + (rr() - 0.5) * h;
      }
    },
  };
  return form;
}

/* ---------------- the craft: the SkyAccess beat ----------------
   An aircraft in plan view. Unlike the data formations below, this one is
   illustrative and carries no measured count.

   NDA: an earlier version drew a real record count and compressed the craft by
   a real proprietary ratio. Both are confidential and are gone. Do not
   reintroduce a row count, a ratio, or a vertical squash here. */
const CRAFT_POINTS = 34_000;

/**
 * Aircraft in a three-quarter read: plan view for the wings, with a tail fin
 * rising above the spine and engine nacelles slung under the wings. Each part
 * reports itself so it can be shaded separately — that shading is what makes
 * a flat silhouette read as a solid object.
 */
type Part = 0 | 1 | 2 | 3 | 4; // none | fuselage | wing | tailplane | engine | fin
function planePart(x: number, y: number): number {
  const ay = Math.abs(y);

  // engine nacelles, slung under each wing
  for (const ey of [-0.44, 0.44]) {
    const dx = (x - 0.02) / 0.15;
    const dy = (y - ey) / 0.062;
    if (dx * dx + dy * dy <= 1) return 4;
  }

  // vertical fin, rising above the spine toward the tail
  if (x >= -0.93 && x <= -0.45 && y <= 0.01) {
    const rise = 0.34 * Math.min(1, Math.max(0, (-0.45 - x) / 0.46));
    if (y >= -rise) return 5;
  }

  // fuselage: pointed nose, straight body, tapering tail
  if (x >= -0.95 && x <= 1) {
    const nose = x > 0.55 ? Math.sqrt(Math.max(0, 1 - ((x - 0.55) / 0.45) ** 2)) : 1;
    const tail = x < -0.5 ? Math.max(0, 1 - ((-0.5 - x) / 0.45) * 0.8) : 1;
    if (ay < 0.08 * nose * tail) return 1;
  }

  // main wings, swept back, with a small winglet at each tip
  if (ay <= 0.95) {
    if (x <= 0.25 - 0.5 * ay && x >= -0.05 - 0.4 * ay) return 2;
  }
  if (ay > 0.9 && ay <= 1.0 && x <= -0.2 && x >= -0.5) return 2;

  // tailplane
  if (ay <= 0.34) {
    const t = ay / 0.34;
    if (x <= -0.62 - 0.18 * t && x >= -0.85 - 0.1 * t) return 3;
  }
  return 0;
}

function aircraft(id: string, base: [number, number, number]): Formation {
  const form: Formation = {
    id,
    active: CRAFT_POINTS,
    color: base,
    size: 1.9,
    alpha: 0.92,
    perPoint: true,
    fill(out, w, h, tint) {
      const r = rng(0x9e3779b9);
      // the panel sits left on both of these beats, so the aircraft sits right
      const cx = w >= 900 ? w * 0.67 : w * 0.5;
      const cy = h * 0.5;
      const R = Math.min(w * 0.26, h * 0.32);
      let i = 0;
      let guard = 0;
      while (i < CRAFT_POINTS && i < POINTS && guard < CRAFT_POINTS * 40) {
        guard++;
        const nx = r() * 2 - 1;
        const ny = r() * 2 - 1;
        const part = planePart(nx, ny);
        if (part === 0) continue;

        out[i * 2] = cx + nx * R;
        out[i * 2 + 1] = cy + ny * R;

        if (tint) {
          // light from above: -y is up, so the upper surfaces catch it
          let b: number;
          if (part === 1) {
            // fuselage reads as a cylinder: bright along its upper shoulder
            b = 0.45 + 0.55 * Math.min(1, Math.max(0, (0.08 - ny) / 0.16));
          } else if (part === 2) {
            // wings: bright at the root, falling off toward the tip
            b = 0.92 - 0.34 * Math.abs(ny);
            // leading-edge highlight
            if (nx > 0.18 - 0.5 * Math.abs(ny)) b = Math.min(1.15, b + 0.28);
          } else if (part === 3) {
            b = 0.8 - 0.25 * Math.abs(ny);
          } else if (part === 4) {
            // nacelles sit in shadow with a lit rim
            const dx = (nx - 0.02) / 0.15;
            const dy = (ny - (ny < 0 ? -0.44 : 0.44)) / 0.062;
            const rr = Math.sqrt(dx * dx + dy * dy);
            b = rr > 0.78 ? 0.95 : 0.34;
          } else {
            // fin catches the most light
            b = 1.0;
          }
          tint[i * 3] = Math.min(1, base[0] * b);
          tint[i * 3 + 1] = Math.min(1, base[1] * b);
          tint[i * 3 + 2] = Math.min(1, base[2] * b);
        }
        i++;
      }
      form.active = i;
      for (; i < POINTS; i++) {
        out[i * 2] = cx + (r() - 0.5) * w * 2.5;
        out[i * 2 + 1] = cy + (r() - 0.5) * h * 3;
        if (tint) { tint[i * 3] = base[0] * 0.4; tint[i * 3 + 1] = base[1] * 0.4; tint[i * 3 + 2] = base[2] * 0.4; }
      }
    },
  };
  return form;
}

export const craft = aircraft("craft", TEAL);

/* ---------------- ONNX parity: zero output mismatches ----------------
   Every ported output lands on the identity line. The count of rows checked is
   confidential and is not encoded here — this count is illustrative. */
export const parity: Formation = {
  id: "parity",
  active: 12_000,
  color: VIOLET,
  size: 5.5,
  fill(out, w, h) {
    const r = rng(0x2c0ffee);
    const s = Math.min(w * 0.42, h * 0.62);
    const ox = w * 0.62 - s / 2;
    const oy = h / 2 + s / 2;
    for (let i = 0; i < POINTS; i++) {
      const t = r();
      // zero mismatches: every ported row lands exactly on identity
      const jitter = (r() - 0.5) * 1.2;
      out[i * 2] = ox + t * s + jitter;
      out[i * 2 + 1] = oy - t * s + jitter;
    }
  },
};

/* ---------------- glioblastoma: 8,760 genes ----------------
   Two strands and their base pairs. The active count is still the real number
   of genes measured; the form is a helix rather than a scatter plot. */
export const helix: Formation = (() => {
  const form: Formation = {
    id: "helix",
    active: 8_760,
    color: ROSE,
    size: 2.6,
    alpha: 0.95,
    perPoint: true,
    fill(out, w, h, tint) {
      const r = rng(0x6e1c0de);
      const cx = w * 0.34;
      const amp = Math.min(w * 0.085, 122);
      const top = h * 0.07;
      const span = h * 0.86;
      const turns = 3;
      const ACTIVE = 8_760;

      // Ten base pairs per turn, drawn boldly: the rungs are what make a
      // double helix legible. Two strands are tinted differently so the eye
      // reads two ribbons rather than one continuous coil.
      const RUNGS = turns * 10;
      const RUNG_PTS = 34;
      const THICK = 6;
      const rungTotal = RUNGS * RUNG_PTS * 2;
      const perStrand = Math.floor((ACTIVE - rungTotal) / (2 * THICK));

      const STRAND_A: [number, number, number] = [1.0, 0.42, 0.55];
      const STRAND_B: [number, number, number] = [0.62, 0.72, 1.0];
      const RUNG: [number, number, number] = [0.95, 0.8, 0.85];

      let i = 0;
      const put = (
        x: number,
        y: number,
        depth: number,
        base: [number, number, number],
        mul: number,
      ) => {
        if (i >= POINTS) return;
        out[i * 2] = x;
        out[i * 2 + 1] = y;
        if (tint) {
          const b = (0.3 + 0.7 * (depth * 0.5 + 0.5)) * mul;
          tint[i * 3] = Math.min(1, base[0] * b);
          tint[i * 3 + 1] = Math.min(1, base[1] * b);
          tint[i * 3 + 2] = Math.min(1, base[2] * b);
        }
        i++;
      };

      const strands: [number, [number, number, number]][] = [
        [0, STRAND_A],
        [Math.PI, STRAND_B],
      ];
      for (const [phase, base] of strands) {
        for (let j = 0; j < perStrand; j++) {
          const t = j / perStrand;
          const a = t * turns * Math.PI * 2 + phase;
          const x = cx + Math.sin(a) * amp;
          const y = top + t * span;
          const d = Math.cos(a);
          for (let k = 0; k < THICK; k++) {
            const off = (k / (THICK - 1) - 0.5) * 12 * (0.4 + 0.6 * Math.abs(d));
            put(x + off, y + (r() - 0.5) * 1.1, d, base, 1);
          }
        }
      }

      // base pairs: bold two-row bars, skipped only right at the crossings
      for (let k = 0; k < RUNGS; k++) {
        const t = (k + 0.5) / RUNGS;
        const a = t * turns * Math.PI * 2;
        const xa = cx + Math.sin(a) * amp;
        const xb = cx + Math.sin(a + Math.PI) * amp;
        if (Math.abs(xa - xb) < amp * 0.22) continue;
        const y = top + t * span;
        for (let row = 0; row < 2; row++) {
          for (let j = 0; j < RUNG_PTS; j++) {
            const u = j / (RUNG_PTS - 1);
            put(
              xa + (xb - xa) * u,
              y + (row - 0.5) * 2.6 + (r() - 0.5) * 0.8,
              Math.cos(a) * (1 - u * 2),
              RUNG,
              0.9,
            );
          }
        }
      }

      form.active = i;
      for (; i < POINTS; i++) {
        out[i * 2] = cx + (r() - 0.5) * w * 2.4;
        out[i * 2 + 1] = h * 2 + r() * h;
        if (tint) { tint[i * 3] = 0.5; tint[i * 3 + 1] = 0.3; tint[i * 3 + 2] = 0.35; }
      }
    },
  };
  return form;
})();

/* ---------------- ambient: reading sections ----------------
   Nothing to say here, so it says nothing. An even, very dim field spread
   across the whole frame that hovers gently in place — never clusters, never
   frames the content, never asks to be looked at. */
export const ambient: Formation = {
  id: "ambient",
  active: 15_000,
  color: ICE,
  size: 1.5,
  alpha: 0.42,
  idle: 5.5,
  fill(out, w, h) {
    const r = rng(0xa3b1e7);
    // jittered grid rather than pure random, so the spacing stays even
    const N = 15_000;
    const cols = Math.round(Math.sqrt(N * (w / h)));
    const rows = Math.ceil(N / cols);
    let i = 0;
    for (let y = 0; y < rows && i < N; y++) {
      for (let x = 0; x < cols && i < N; x++, i++) {
        out[i * 2] = ((x + 0.15 + r() * 0.7) / cols) * w;
        out[i * 2 + 1] = ((y + 0.15 + r() * 0.7) / rows) * h;
      }
    }
    for (; i < POINTS; i++) {
      out[i * 2] = w / 2 + (r() - 0.5) * w * 2.5;
      out[i * 2 + 1] = h / 2 + (r() - 0.5) * h * 2.5;
    }
  },
};
