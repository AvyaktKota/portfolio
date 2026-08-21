"use client";

import { useEffect, useRef } from "react";
import { POINTS, type Formation } from "@/lib/formations";

export type Beat = { anchor: string; formation: Formation };

const VERT = `#version 300 es
in vec2 aFrom;
in vec2 aTo;
in float aSeed;
in float aIndex;
in vec3 aTintFrom;
in vec3 aTintTo;

uniform vec2  uRes;
uniform float uT;
uniform float uTime;
uniform float uIdle;
uniform float uIdleFrom;
uniform float uIdleTo;
uniform float uDpr;
uniform float uIntro;
uniform float uActiveFrom;
uniform float uActiveTo;
uniform float uSizeFrom;
uniform float uSizeTo;
uniform vec3  uColorFrom;
uniform vec3  uColorTo;
uniform float uTintFrom;
uniform float uTintTo;
uniform float uAlphaFrom;
uniform float uAlphaTo;
uniform float uScrollY;
uniform float uDocFrom;
uniform float uDocTo;

out float vAlpha;
out vec3  vColor;
out float vMul;

void main() {
  // Per-point delay: the cloud arrives as a body of individuals, never as a
  // rigid block sliding from A to B.
  float delay = aSeed * 0.32;
  float t = clamp((uT - delay) / 0.68, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);

  // A document-anchored endpoint is converted to viewport space before the
  // mix, so it tracks its real element exactly at every scroll offset.
  vec2 pFrom = vec2(aFrom.x, aFrom.y - uScrollY * uDocFrom);
  vec2 pTo = vec2(aTo.x, aTo.y - uScrollY * uDocTo);
  vec2 p = mix(pFrom, pTo, t);
  p += vec2(sin(uTime * 0.7 + aSeed * 41.0),
            cos(uTime * 0.55 + aSeed * 33.0)) * uIdle * mix(uIdleFrom, uIdleTo, t);

  // Load-in: the image develops rather than fading up. Points arrive from
  // scatter, each on its own delay, and settle onto their positions.
  float ang = aSeed * 6.2831853 * 7.0;
  float in2 = clamp((uIntro - aSeed * 0.25) / 0.75, 0.0, 1.0);
  in2 = 1.0 - pow(1.0 - in2, 3.0);
  p += vec2(cos(ang), sin(ang)) * (1.0 - in2) * 260.0;

  vec2 clip = vec2(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = mix(uSizeFrom, uSizeTo, t) * uDpr;

  // Active count is the measured count. Points past it fade out.
  float act = mix(uActiveFrom, uActiveTo, t);
  vAlpha = (1.0 - smoothstep(act - 2500.0, act, aIndex)) * in2;
  // A per-point formation carries its own colour; the rest take the uniform.
  vec3 cFrom = mix(uColorFrom, aTintFrom, uTintFrom);
  vec3 cTo = mix(uColorTo, aTintTo, uTintTo);
  vColor = mix(cFrom, cTo, t);
  vMul = mix(uAlphaFrom, uAlphaTo, t);
}`;

