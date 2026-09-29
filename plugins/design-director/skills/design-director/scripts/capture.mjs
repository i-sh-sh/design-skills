#!/usr/bin/env node
// design-director — screenshot matrix, motion filmstrips and scroll-throughs via Playwright.
// Resolves Playwright from the current project first, then from the global npm install.
// Run with --help for usage.

import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const HELP = `
capture.mjs — screenshots for visual review

  --url <url>               Page to capture (required)
  --out <dir>               Output directory (default: .design/shots)
  --widths <list>           Viewport widths, e.g. 390,768,1440 (default: 390,1440)
  --height <px>             Viewport height (default: 900)
  --themes <list>           light,dark (default: light)
  --theme-strategy <s>      How to apply dark: media | class | attr | all (default: all)
                              media: emulate prefers-color-scheme
                              class: toggle .dark on <html>
                              attr:  set data-theme on <html>
  --dirs <list>             ltr,rtl (default: page's own direction only)
  --rtl-url <url>           Real RTL route (e.g. http://localhost:3000/he); used for rtl instead of flipping dir
  --ltr-url <url>           Real LTR route, if --url is the RTL one
  --full                    Full-page screenshots
  --reduced-motion          Emulate prefers-reduced-motion: reduce
  --wait <ms>               Extra settle time after load (default: 600)
  --wait-for <selector>     Wait for this selector before capturing
  --selector <selector>     Screenshot only this element

  Motion review:
  --filmstrip <n>           Capture n frames instead of one still
  --interval <ms>           Time between frames (default: 80)
  --click <selector>        Start the filmstrip by clicking this element
  --hover <selector>        Start the filmstrip by hovering this element
  --scroll-steps <n>        Capture n frames at evenly spaced scroll positions

Examples:
  node capture.mjs --url http://localhost:3000 --widths 390,1440 --themes light,dark --dirs ltr,rtl --full
  node capture.mjs --url http://localhost:3000 --filmstrip 8 --interval 60 --click "[data-open-menu]"
  node capture.mjs --url http://localhost:3000 --scroll-steps 6
`;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

const list = (v, d) => (typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : d);

async function loadPlaywright() {
  const candidates = [];
  const localRequire = createRequire(path.join(process.cwd(), "package.json"));
  for (const name of ["playwright", "playwright-core", "@playwright/test"]) {
    try { candidates.push(localRequire.resolve(name)); } catch {}
  }
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const globalRequire = createRequire(path.join(globalRoot, "noop.js"));
    for (const name of ["playwright", "playwright-core", "@playwright/test"]) {
      try { candidates.push(globalRequire.resolve(name)); } catch {}
    }
  } catch {}
  for (const c of candidates) {
    try {
      const mod = await import(pathToFileURL(c).href);
      const chromium = mod.chromium ?? mod.default?.chromium;
      if (chromium) return chromium;
    } catch {}
  }
  console.error("Playwright not found. Install it in the project (npm i -D playwright) or globally.");
  process.exit(1);
}

function chromiumExecutable() {
  // Used only if Playwright's own browser lookup fails (e.g. version mismatch).
  const known = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium"].filter(Boolean);
  return known.find((p) => existsSync(p));
}

