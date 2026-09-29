#!/usr/bin/env node
// design-council — collect a project's design & experience facts and suggest its stage.
// Read-only. No dependencies. Run with --help for usage.

import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const HELP = `
dossier.mjs — project facts for the design council

  --root <dir>   Project root (default: current directory)
  --out <file>   Write markdown to a file instead of stdout
  --json         Print JSON instead of markdown
  --help
`;

const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d; };
if (flag("--help")) { console.log(HELP); process.exit(0); }

const root = path.resolve(opt("--root", "."));
if (!existsSync(root)) { console.error(`No such directory: ${root}`); process.exit(1); }

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".turbo", ".vercel", "coverage", ".cache", ".design", ".council", "vendor", ".svelte-kit", ".nuxt", ".output"]);
const SOURCE_EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".mjs", ".vue", ".svelte", ".astro", ".css", ".scss", ".mdx", ".html"]);
const MAX_FILES = 6000;
const MAX_BYTES = 400_000;

const read = (p) => { try { return readFileSync(path.join(root, p), "utf8"); } catch { return null; } };
const exists = (p) => existsSync(path.join(root, p));
const readJson = (p) => { const s = read(p); if (!s) return null; try { return JSON.parse(s); } catch { return null; } };

/* ─────────── walk ─────────── */
const files = [];
(function walk(dir) {
  if (files.length >= MAX_FILES) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (files.length >= MAX_FILES) return;
    if (e.name.startsWith(".") && ![".storybook", ".github"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(full); }
    else if (e.isFile()) files.push(path.relative(root, full));
  }
})(root);

const sourceFiles = files.filter((f) => SOURCE_EXT.has(path.extname(f)));
const count = (re, list = sourceFiles) => {
  let n = 0;
  for (const f of list) {
    let st; try { st = statSync(path.join(root, f)); } catch { continue; }
    if (st.size > MAX_BYTES) continue;
    const s = read(f); if (!s) continue;
    const m = s.match(re); if (m) n += m.length;
  }
  return n;
};
const filesMatching = (re, list = sourceFiles) => list.filter((f) => { const s = read(f); return s && re.test(s); });

/* ─────────── package.json ─────────── */
const pkg = readJson("package.json") || {};
const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const has = (name) => Object.prototype.hasOwnProperty.call(deps, name);
const ver = (name) => (has(name) ? String(deps[name]).replace(/^[^\d]*/, "") : null);
const anyDep = (re) => Object.keys(deps).filter((d) => re.test(d));

const framework = has("next") ? `Next.js ${ver("next") ?? ""}`.trim()
  : has("nuxt") ? "Nuxt" : has("@sveltejs/kit") ? "SvelteKit" : has("astro") ? "Astro"
  : has("vue") ? "Vue" : has("svelte") ? "Svelte" : has("react") ? "React" : files.some((f) => f.endsWith(".html")) ? "Static HTML" : "unknown";

const tailwindVer = ver("tailwindcss");
const styling = [
  tailwindVer && `Tailwind ${tailwindVer}`,
  has("styled-components") && "styled-components",
  has("@emotion/react") && "Emotion",
  has("sass") && "Sass",
  sourceFiles.some((f) => f.endsWith(".module.css")) && "CSS Modules",
].filter(Boolean);

