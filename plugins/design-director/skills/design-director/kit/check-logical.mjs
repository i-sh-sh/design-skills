#!/usr/bin/env node
// design-director kit — bidirectional lint.
// Fails when source files use physical (left/right) layout instead of logical
// (start/end) properties (pitfall P-001), or put dir="auto" on text inputs and
// textareas, which renders empty RTL fields left-to-right (P-003).
//
// Allow a deliberate exception by adding a comment containing `logical-ok` on the line.
// Usage: node scripts/check-logical.mjs [dir ...]   (default: src, app, components)

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOTS = process.argv.slice(2).length ? process.argv.slice(2) : ["src", "app", "components"];
const EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".css"]);

// Tailwind physical utilities (with optional variant prefixes like md: hover:)
const TW = [
  /(?<![\w-])-?(?:ml|mr|pl|pr)-(?:\d|px|auto|\[|\()/,
  /(?<![\w-])-?(?:left|right)-(?:\d|px|auto|full|\[|\(|1\/2)/,
  /(?<![\w-])text-(?:left|right)(?![\w-])/,
  /(?<![\w-])rounded-(?:l|r|tl|tr|bl|br)(?:-|(?![\w-]))/,
  /(?<![\w-])border-(?:l|r)(?:-|(?![\w-]))/,
  /(?<![\w-])(?:scroll-m|scroll-p)(?:l|r)-/,
  /(?<![\w-])float-(?:left|right)(?![\w-])/,
  /(?<![\w-])space-x-/,
];
// CSS physical properties / values
const CSS = [
  /(?:margin|padding|border)-(?:left|right)\s*:/,
  /(?<![\w-])(?:left|right)\s*:/,
  /text-align\s*:\s*(?:left|right)/,
  /float\s*:\s*(?:left|right)/,
];

// Bidi: dir="auto" on <input>/<textarea> (or the Input/Textarea components)
const BIDI = [/<(?:input|textarea|Input|Textarea)\b[^>]*\bdir=["{]?["']?auto/];

const files = [];
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!["node_modules", ".next", "dist", "build"].includes(e.name)) walk(p); }
    else if (EXT.has(path.extname(e.name))) files.push(p);
  }
}
ROOTS.filter((r) => { try { return statSync(r).isDirectory(); } catch { return false; } }).forEach(walk);

const problems = [];
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  const rules = f.endsWith(".css") ? CSS : [...TW, ...CSS, ...BIDI];
  lines.forEach((line, i) => {
    if (line.includes("logical-ok")) return;
    const code = line.replace(/\/\/.*$|\/\*.*?\*\//g, ""); // ignore comments
    for (const re of rules) {
      for (const m of code.matchAll(new RegExp(re.source, "g"))) {
        const hint = BIDI.includes(re)
          ? 'drop dir="auto" on text fields; inherit the page direction + unicode-bidi: plaintext (P-003)'
          : "use start/end (ms/me/ps/pe/start/end/text-start/rounded-s/border-s)";
        problems.push(`${f}:${i + 1}  "${m[0].trim().slice(0, 60)}"  →  ${hint}`);
      }
    }
  });
}

if (problems.length) {
  console.error(`✗ ${problems.length} bidirectional issue(s) found:\n`);
  for (const p of problems) console.error("  " + p);
  console.error("\nAdd `logical-ok` in a comment on the line for a deliberate exception.");
  process.exit(1);
}
console.log(`✓ logical properties only, no dir="auto" text fields (${files.length} files checked)`);