async function applyVariant(page, { theme, strategy, dir, forceDir }) {
  await page.evaluate(({ theme, strategy, dir, forceDir }) => {
    const html = document.documentElement;
    if (strategy === "class" || strategy === "all") html.classList.toggle("dark", theme === "dark");
    if (strategy === "attr" || strategy === "all") html.setAttribute("data-theme", theme);
    html.style.colorScheme = theme;
    if (forceDir) html.setAttribute("dir", dir);
  }, { theme, strategy, dir, forceDir });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.url) { console.log(HELP); process.exit(args.help ? 0 : 1); }

  const chromium = await loadPlaywright();
  const out = path.resolve(args.out || ".design/shots");
  mkdirSync(out, { recursive: true });

  const widths = list(args.widths, ["390", "1440"]).map(Number);
  const height = Number(args.height || 900);
  const themes = list(args.themes, ["light"]);
  const strategy = args["theme-strategy"] || "all";
  const dirs = list(args.dirs, [null]);
  const wait = Number(args.wait ?? 600);
  const frames = Number(args.filmstrip || 0);
  const interval = Number(args.interval || 80);
  const scrollSteps = Number(args["scroll-steps"] || 0);

  let browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    const exe = chromiumExecutable();
    if (!exe) throw e;
    browser = await chromium.launch({ executablePath: exe });
  }

  const written = [];
  const errors = [];

  for (const width of widths) {
    for (const theme of themes) {
      for (const dir of dirs) {
        let url = args.url;
        let forceDir = false;
        if (dir === "rtl" && args["rtl-url"]) url = args["rtl-url"];
        else if (dir === "ltr" && args["ltr-url"]) url = args["ltr-url"];
        else if (dir) forceDir = true;

        const context = await browser.newContext({
          viewport: { width, height },
          deviceScaleFactor: width < 600 ? 2 : 1,
          colorScheme: strategy === "class" || strategy === "attr" ? "light" : theme,
          reducedMotion: args["reduced-motion"] ? "reduce" : "no-preference",
          hasTouch: width < 600,
          isMobile: width < 600,
        });
        const page = await context.newPage();
        page.on("pageerror", (err) => errors.push(`[${width} ${theme} ${dir ?? ""}] ${err.message}`));

        const tag = [width, theme, dir, args["reduced-motion"] ? "reduced" : null].filter(Boolean).join("-");
        const shotOpts = { fullPage: !!args.full && !frames && !scrollSteps, animations: frames ? "allow" : "disabled" };
        const target = () => (args.selector ? page.locator(args.selector).first() : page);

        try {
          // Apply theme/dir before first paint so scripts and animations see the final state.
          await page.addInitScript(({ theme, strategy, dir, forceDir }) => {
            const set = () => {
              const html = document.documentElement;
              if (!html) return;
              if (strategy === "class" || strategy === "all") html.classList.toggle("dark", theme === "dark");
              if (strategy === "attr" || strategy === "all") html.setAttribute("data-theme", theme);
              if (forceDir) html.setAttribute("dir", dir);
            };
            try { localStorage.setItem("theme", theme); } catch {}
            document.addEventListener("DOMContentLoaded", set);
            set();
          }, { theme, strategy, dir, forceDir });

          if (frames && !args.click && !args.hover) {
            // Filmstrip of the initial load: start capturing as soon as the DOM exists.
            await page.goto(url, { waitUntil: "commit" });
            await page.waitForLoadState("domcontentloaded");
            for (let f = 0; f < frames; f++) {
              const file = path.join(out, `${tag}-load-${String(f).padStart(2, "0")}.png`);
              await target().screenshot({ path: file, animations: "allow" });
              written.push(file);
              await sleep(interval);
            }
          } else {
            await page.goto(url, { waitUntil: "networkidle" }).catch(() => page.goto(url, { waitUntil: "load" }));
            if (args["wait-for"]) await page.waitForSelector(args["wait-for"], { timeout: 15000 });
            await applyVariant(page, { theme, strategy, dir, forceDir });
            await page.evaluate(() => document.fonts?.ready);
            await sleep(wait);

            if (frames) {
              const trigger = page.locator(args.click || args.hover).first();
              if (args.click) await trigger.click();
              else await trigger.hover();
              for (let f = 0; f < frames; f++) {
                const file = path.join(out, `${tag}-${args.click ? "click" : "hover"}-${String(f).padStart(2, "0")}.png`);
                await target().screenshot({ path: file, animations: "allow" });
                written.push(file);
                await sleep(interval);
              }
            } else if (scrollSteps) {
              const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
              for (let s = 0; s < scrollSteps; s++) {
                const y = Math.round((max * s) / Math.max(1, scrollSteps - 1));
                await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
                await sleep(Math.max(250, interval));
                const file = path.join(out, `${tag}-scroll-${String(s).padStart(2, "0")}.png`);
                await page.screenshot({ path: file, animations: "allow" });
                written.push(file);
              }
            } else {
              const file = path.join(out, `${tag}.png`);
              await target().screenshot({ path: file, ...shotOpts });
              written.push(file);
            }
          }
        } catch (e) {
          errors.push(`[${tag}] ${e.message.split("\n")[0]}`);
        }
        await context.close();
      }
    }
  }

  await browser.close();
  console.log(`Wrote ${written.length} screenshot(s) to ${out}`);
  for (const f of written) console.log("  " + path.relative(process.cwd(), f));
  if (errors.length) {
    console.log(`\n${errors.length} issue(s):`);
    for (const e of errors) console.log("  " + e);
  }
  if (!written.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
