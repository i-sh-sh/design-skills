#!/usr/bin/env node
// design-director — contrast checker: WCAG 2 ratio + APCA Lc, with sRGB gamut warnings.
// No dependencies. Run with --help for usage.

import { readFileSync } from "node:fs";

const HELP = `
contrast.mjs — check color pairs

  Direct:     node contrast.mjs <foreground> <background>
              node contrast.mjs "oklch(0.55 0.2 260)" "#fff"

  From CSS:   node contrast.mjs --css app/globals.css --pairs "foreground/background,muted-foreground/background"
              Reads custom properties (--name: value) from light (:root, @theme) and dark (.dark,
              [data-theme=dark], prefers-color-scheme: dark) blocks, resolves var() chains, and
              checks each pair in both themes.
  --pairs     Comma-separated fg/bg token names (without --). Default: common shadcn/ui pairs.
  --large     Treat text as large (WCAG threshold 3:1, APCA Lc 60)
  --json      Machine-readable output

Colors: #rgb, #rrggbb(aa), rgb(), hsl(), oklch(), oklab(), white, black, transparent.
color-mix() and relative colors are reported as unsupported.

Thresholds (normal text): WCAG AA 4.5, AAA 7 · APCA body text Lc ≥ 75 (≥ 60 for large/bold, ≥ 45 for UI/non-text).
`;

const DEFAULT_PAIRS = [
  "foreground/background",
  "muted-foreground/background",
  "card-foreground/card",
  "popover-foreground/popover",
  "primary-foreground/primary",
  "secondary-foreground/secondary",
  "muted-foreground/muted",
  "accent-foreground/accent",
  "destructive-foreground/destructive",
  "primary/background",
  "ring/background",
];

/* ─────────── parsing ─────────── */

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const num = (s, pctScale = 1) => (String(s).trim().endsWith("%") ? (parseFloat(s) / 100) * pctScale : parseFloat(s));

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

function oklabToSrgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const eps = 0.0005;
  const outOfGamut = [r, g, bl].some((c) => c < -eps || c > 1 + eps);
  return { rgb: [r, g, bl].map((c) => clamp01(linearToSrgb(clamp01(c)))), outOfGamut };
}

function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

const NAMED = { white: [1, 1, 1], black: [0, 0, 0], transparent: [0, 0, 0] };