const uiLibs = [
  exists("components.json") && "shadcn/ui",
  anyDep(/^@radix-ui\//).length && `Radix (${anyDep(/^@radix-ui\//).length} pkgs)`,
  has("@base-ui-components/react") && "Base UI",
  has("@headlessui/react") && "Headless UI",
  has("react-aria-components") && "React Aria",
  has("@mui/material") && "MUI",
  has("@chakra-ui/react") && "Chakra",
  has("@mantine/core") && "Mantine",
  has("antd") && "Ant Design",
  has("lucide-react") && "Lucide icons",
  has("@phosphor-icons/react") && "Phosphor icons",
].filter(Boolean);

const motionLibs = [
  has("motion") && "Motion", has("framer-motion") && "Framer Motion", has("gsap") && "GSAP",
  has("lenis") && "Lenis", has("three") && "three.js", has("@react-three/fiber") && "React Three Fiber",
  (has("lottie-react") || has("@lottiefiles/dotlottie-react")) && "Lottie", anyDep(/^@rive-app\//).length && "Rive",
].filter(Boolean);

const i18nLibs = [has("next-intl") && "next-intl", has("i18next") && "i18next", has("react-intl") && "react-intl", has("@lingui/core") && "Lingui"].filter(Boolean);
const analytics = [has("@vercel/analytics") && "Vercel Analytics", has("posthog-js") && "PostHog", has("mixpanel-browser") && "Mixpanel", has("@segment/analytics-next") && "Segment", has("plausible-tracker") && "Plausible", has("@sentry/nextjs") && "Sentry", has("@sentry/react") && "Sentry"].filter(Boolean);
const deploy = [exists("vercel.json") && "vercel.json", exists("netlify.toml") && "netlify.toml", exists("Dockerfile") && "Dockerfile", exists("fly.toml") && "fly.toml", exists(".github/workflows") && "GitHub Actions"].filter(Boolean);
const tests = [
  (exists("playwright.config.ts") || exists("playwright.config.js") || has("@playwright/test")) && "Playwright",
  (has("vitest")) && "Vitest", has("jest") && "Jest", (exists(".storybook") || anyDep(/^@storybook\//).length) && "Storybook",
  (has("@chromatic-com/storybook") || has("chromatic")) && "Chromatic",
].filter(Boolean);

/* ─────────── routes & components ─────────── */
const routes = files.filter((f) => /(^|\/)app\/(.+\/)?page\.(tsx|jsx|ts|js|mdx)$/.test(f) || /(^|\/)pages\/(?!api\/|_).+\.(tsx|jsx|ts|js|mdx)$/.test(f) || /(^|\/)src\/routes\/.+\+page\.svelte$/.test(f));
const components = files.filter((f) => /(^|\/)components\/.+\.(tsx|jsx|vue|svelte)$/.test(f));
const uiPrimitives = files.filter((f) => /(^|\/)components\/ui\/.+\.(tsx|jsx)$/.test(f));

/* ─────────── design signals ─────────── */
const cssLike = sourceFiles.filter((f) => /\.(css|scss)$/.test(f));
const markup = sourceFiles.filter((f) => /\.(tsx|jsx|vue|svelte|astro|html|mdx)$/.test(f));
const signals = {
  themeBlock: count(/@theme\b/g, cssLike),
  cssVars: count(/--[a-z][\w-]*\s*:/g, cssLike),
  oklch: count(/oklch\(/g),
  hexInMarkup: count(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![\w-])/g, markup),
  arbitraryColorClasses: count(/\b(?:bg|text|border|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/g, markup),
  darkVariant: count(/\bdark:/g, markup),
  prefersDark: count(/prefers-color-scheme:\s*dark/g),
  nextThemes: has("next-themes"),
  physicalSpacing: count(/\b-?(?:ml|mr|pl|pr)-(?:\d|px|auto|\[)|\b(?:left|right)-(?:\d|px|\[|full|1\/2)|\btext-(?:left|right)\b|\brounded-(?:l|r|tl|tr|bl|br)(?:-|\b)/g, markup),
  logicalSpacing: count(/\b-?(?:ms|me|ps|pe)-(?:\d|px|auto|\[)|\b(?:start|end)-(?:\d|px|\[|full)|\btext-(?:start|end)\b|\brounded-(?:s|e|ss|se|es|ee)(?:-|\b)/g, markup),
  rtlVariant: count(/\brtl:|\bltr:/g, markup),
  dirAttr: count(/\bdir=\{|\bdir="(?:rtl|ltr|auto)"/g, markup),
  hebrewText: count(/[֐-׿]{2,}/g, markup),
  reducedMotion: count(/prefers-reduced-motion|motion-reduce:|motion-safe:|useReducedMotion|reducedMotion=/g),
  viewTransitions: count(/startViewTransition|@view-transition|view-transition-name|<ViewTransition/g),
  focusVisible: count(/focus-visible/g),
  ariaAttrs: count(/\baria-[a-z]+=/g, markup),
  divOnClick: count(/<div[^>]*\bonClick=/g, markup),
  fonts: [...new Set(sourceFiles.flatMap((f) => { const s = read(f) || ""; return [...s.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']next\/font\/google["']/g)].flatMap((m) => m[1].split(",").map((x) => x.trim().replace(/_/g, " ")).filter(Boolean)); }))],
};

/* ─────────── docs & history ─────────── */
const readmePath = files.find((f) => /^readme(\.md)?$/i.test(f));
const readme = readmePath ? read(readmePath) : null;
const readmeExcerpt = readme ? readme.split("\n").filter((l) => l.trim()).slice(0, 12).join("\n") : null;
const designDoc = ["DESIGN.md", "docs/DESIGN.md", "design.md"].find(exists) || null;
const claudeMd = exists("CLAUDE.md");
const direction = exists(".council/DIRECTION.md") ? read(".council/DIRECTION.md") : null;
const decisions = exists(".council/decisions")
  ? readdirSync(path.join(root, ".council/decisions")).filter((f) => /^\d{4}-.+\.md$/.test(f)).sort().map((f) => {
      const s = read(path.join(".council/decisions", f)) || "";
      const title = (s.match(/^#\s+(.+)$/m) || [])[1] || f;
      const status = (s.match(/\*\*Status:\*\*\s*(.+)$/m) || [])[1] || "unknown";
      return { file: f, title, status: status.trim() };
    })
  : [];
const tasteProfile = files.find((f) => /taste-profile\.md$/.test(f)) || null;

let git = null;
try {
  const run = (...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  const commits = Number(run("rev-list", "--count", "HEAD"));
  const first = run("log", "--reverse", "--format=%as", "--max-parents=0").split("\n")[0];
  const last = run("log", "-1", "--format=%as");
  const authors = new Set(run("log", "--format=%ae").split("\n").filter(Boolean)).size;
  const recent = run("log", "-8", "--format=%as  %s").split("\n").filter(Boolean);
  const shallow = run("rev-parse", "--is-shallow-repository") === "true";
  git = { commits, first, last, authors, recent, shallow };
} catch {}

/* ─────────── stage heuristic ─────────── */
function suggestStage() {
  // Size and age gate the higher stages; deploy/analytics/test config alone is cheap to add.
  const nRoutes = routes.length, nComp = components.length;
  const commits = git?.commits ?? 0, authors = git?.authors ?? 1;
  if (!Object.keys(deps).length && sourceFiles.length < 5) {
    return { stage: "0 · Idea", confidence: "high", why: ["no package.json dependencies and almost no source files"] };
  }
  const live = deploy.length > 0 || analytics.length > 0;
  const sizeable = nRoutes >= 8 || nComp >= 30;
  const established = commits >= 80 || authors >= 2;
  const heavy = (nRoutes >= 20 || nComp >= 80) && (commits >= 400 || authors >= 4);
  const why = [
    `${nRoutes} routes, ${nComp} components`,
    `${commits} commits, ${authors} author(s)${git?.shallow ? " (shallow clone)" : ""}`,
    live ? `live signals: ${[...deploy, ...analytics].join(", ")}` : "no deploy/analytics signals",
    tests.length ? `tests/docs: ${tests.join(", ")}` : "no tests",
  ];
  let stage, conflicts = 0;
  if (heavy && tests.length) stage = "4 · Mature";
  else if (live && sizeable && established) stage = "3 · Growth";
  else if (live && nRoutes >= 3) stage = "2 · MVP";
  else stage = "1 · Prototype";
  // conflicting signals lower confidence
  if (stage === "1 · Prototype" && (sizeable || tests.length)) conflicts++;
  if (stage === "2 · MVP" && (commits < 10 || !sizeable && nComp < 5)) conflicts++;
  if (stage === "3 · Growth" && !tests.length) conflicts++;
  if (tests.includes("Storybook") && !stage.startsWith("4")) conflicts++;
  if (git?.shallow) conflicts++;
  const confidence = conflicts === 0 ? "medium" : "low";
  return { stage, confidence, why };
}
const stage = suggestStage();

/* ─────────── output ─────────── */
const data = {
  root, generated: new Date().toISOString().slice(0, 10),
  project: { name: pkg.name || path.basename(root), framework, react: ver("react"), styling, uiLibs, motionLibs, i18nLibs, analytics, deploy, tests },
  size: { files: files.length, sourceFiles: sourceFiles.length, routes: routes.length, components: components.length, uiPrimitives: uiPrimitives.length, truncated: files.length >= MAX_FILES },
  routes: routes.slice(0, 40),
  signals, docs: { readme: readmePath, readmeExcerpt, designDoc, claudeMd, tasteProfile },
  council: { hasDirection: !!direction, decisions },
  git, stage,
};

if (flag("--json")) { console.log(JSON.stringify(data, null, 2)); process.exit(0); }

const list = (a) => (a && a.length ? a.join(", ") : "—");
const yes = (b) => (b ? "yes" : "no");
const ratio = signals.physicalSpacing + signals.logicalSpacing ? Math.round((signals.logicalSpacing / (signals.physicalSpacing + signals.logicalSpacing)) * 100) : null;

const md = `# Dossier facts — ${data.project.name}

_Generated ${data.generated} by design-council/scripts/dossier.mjs (read-only scan of \`${path.basename(root)}\`)._

## Suggested stage
**${stage.stage}** — confidence: ${stage.confidence}
- ${stage.why.join("\n- ")}

## Stack
| | |
|---|---|
| Framework | ${framework}${data.project.react ? ` · React ${data.project.react}` : ""} |
| Styling | ${list(styling)} |
| UI libraries | ${list(uiLibs)} |
| Motion | ${list(motionLibs)} |
| i18n | ${list(i18nLibs)} |
| Analytics / monitoring | ${list(analytics)} |
| Deploy / CI | ${list(deploy)} |
| Tests / docs | ${list(tests)} |
| Fonts (next/font) | ${list(signals.fonts)} |

## Size
${data.size.files} files · ${data.size.sourceFiles} source · ${data.size.routes} routes · ${data.size.components} components (${data.size.uiPrimitives} in components/ui)${data.size.truncated ? " · _scan truncated_" : ""}
${routes.length ? "\nRoutes: " + routes.slice(0, 20).map((r) => "`" + r + "`").join(", ") + (routes.length > 20 ? ", …" : "") : ""}

## Design signals
| Signal | Value | Reading |
|---|---|---|
| Token layer | @theme ×${signals.themeBlock} · CSS vars ×${signals.cssVars} · oklch() ×${signals.oklch} | ${signals.themeBlock || signals.cssVars > 10 ? "tokens present" : "little or no token layer"} |
| Hard-coded colors in markup | hex ×${signals.hexInMarkup} · arbitrary color classes ×${signals.arbitraryColorClasses} | ${signals.hexInMarkup + signals.arbitraryColorClasses > 20 ? "drift likely" : "low"} |
| Dark mode | dark: ×${signals.darkVariant} · prefers-color-scheme ×${signals.prefersDark} · next-themes: ${yes(signals.nextThemes)} | ${signals.darkVariant || signals.prefersDark ? "some support" : "none found"} |
| Direction (RTL/LTR) | logical ×${signals.logicalSpacing} vs physical ×${signals.physicalSpacing}${ratio !== null ? ` (${ratio}% logical)` : ""} · rtl:/ltr: ×${signals.rtlVariant} · dir attrs ×${signals.dirAttr} · Hebrew strings ×${signals.hebrewText} | ${signals.hebrewText && ratio !== null && ratio < 80 ? "Hebrew present but layout mostly physical — RTL risk" : ratio === null ? "no spacing classes found" : ratio >= 80 ? "direction-ready" : "LTR-oriented"} |
| Reduced motion | ×${signals.reducedMotion} | ${motionLibs.length && !signals.reducedMotion ? "motion libs without reduced-motion handling" : signals.reducedMotion ? "handled somewhere" : "—"} |
| View Transitions | ×${signals.viewTransitions} | |
| Accessibility hints | focus-visible ×${signals.focusVisible} · aria-* ×${signals.ariaAttrs} · div onClick ×${signals.divOnClick} | ${signals.divOnClick ? `clickable divs ×${signals.divOnClick} — check semantics` : ""} |

## Written context
- README: ${readmePath ? "`" + readmePath + "`" : "none"}
- DESIGN.md: ${designDoc ? "`" + designDoc + "`" : "none"} · CLAUDE.md: ${yes(claudeMd)}
- Owner taste profile: ${tasteProfile ? "`" + tasteProfile + "`" : "not in this repo (check the design-director plugin)"}
${readmeExcerpt ? "\n```text\n" + readmeExcerpt.slice(0, 900) + "\n```" : ""}

## Council history
- DIRECTION.md: ${yes(!!direction)}
${decisions.length ? decisions.map((d) => `- ${d.file} — ${d.title} — **${d.status}**`).join("\n") : "- no decisions recorded yet"}

## Git
${git ? `${git.commits} commits${git.shallow ? " (shallow clone — counts may be low)" : ""} · ${git.authors} author(s) · first ${git.first} · last ${git.last}

Recent:
${git.recent.map((r) => "- " + r).join("\n")}` : "not a git repository"}

## Not established by this scan
- Who the users are and what they need — ask, or read product docs
- How the running app looks and behaves — capture screenshots
- Real usage (traffic, funnels, feedback) — ask for analytics or support notes
`;

const out = opt("--out");
if (out) { mkdirSync(path.dirname(path.resolve(out)), { recursive: true }); writeFileSync(out, md); console.log(`Wrote ${out}`); }
else console.log(md);
