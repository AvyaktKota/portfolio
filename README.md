# Portfolio

A single-page portfolio built around one continuous artifact: a WebGL point
cloud that scroll-drives between formations, where each formation is a real
measurement from my work.

The cloud opens as a monogram, resolves into a photograph, becomes the findings
list, then an aircraft, a parity line, and a DNA double helix.

## Built with

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · raw WebGL2

No 3D library. The point cloud is ~130,000 points morphing on the GPU through a
hand-written vertex shader, with a Canvas fallback and a full
`prefers-reduced-motion` path.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

## Notes

- Every text/background pair clears WCAG 2.2 AA.
- Formations are anchored in document space where they need to align to real
  elements, so the point field tracks the content at any scroll offset.
- Where a formation stands for a published measurement, its active point count
  is the real measured count. Formations for work under NDA carry no measured
  count and are marked illustrative in `lib/formations.ts`.

— Avyakt Pradyun Kotcherelakota
