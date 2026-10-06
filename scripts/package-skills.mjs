#!/usr/bin/env node
// Package every skill in plugins/*/skills/* as an upload-ready zip for
// claude.ai → Settings → Capabilities → Skills. A skill uploaded there is
// available in every Claude session on the account (Claude Code on the web,
// desktop, claude.ai chat), without per-project setup.
//
// Usage: node scripts/package-skills.mjs [--out dist]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const repo = resolve(import.meta.dirname, "..");
const out = resolve(repo, outIdx >= 0 ? args[outIdx + 1] : "dist");

mkdirSync(out, { recursive: true });

const plugins = join(repo, "plugins");
for (const plugin of readdirSync(plugins)) {
  const skillsDir = join(plugins, plugin, "skills");
  if (!existsSync(skillsDir)) continue;
  const { version } = JSON.parse(readFileSync(join(plugins, plugin, ".claude-plugin", "plugin.json"), "utf8"));
  for (const skill of readdirSync(skillsDir)) {
    if (!existsSync(join(skillsDir, skill, "SKILL.md"))) continue;
    const zip = join(out, `${skill}.zip`);
    rmSync(zip, { force: true });
    // The zip holds the skill folder itself, with SKILL.md at its root.
    execFileSync("zip", ["-qr", zip, skill, "-x", "*/node_modules/*", "*.DS_Store"], { cwd: skillsDir });
    console.log(`✓ ${skill} ${version} → ${zip}`);
  }
}
