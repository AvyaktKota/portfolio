/**
 * Single source of truth for the whole site.
 *
 * TO ADD A NEW FINDING OR PROJECT: append a typed object to `findings` or
 * `projects` below. TypeScript enforces the shape, the chart lays it out, and
 * the property selector picks up new categories automatically. Nothing else
 * needs touching.
 *
 * Every claim here traces to the current resume. Do not add numbers that are
 * not on it.
 *
 * SkyAccess work is under NDA. Ship only what the CTO-reviewed resume says,
 * and less where the resume still carries a specific proprietary figure —
 * paraphrasing or rounding such a figure is still disclosure. Proprietary
 * ratios, row counts, record counts and table sizes stay off this site.
 */

export const person = {
  name: "Avyakt Pradyun Kotcherelakota",
  short: "Pradyun Kotcherelakota",
  role: "Backend & ML Engineer",
  degree: "B.S. Artificial Intelligence",
  school: "University of California, San Diego",
  schoolShort: "UC San Diego",
  place: "La Jolla, CA",
  enrolled: "Aug 2025 — Present",
  enrolledStart: "2025-08",
  graduation: "Expected June 2028",
  email: "akotcherelakota@ucsd.edu",
  github: "https://github.com/AvyaktKota",
  githubHandle: "AvyaktKota",
  linkedin: "https://www.linkedin.com/in/pradyunk",
  linkedinHandle: "in/pradyunk",
  portrait: {
    webp: "/img/pradyun.webp",
    jpg: "/img/pradyun.jpg",
    width: 780,
    height: 1698,
  },
  thesis:
    "Fixing the bug is the easy part. Noticing it is the job.",
  subthesis:
    "A consent gate one feature flag from falling open. A pricing model that looked healthy by every metric that existed. Software that built impossible rooms and reported success. Not one of them reported anything wrong.",
} as const;

/**
 * The resume PDF is deliberately not served from this site. Both existing
 * copies carry a phone number and a proprietary figure, and a hosted PDF is a
 * second copy of every claim to keep in sync. Set this to a path under
 * /public once a redacted copy exists — every Resume link is omitted until
 * then rather than rendered broken.
 */
export const resumeHref: string | null = null;

/* ------------------------------------------------------------------ *
 * How work is categorised. One fixed hue per domain; no selector, no legend.
 * Adding a value here adds it to the legend automatically.
 * ------------------------------------------------------------------ */

export type Domain = "backend" | "infrastructure" | "ml" | "research";
export type Org = "SkyAccess" | "Computer Vision Lab" | "Rana Lab";

export const domainLabels: Record<Domain, string> = {
  backend: "Backend",
  infrastructure: "Infrastructure",
  ml: "Machine learning",
  research: "Research",
};

export const orgLabels: Record<Org, string> = {
  SkyAccess: "SkyAccess",
  "Computer Vision Lab": "CV Lab, UCSD",
  "Rana Lab": "Rana Lab, UCSD",
};

/* ------------------------------------------------------------------ *
 * Findings — the cells of the chart.
 * ------------------------------------------------------------------ */

export type Metric = {
  /** Rendered verbatim. Keep it short — it sets at display weight. */
  value: string;
  label: string;
};

export type Finding = {
  /** Chart address. Stable — it is the deep link (#f-03) and the legend key. */
  n: number;
  name: string;
  org: Org;
  domain: Domain;
  year: string;
  /** The figure shown inside the cell. Keep it short — it renders small. */
  cell: { value: string; unit: string };
  /** What everyone could already see, before the instrument existed. */
  visible: string;
  /** What measuring it actually revealed. */
  found: string;
  /** What was built or shipped in response. */
  did: string;
  metrics: Metric[];
  stack: string[];
};