const FRAG = `#version 300 es
precision mediump float;
in float vAlpha;
in vec3  vColor;
in float vMul;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (dot(c, c) > 0.25) discard;
  outColor = vec4(vColor, vAlpha * vMul);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

export default function Cloud({ beats }: { beats: Beat[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatsRef = useRef(beats);
  beatsRef.current = beats;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) {
      canvas.dataset.fallback = "true";
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ---------- program ---------- */
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = U("uRes"), uT = U("uT"), uTime = U("uTime"), uIdle = U("uIdle");
    const uDpr = U("uDpr"), uAF = U("uActiveFrom"), uAT = U("uActiveTo");
    const uSF = U("uSizeFrom"), uST = U("uSizeTo");
    const uCF = U("uColorFrom"), uCT = U("uColorTo");
    const uIntro = U("uIntro");
    const uTF = U("uTintFrom"), uTT = U("uTintTo");
    const uAlF = U("uAlphaFrom"), uAlT = U("uAlphaTo");
    const uScrollY = U("uScrollY"), uDocF = U("uDocFrom"), uDocT = U("uDocTo");
    const uIdF = U("uIdleFrom"), uIdT = U("uIdleTo");

    /* ---------- static attributes ---------- */
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    const seeds = new Float32Array(POINTS);
    const indices = new Float32Array(POINTS);
    let s = 0x2f6e2b1;
    for (let i = 0; i < POINTS; i++) {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      seeds[i] = ((s >>> 0) % 100000) / 100000;
      indices[i] = i;
    }
    const mkBuf = (data: Float32Array, loc: number, size: number, usage: number) => {
      const b = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return b;
    };
    const locFrom = gl.getAttribLocation(prog, "aFrom");
    const locTo = gl.getAttribLocation(prog, "aTo");
    const locSeed = gl.getAttribLocation(prog, "aSeed");
    const locIdx = gl.getAttribLocation(prog, "aIndex");
    const locTintFrom = gl.getAttribLocation(prog, "aTintFrom");
    const locTintTo = gl.getAttribLocation(prog, "aTintTo");

    const scratchA = new Float32Array(POINTS * 2);
    const scratchB = new Float32Array(POINTS * 2);
    const bufFrom = mkBuf(scratchA, locFrom, 2, gl.DYNAMIC_DRAW);
    const bufTo = mkBuf(scratchB, locTo, 2, gl.DYNAMIC_DRAW);
    // Two colour buffers, one per endpoint: a single shared buffer let
    // whichever per-point formation was computed second overwrite the other.
    const zeroTint = new Float32Array(POINTS * 3);
    const bufTintFrom = mkBuf(zeroTint, locTintFrom, 3, gl.DYNAMIC_DRAW);
    const bufTintTo = mkBuf(zeroTint, locTintTo, 3, gl.DYNAMIC_DRAW);
    mkBuf(seeds, locSeed, 1, gl.STATIC_DRAW);
    mkBuf(indices, locIdx, 1, gl.STATIC_DRAW);

    gl.enable(gl.BLEND);
    // Additive suits data — glow accumulates on black. A photographic portrait
    // does not: summing overlaps blows skin out to orange. Blend mode follows
    // whichever formation currently dominates.
    let additive = true;
    const setBlend = (wantAdditive: boolean) => {
      if (wantAdditive === additive) return;
      additive = wantAdditive;
      if (wantAdditive) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    };
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    /* ---------- formation cache ---------- */
    const cache = new Map<string, { pos: Float32Array; tint: Float32Array | null }>();
    let w = 0, h = 0, dpr = 1;
    const entryFor = (f: Formation) => {
      const key = `${f.id}:${w}x${h}`;
      let v = cache.get(key);
      if (!v) {
        const pos = new Float32Array(POINTS * 2);
        const tint = f.perPoint ? new Float32Array(POINTS * 3) : null;
        f.fill(pos, w, h, tint ?? undefined);
        v = { pos, tint };
        if (cache.size > 8) cache.clear();
        cache.set(key, v);
      }
      return v;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      cache.clear();
      loadedPair = -1;
    };

    /* ---------- scroll -> (pair, t) ---------- */
    let loadedPair = -1;
    const resolve = () => {
      const bs = beatsRef.current;
      const mid = window.scrollY + window.innerHeight / 2;
      const centers = bs.map((b) => {
        const el = document.getElementById(b.anchor);
        if (!el) return Number.POSITIVE_INFINITY;
        const r = el.getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      });
      let i = 0;
      while (i < centers.length - 2 && mid >= centers[i + 1]) i++;
      const a = centers[i];
      const b = centers[i + 1] ?? a + 1;
      const t = Math.min(1, Math.max(0, (mid - a) / Math.max(1, b - a)));
      return { i, t };
    };

    const upload = (i: number) => {
      const bs = beatsRef.current;
      const from = bs[i]?.formation;
      const to = bs[Math.min(i + 1, bs.length - 1)]?.formation;
      if (!from || !to) return;
      const a = entryFor(from);
      const b = entryFor(to);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufFrom);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, a.pos);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufTo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, b.pos);
      if (a.tint) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufTintFrom);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, a.tint);
      }
      if (b.tint) {
        gl.bindBuffer(gl.ARRAY_BUFFER, bufTintTo);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, b.tint);
      }
      gl.uniform1f(uAF, from.active);
      gl.uniform1f(uAT, to.active);
      gl.uniform1f(uSF, from.size ?? 1.5);
      gl.uniform1f(uST, to.size ?? 1.5);
      gl.uniform3fv(uCF, from.color);
      gl.uniform3fv(uCT, to.color);
      gl.uniform1f(uTF, from.perPoint ? 1 : 0);
      gl.uniform1f(uTT, to.perPoint ? 1 : 0);
      gl.uniform1f(uAlF, from.alpha ?? 0.85);
      gl.uniform1f(uAlT, to.alpha ?? 0.85);
      gl.uniform1f(uDocF, from.docAnchored ? 1 : 0);
      gl.uniform1f(uDocT, to.docAnchored ? 1 : 0);
      gl.uniform1f(uIdF, from.idle ?? 1);
      gl.uniform1f(uIdT, to.idle ?? 1);
      loadedPair = i;
    };

    let raf = 0;
    let running = true;
    const t0 = performance.now();

    const frame = () => {
      if (!running) return;
      const { i, t } = resolve();
      if (i !== loadedPair) upload(i);
      const bs = beatsRef.current;
      const dominant = t < 0.5 ? bs[i]?.formation : bs[Math.min(i + 1, bs.length - 1)]?.formation;
      setBlend(!dominant?.perPoint);
      gl.uniform2f(uRes, w, h);
      gl.uniform1f(uT, t);
      gl.uniform1f(uScrollY, window.scrollY);
      gl.uniform1f(uDpr, dpr);
      gl.uniform1f(uTime, reduced.matches ? 0 : (performance.now() - t0) / 1000);
      gl.uniform1f(uIdle, reduced.matches ? 0 : 1.6);
      const el = (performance.now() - t0) / 1000;
      gl.uniform1f(uIntro, reduced.matches ? 1 : Math.min(1, el / 1.9));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, POINTS);
      raf = requestAnimationFrame(frame);
    };

    resize();
    upload(0);
    raf = requestAnimationFrame(frame);
    canvas.dataset.ready = "true";

    const onResize = () => resize();
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