/** Parse a CSS color into { rgb: [0..1]x3, alpha, outOfGamut } or { error }. */
export function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  if (NAMED[s]) return { rgb: NAMED[s], alpha: s === "transparent" ? 0 : 1, outOfGamut: false };

  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(h)) return { error: `bad hex ${input}` };
    const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
    const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { rgb: v, alpha, outOfGamut: false };
  }

  const fn = s.match(/^([a-z]+)\((.*)\)$/);
  if (!fn) return { error: `unsupported color ${input}` };
  const [, name, body] = fn;
  if (/\bfrom\b|var\(|calc\(|color-mix/.test(body) || name === "color-mix") return { error: `unsupported (relative/mixed) color ${input}` };

  const [main, alphaPart] = body.split("/").map((x) => x.trim());
  const parts = main.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  const alpha = alphaPart !== undefined ? clamp01(num(alphaPart)) : parts.length === 4 ? clamp01(num(parts.pop())) : 1;

  if (name === "rgb" || name === "rgba") {
    const rgb = parts.slice(0, 3).map((p) => clamp01(p.endsWith("%") ? num(p) : parseFloat(p) / 255));
    return { rgb, alpha, outOfGamut: false };
  }
  if (name === "hsl" || name === "hsla") {
    const h = parseFloat(parts[0]);
    const sat = clamp01(num(parts[1].endsWith("%") ? parts[1] : parts[1] + "%"));
    const lig = clamp01(num(parts[2].endsWith("%") ? parts[2] : parts[2] + "%"));
    return { rgb: hslToRgb(((h % 360) + 360) % 360, sat, lig), alpha, outOfGamut: false };
  }
  if (name === "oklch") {
    const L = num(parts[0]);
    const C = num(parts[1], 0.4);
    const H = parts[2] === "none" ? 0 : parseFloat(parts[2]);
    const hr = (H * Math.PI) / 180;
    return { ...oklabToSrgb(L, C * Math.cos(hr), C * Math.sin(hr)), alpha };
  }
  if (name === "oklab") {
    return { ...oklabToSrgb(num(parts[0]), num(parts[1], 0.4), num(parts[2], 0.4)), alpha };
  }
  return { error: `unsupported color function ${name}()` };
}

/* ─────────── metrics ─────────── */

function blend(fg, bg, alpha) {
  return fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
}

export function wcagRatio(fg, bg) {
  const lum = (rgb) => {
    const [r, g, b] = rgb.map(srgbToLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

/** APCA-W3 0.0.98G-4g. Returns Lc (positive = dark text on light bg, negative = light on dark). */
export function apcaLc(fg, bg) {
  const Y = ([r, g, b]) => 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
  const clampBlack = (y) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
  const txt = clampBlack(Y(fg));
  const bgY = clampBlack(Y(bg));
  if (Math.abs(bgY - txt) < 0.0005) return 0;
  let out;
  if (bgY > txt) {
    const sapc = (bgY ** 0.56 - txt ** 0.57) * 1.14;
    out = sapc < 0.1 ? 0 : sapc - 0.027;
  } else {
    const sapc = (bgY ** 0.65 - txt ** 0.62) * 1.14;
    out = sapc > -0.1 ? 0 : sapc + 0.027;
  }
  return out * 100;
}

/* ─────────── CSS token extraction ─────────── */

function extractBlocks(css) {
  // Strip comments, then walk braces keeping the selector/at-rule stack.
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const light = {}, dark = {};
  const stack = [];
  let buf = "";
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") { stack.push(buf.trim()); buf = ""; }
    else if (ch === "}") { collect(buf); stack.pop(); buf = ""; }
    else if (ch === ";") { collect(buf); buf = ""; }
    else buf += ch;
  }
  function collect(decl) {
    const m = decl.trim().match(/^(--[\w-]+)\s*:\s*([\s\S]+)$/);
    if (!m) return;
    const ctx = stack.join(" ");
    const isDark = /\.dark\b|data-theme=["']?dark|prefers-color-scheme:\s*dark/.test(ctx);
    const isLight = !isDark && /(^|\s)(:root|html|@theme|\[data-theme=["']?light)/.test(ctx);
    const value = m[2].trim().replace(/\s+/g, " ");
    if (isDark) dark[m[1]] = value;
    else if (isLight) light[m[1]] = value;
  }
  return { light, dark };
}

function resolve(value, vars, depth = 0) {
  if (depth > 20) return value;
  return value.replace(/var\((--[\w-]+)(?:\s*,\s*([^()]*(?:\([^()]*\))*[^()]*))?\)/g, (_, name, fallback) => {
    if (vars[name] !== undefined) return resolve(vars[name], vars, depth + 1);
    return fallback !== undefined ? resolve(fallback.trim(), vars, depth + 1) : `var(${name})`;
  });
}

/* ─────────── reporting ─────────── */

function assess(fgStr, bgStr, { large }) {
  const fg = parseColor(fgStr), bg = parseColor(bgStr);
  if (fg.error || bg.error) return { error: fg.error || bg.error };
  const fgRgb = fg.alpha < 1 ? blend(fg.rgb, bg.rgb, fg.alpha) : fg.rgb;
  const ratio = wcagRatio(fgRgb, bg.rgb);
  const lc = apcaLc(fgRgb, bg.rgb);
  const wcagMin = large ? 3 : 4.5;
  const apcaMin = large ? 60 : 75;
  const warnings = [];
  if (fg.outOfGamut) warnings.push("fg outside sRGB");
  if (bg.outOfGamut) warnings.push("bg outside sRGB");
  if (bg.alpha < 1) warnings.push("bg is translucent — result depends on what's behind it");
  return {
    ratio: +ratio.toFixed(2),
    lc: +lc.toFixed(1),
    wcag: ratio >= 7 ? "AAA" : ratio >= wcagMin ? "AA" : ratio >= 3 ? "AA-large only" : "FAIL",
    apca: Math.abs(lc) >= apcaMin ? "pass" : Math.abs(lc) >= 45 ? "UI/large only" : "FAIL",
    warnings,
  };
}

function fmtRow(label, fg, bg, r) {
  if (r.error) return `  ${label.padEnd(44)} ${"—".padStart(7)}  ${r.error}`;
  const flag = r.wcag === "FAIL" || r.apca === "FAIL" ? "✗" : r.wcag.startsWith("AA-large") || r.apca !== "pass" ? "△" : "✓";
  const w = r.warnings.length ? `  ⚠ ${r.warnings.join("; ")}` : "";
  return `${flag} ${label.padEnd(44)} ${String(r.ratio).padStart(5)}:1  WCAG ${r.wcag.padEnd(13)} APCA Lc ${String(r.lc).padStart(6)} (${r.apca})${w}`;
}

function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter((a) => a.startsWith("--") && !["--css", "--pairs"].includes(a)));
  const get = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const opts = { large: flags.has("--large") };
  const asJson = flags.has("--json");

  if (flags.has("--help") || argv.length === 0) { console.log(HELP); return; }

  const cssPath = get("--css");
  const results = [];
  let failures = 0;
  let limited = 0;

  if (cssPath) {
    const { light, dark } = extractBlocks(readFileSync(cssPath, "utf8"));
    const darkVars = { ...light, ...dark };
    const pairs = (get("--pairs")?.split(",") ?? DEFAULT_PAIRS).map((p) => p.trim()).filter(Boolean);
    for (const [themeName, vars, has] of [["light", light, true], ["dark", darkVars, Object.keys(dark).length > 0]]) {
      if (!has) continue;
      if (!asJson) console.log(`\n${themeName.toUpperCase()}`);
      for (const pair of pairs) {
        const [f, b] = pair.split("/").map((s) => "--" + s.replace(/^--/, "").trim());
        if (vars[f] === undefined || vars[b] === undefined) {
          if (!asJson) console.log(`  ${pair.padEnd(44)} skipped (token not found)`);
          continue;
        }
        const fg = resolve(vars[f], vars), bg = resolve(vars[b], vars);
        const r = assess(fg, bg, opts);
        if (!r.error && (r.wcag === "FAIL" || r.apca === "FAIL")) failures++;
        else if (!r.error && (r.wcag.startsWith("AA-large") || r.apca !== "pass")) limited++;
        results.push({ theme: themeName, pair, fg, bg, ...r });
        if (!asJson) console.log(fmtRow(pair, fg, bg, r));
      }
    }
  } else {
    const positional = argv.filter((a, i) => !a.startsWith("--") && !["--css", "--pairs"].includes(argv[i - 1]));
    if (positional.length < 2) { console.log(HELP); process.exit(1); }
    const [fg, bg] = positional;
    const r = assess(fg, bg, opts);
    if (!r.error && (r.wcag === "FAIL" || r.apca === "FAIL")) failures++;
    results.push({ fg, bg, ...r });
    if (!asJson) console.log(fmtRow(`${fg} on ${bg}`, fg, bg, r));
  }

  if (asJson) console.log(JSON.stringify(results, null, 2));
  else if (failures) console.log(`\n✗ ${failures} failing pair(s).`);
  else if (limited) console.log(`\nNo failures. △ ${limited} pair(s) are fine for large text / UI elements only — not for body text.`);
  else console.log("\nAll checked pairs pass for body text.");
  process.exitCode = failures ? 2 : 0;
}

main();