export const findings: Finding[] = [
  {
    n: 1,
    name: "A consent gate that could fall open on its own",
    org: "SkyAccess",
    domain: "backend",
    year: "2026",
    cell: { value: "1", unit: "flag from a consent leak" },
    visible:
      "The defect had already been reviewed and signed off. The system reported that consent was being enforced.",
    found:
      "One feature flag stood between the current state and operator data being published without consent. The gate could fall open, and nothing about that would have announced itself.",
    did:
      "Traced it to a NULL-handling path that let the gate fall open, shipped a NULL-safe fix, and backed it with regression tests covering the flag states nobody had exercised.",
    metrics: [
      { value: "1", label: "feature flag from a consent leak" },
      { value: "NULL-safe", label: "fix, backed by regression tests" },
    ],
    stack: ["Node.js", "TypeScript", "Postgres", "Jest"],
  },
  {
    n: 2,
    name: "A pricing model that looked healthy by every metric that existed",
    org: "SkyAccess",
    domain: "ml",
    year: "2026",
    cell: { value: "0", unit: "metrics that could see it" },
    visible:
      "The pricing model looked healthy on every chart the team had.",
    found:
      "Health was being read off metrics that could not see the failure mode. Nothing was measuring the model against what it was supposed to do — so a validation failure could sit in production indefinitely, reported as fine.",
    did:
      "Built shadow-scoring and coverage instrumentation — running the model in parallel with production and recording what it would have done — which surfaced a validation failure no existing metric could reach.",
    metrics: [
      { value: "0", label: "existing metrics could surface it" },
      { value: "Shadow", label: "scored in parallel with production" },
    ],
    stack: ["Python", "Postgres", "pandas"],
  },
  {
    n: 3,
    name: "The company's first live prediction model",
    org: "SkyAccess",
    domain: "ml",
    year: "2026",
    cell: { value: "0", unit: "output mismatches" },
    visible:
      "A prediction model built by the data team had no safe route into the live product, and no agreed way to prove a rebuilt version still behaved like the original.",
    found:
      "Sameness was being assumed rather than checked — and a ported model that quietly drifts looks exactly like one that works.",
    did:
      "Ported ONNX inference into a Node/Bull queue and checked every output against the Python reference: zero mismatches. It became the company's first production ML model, and the template every data-science handoff has followed since.",
    metrics: [
      { value: "0", label: "output mismatches" },
      { value: "1st", label: "model live in production" },
    ],
    stack: ["Node.js", "ONNX Runtime", "Bull", "TypeScript"],
  },
  {
    n: 4,
    name: "Three hours where nobody could ship anything",
    org: "SkyAccess",
    domain: "infrastructure",
    year: "2026",
    cell: { value: "3 hr", unit: "deploy freeze ended" },
    visible:
      "Nothing could be released for three hours, and two security patches were stuck behind the block.",
    found:
      "The database was quietly binding the wrong version of a function whenever two versions looked similar to it.",
    did:
      "Root-caused it to Postgres function-overload resolution under json/jsonb schema drift, and released the two stranded security patches.",
    metrics: [
      { value: "3 hr", label: "deploy freeze ended" },
      { value: "2", label: "security patches unblocked" },
    ],
    stack: ["Postgres", "SQL", "Prisma"],
  },
  {
    n: 5,
    name: "Software that built impossible rooms and said it worked",
    org: "Computer Vision Lab",
    domain: "research",
    year: "2026",
    cell: { value: "0", unit: "warnings it ever gave" },
    visible:
      "The system reported success every time it ran.",
    found:
      "It was placing windows inside solid walls and raising no error at all. Silence is worse than a crash, because nothing further down the line knows the result is wrong.",
    did:
      "Contributed to InteriorAgent, an LLM program-synthesis project for 3D layout out of UCSD and Qualcomm — working in the codebase and generating the scenes it was tested against. Landed merged fixes, including the geometry check that turns that silent failure into a loud one.",
    metrics: [
      { value: "0", label: "warnings it ever gave" },
      { value: "Merged", label: "fixes landed upstream" },
    ],
    stack: ["Python", "3D layout", "LLM program synthesis"],
  },
  {
    n: 6,
    name: "346 genes that mattered, out of 8,760",
    org: "Rana Lab",
    domain: "research",
    year: "2026",
    cell: { value: "346", unit: "genes that mattered" },
    visible:
      "Thousands of genes of results, and a real risk that re-running the analysis would quietly overwrite the answer you were about to rely on.",
    found:
      "Out of 8,760 genes measured in brain tumour cells that resist treatment, 346 showed a real difference. The strongest signal sat in the machinery that controls how cells divide.",
    did:
      "Ran GO, KEGG and preranked GSEA (goatools, MSigDB Hallmark) over 346 DEGs filtered at p < 0.05 and |log2FC| ≥ 0.25, surfacing 10 significant gene sets led by G2M checkpoint at NES −2.234, FDR 0.008. Built the pipeline with directional filtering and run-tagged outputs so no run can silently overwrite another.",
    metrics: [
      { value: "8,760", label: "genes measured" },
      { value: "346", label: "with a real difference" },
      { value: "10", label: "biological processes flagged" },
    ],
    stack: ["Python", "goatools", "GSEA", "pandas"],
  },
];

