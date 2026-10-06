#!/usr/bin/env node
// design-director kit — install the quality guardrails into a project, idempotently.
//
//   node <skill>/kit/install-kit.mjs [--root .] [--dry-run]
//
// Adds (only what's missing; never overwrites a file you changed):
//   scripts/check-logical.mjs   bidirectional lint (P-001, P-003)
//   scripts/contrast.mjs        WCAG + APCA token contrast (P-002)
//   package.json scripts        lint:logical, check:contrast, check
//   .github/workflows/ci.yml    runs `npm run check` + build on push/PR
//   vercel.json                 for Next.js apps: pins the framework preset (P-010)
//   .gitignore                  ignores .design/ (review screenshots)

import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const dry = args.includes("--dry-run");
const root = path.resolve(opt("--root", "."));
const done = [], skipped = [];

const rel = (p) => path.relative(root, p) || ".";
const write = (file, content) => {
  if (existsSync(file)) { skipped.push(`${rel(file)} (exists)`); return; }
  if (!dry) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, content); }
  done.push(rel(file));
};
const copy = (src, dest) => {
  if (existsSync(dest)) { skipped.push(`${rel(dest)} (exists — compare with ${src} if you want the newest version)`); return; }
  if (!dry) { mkdirSync(path.dirname(dest), { recursive: true }); copyFileSync(src, dest); }
  done.push(rel(dest));
};

const pkgPath = path.join(root, "package.json");
if (!existsSync(pkgPath)) { console.error(`No package.json in ${root}`); process.exit(1); }
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

// 1. scripts
copy(path.join(here, "check-logical.mjs"), path.join(root, "scripts/check-logical.mjs"));
copy(path.join(here, "../scripts/contrast.mjs"), path.join(root, "scripts/contrast.mjs"));

// 2. npm scripts — find the token CSS files
const cssCandidates = ["src/styles/brand.css", "src/app/globals.css", "app/globals.css", "src/styles/globals.css", "styles/globals.css"];
const cssFiles = cssCandidates.filter((f) => existsSync(path.join(root, f)));
const dirs = ["src", "app", "components"].filter((d) => existsSync(path.join(root, d)));
const scripts = { ...(pkg.scripts || {}) };
const add = (name, cmd) => { if (scripts[name]) skipped.push(`npm script "${name}" (exists)`); else { scripts[name] = cmd; done.push(`npm script "${name}"`); } };
add("lint:logical", `node scripts/check-logical.mjs ${dirs.join(" ")}`.trim());
if (cssFiles.length) add("check:contrast", `node scripts/contrast.mjs --css ${cssFiles.join(",")}`);
else skipped.push("check:contrast (no token CSS found — add it after creating globals.css)");
const parts = [scripts.lint && "npm run lint", "npm run lint:logical", scripts["check:contrast"] && "npm run check:contrast", scripts.typecheck && "npm run typecheck"].filter(Boolean);
add("check", parts.join(" && "));
if (!dry) writeFileSync(pkgPath, JSON.stringify({ ...pkg, scripts }, null, 2) + "\n");

// 3. CI
write(path.join(root, ".github/workflows/ci.yml"), `name: CI

on:
  push:
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run check
      - run: npm run build
`);

// 4. Vercel framework pin for Next.js
if (deps.next) write(path.join(root, "vercel.json"), JSON.stringify({ $schema: "https://openapi.vercel.sh/vercel.json", framework: "nextjs" }, null, 2) + "\n");

// 5. .gitignore
const gi = path.join(root, ".gitignore");
const giText = existsSync(gi) ? readFileSync(gi, "utf8") : "";
if (/^\/?\.design\/?$/m.test(giText)) skipped.push(".gitignore .design (exists)");
else { if (!dry) writeFileSync(gi, giText + (giText.endsWith("\n") || !giText ? "" : "\n") + "\n# design review screenshots (design-director)\n/.design\n"); done.push(".gitignore: /.design"); }

console.log(`${dry ? "[dry run] would add" : "Added"}:\n${done.map((d) => "  + " + d).join("\n") || "  (nothing)"}`);
if (skipped.length) console.log(`Skipped:\n${skipped.map((s) => "  · " + s).join("\n")}`);
console.log("\nNext: npm run check");
