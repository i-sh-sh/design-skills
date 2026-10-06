#!/usr/bin/env node
// design-director — gather the facts for a project retrospective (read-only).
//
//   node <skill>/scripts/retro.mjs --root <project> [--since <git ref|date>] [--json]
//
// Reports: commits in range, what areas changed, which skill patterns and guardrails
// the project uses, whether the checks pass right now, screenshots on disk, council
// decisions, and candidate components to extract into patterns/.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(opt("--root", "."));
const since = opt("--since");
const git = (...a) => { try { return execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };

/* commits */
const range = since ? (/^\d{4}-\d{2}-\d{2}$/.test(since) ? ["--since", since] : [`${since}..HEAD`]) : [];
const log = git("log", "--no-merges", "--format=%h|%as|%s", ...range).split("\n").filter(Boolean).map((l) => { const [h, d, ...s] = l.split("|"); return { h, d, s: s.join("|") }; });
const changed = git("log", "--no-merges", "--name-only", "--format=", ...range).split("\n").filter(Boolean);
const areas = {};
for (const f of new Set(changed)) {
  const a = f.startsWith(".council/") ? "council" : /components\/ui\//.test(f) ? "ui kit" : /components\//.test(f) ? "components" : /(^|\/)app\//.test(f) ? "routes" : /\.css$/.test(f) ? "styles" : /^(scripts|\.github)\//.test(f) ? "tooling" : "other";
  (areas[a] ||= []).push(f);
}

/* source scan */
const src = [];
(function walk(d) {
  let es; try { es = readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of es) {
    if (["node_modules", ".next", ".git", "dist", "build", ".design"].includes(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|css)$/.test(e.name) && statSync(p).size < 400_000) src.push(p);
  }
})(root);
const text = src.map((f) => readFileSync(f, "utf8")).join("\n");
const signatures = {
  "segmented (sliding indicator)": /role="radiogroup"[\s\S]{0,4000}aria-checked/,
  "stateful button": /StatefulButton|data-state=\{state\}/,
  "toaster (CSS spring)": /toast-motion/,
  "drawer / sheet": /drawer-motion/,
  "collapsing rows": /collapse-row/,
  "view transitions": /<ViewTransition|startViewTransition/,
  "number ticker": /NumberTicker/,
  "plaintext-bidi inputs": /unicode-bidi:plaintext|unicode-bidi: plaintext/,
  "skeleton": /skeleton|animate-shimmer/,
};
const patternsUsed = Object.entries(signatures).filter(([, re]) => re.test(text)).map(([k]) => k);

/* guardrails + live check results */
const pkg = existsSync(path.join(root, "package.json")) ? JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) : {};
const scripts = pkg.scripts || {};
const guard = {
  "bidi lint": existsSync(path.join(root, "scripts/check-logical.mjs")),
  "contrast check": existsSync(path.join(root, "scripts/contrast.mjs")),
  "npm run check": !!scripts.check,
  "CI workflow": existsSync(path.join(root, ".github/workflows")),
  "vercel.json": existsSync(path.join(root, "vercel.json")),
};
const run = (name) => {
  if (!scripts[name]) return null;
  const r = spawnSync("npm", ["run", "-s", name], { cwd: root, encoding: "utf8" });
  return { ok: r.status === 0, tail: (r.stdout + r.stderr).trim().split("\n").slice(-3).join(" / ") };
};
const results = { "lint:logical": run("lint:logical"), "check:contrast": run("check:contrast") };

/* screenshots, council */
const shots = [];
(function walk(d) { let es; try { es = readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(png|jpe?g)$/.test(e.name)) shots.push(path.relative(root, p)); } })(path.join(root, ".design"));
const decDir = path.join(root, ".council/decisions");
const decisions = existsSync(decDir) ? readdirSync(decDir).filter((f) => /^\d{4}-/.test(f)).sort().map((f) => {
  const s = readFileSync(path.join(decDir, f), "utf8");
  return { f, title: (s.match(/^#\s+(.+)$/m) || [])[1], status: ((s.match(/\*\*(?:Status|סטטוס):\*\*\s*(.+)$/m) || [])[1] || "?").trim() };
}) : [];

/* candidate patterns: project components not already in the skill */
const skillPatterns = new Set(readdirSync(path.join(here, "../patterns")).concat(readdirSync(path.join(here, "../patterns/ui"))).map((f) => f.replace(/\.tsx?$/, "")));
const compDir = ["src/components", "components"].map((d) => path.join(root, d)).find(existsSync);
const candidates = compDir ? readdirSync(compDir).filter((f) => /\.tsx$/.test(f) && !skillPatterns.has(f.replace(/\.tsx$/, ""))) : [];

/* routes → rating-page items */
const appDir = ["src/app", "app"].map((d) => path.join(root, d)).find(existsSync);
const routes = [];
(function walk(d, r) { let es; try { es = readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es) { if (e.isDirectory()) walk(path.join(d, e.name), `${r}/${e.name}`); else if (/^page\.(tsx|jsx|mdx)$/.test(e.name)) routes.push(r || "/"); } })(appDir || "", "");

const data = { root, since: since || "(all history)", commits: log.length, log: log.slice(0, 25), areas: Object.fromEntries(Object.entries(areas).map(([k, v]) => [k, v.length])), patternsUsed, guard, results, screenshots: shots.length, decisions, candidates, routes };
if (args.includes("--json")) { console.log(JSON.stringify(data, null, 2)); process.exit(0); }

const yes = (b) => (b ? "✓" : "✗");
console.log(`# Retro facts — ${path.basename(root)}

Range: ${data.since} · ${log.length} commits

## Commits
${log.slice(0, 25).map((c) => `- ${c.d} ${c.h} ${c.s}`).join("\n") || "- (none)"}

## Areas changed
${Object.entries(data.areas).map(([k, v]) => `- ${k}: ${v} files`).join("\n") || "- (none)"}

## Skill patterns in use
${patternsUsed.map((p) => `- ${p}`).join("\n") || "- none detected"}

## Guardrails
${Object.entries(guard).map(([k, v]) => `- ${yes(v)} ${k}`).join("\n")}
${Object.entries(results).filter(([, r]) => r).map(([k, r]) => `- ${r.ok ? "✓" : "✗"} npm run ${k}: ${r.tail}`).join("\n")}

## Screenshots on disk
${shots.length} in .design/

## Council decisions
${decisions.map((d) => `- ${d.f} — ${d.title} — ${d.status}`).join("\n") || "- none"}

## Candidate patterns (project components not in the skill yet)
${candidates.map((c) => `- ${c}`).join("\n") || "- none"}

## Routes (rating-page candidates)
${routes.map((r) => `- ${r}`).join("\n") || "- none"}
`);