/* ------------------------------------------------------------------ *
 * Positions
 * ------------------------------------------------------------------ */

export type Position = {
  org: Org;
  title: string;
  span: string;
  /** Machine-readable start, YYYY-MM. Drives the timeline formation. */
  start: string;
  place: string;
  note: string;
  /** Chart addresses of the findings produced here. */
  findings: number[];
};

export const positions: Position[] = [
  {
    org: "SkyAccess",
    title: "Backend Engineer Intern",
    span: "May 2026 — Present",
    start: "2026-05",
    place: "Remote",
    note:
      "Backend engineering for a private-aviation marketplace. Shipped the company's first production ML model, and built the instrumentation that made a pricing failure visible.",
    findings: [1, 2, 3, 4],
  },
  {
    org: "Computer Vision Lab",
    title: "Undergraduate Research Assistant",
    span: "Jun 2026 — Present",
    start: "2026-06",
    place: "UC San Diego",
    note:
      "Contributing to InteriorAgent, LLM program synthesis for 3D layout, out of UCSD and Qualcomm — working in the codebase and generating the scenes it is tested against. Also built the labelling standards for a desktop-use agent that drives Unreal Engine by mouse and keyboard, under conventions that keep downstream OCR reliable.",
    findings: [5],
  },
  {
    org: "Rana Lab",
    title: "Undergraduate Researcher",
    span: "Jan 2026 — Present",
    start: "2026-01",
    place: "UC San Diego",
    note:
      "Finding which genes behave differently in brain tumour cells that resist treatment, and building the analysis so its results can always be traced back to the run that produced them.",
    findings: [6],
  },
];

/* ------------------------------------------------------------------ *
 * Projects
 * ------------------------------------------------------------------ */

export type Project = {
  name: string;
  year: string;
  /** Machine-readable date, YYYY-MM. Drives the timeline formation. */
  date: string;
  blurb: string;
  detail: string;
  stack: string[];
  href?: string;
  award?: string;
  metrics?: Metric[];
  /** Set once a hosted demo exists. Until then the slot renders as awaiting. */
  demo?: string;
  /** Set to a path under /public once a real capture exists. */
  capture?: string;
  captureAwaiting?: string;
};

export const projects: Project[] = [
  {
    name: "Brain MRI Tumor Classifier",
    year: "Sep 2025",
    date: "2025-09",
    blurb:
      "Reads a brain scan, says which of four tumour types it is, and shows you why.",
    detail:
      "92% accurate across 4 tumour types. Every answer comes with a picture highlighting the exact regions of the scan that led to it — so a doctor can check the reasoning instead of taking it on trust. Deployed as a web app anyone can try.",
    stack: ["Python", "TensorFlow/Keras", "LIME", "Gradio", "scikit-learn"],
    href: "https://github.com/AvyaktKota/BrainTumor-CNN-Model",
    award: "Best Project — UCSD Summer Program for Incoming Students, audience of 50+",
    metrics: [
      { value: "92%", label: "classification accuracy" },
      { value: "4", label: "tumour types classified" },
    ],
    captureAwaiting: "Explanation overlay",
  },
];

export const alsoOnGithub: { name: string; blurb: string; href: string }[] = [];

/* ------------------------------------------------------------------ *
 * Toolkit — the group columns of the chart.
 * ------------------------------------------------------------------ */

export const toolkit: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "SQL (Postgres)", "Java", "C/C++", "R", "HTML/CSS"],
  },
  {
    group: "Frameworks",
    items: ["Node.js", "React", "FastAPI", "Flask", "Next.js", "Prisma"],
  },
  {
    group: "ML & Data",
    items: ["PyTorch", "TensorFlow/Keras", "scikit-learn", "ONNX Runtime", "pandas", "NumPy", "Matplotlib"],
  },
  {
    group: "Tools",
    items: ["Git", "Docker", "Jest", "pgvector", "Jupyter"],
  },
  {
    group: "Bioinformatics",
    items: ["BWA-MEM", "CIRI3", "goatools", "GSEA", "SRA Toolkit"],
  },
];

export const sections = [
  { id: "chart", label: "Findings" },
  { id: "measure", label: "Measurement" },
  { id: "parity", label: "Parity" },
  { id: "enrichment", label: "Research" },
  { id: "positions", label: "Positions" },
  { id: "projects", label: "Projects" },
  { id: "toolkit", label: "Toolkit" },
  { id: "contact", label: "Contact" },
] as const;
