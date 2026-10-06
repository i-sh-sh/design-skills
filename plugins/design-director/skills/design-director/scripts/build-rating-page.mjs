#!/usr/bin/env node
// design-director — build the retrospective rating page from an items file.
//
//   node <skill>/scripts/build-rating-page.mjs --items .design/retro/items.json --out .design/retro/rating.html \
//        [--title "ProUnit · רטרוספקטיבה"] [--lead "…"]
//
// items.json: [{ "id": "feed", "title": "…", "description": "…", "category": "מסכים",
//                "kind": "screen|pattern|direction|effect|copy", "image": ".design/retro/feed.jpg" }]
// Images are embedded as data: URIs (artifact pages can't load local files). Keep them JPEG
// (capture.mjs --format jpeg); the page warns past ~8 MB total.
// Publish the result with the Artifact tool and capabilities {"db": {}}; read ratings back
// from the "feedback" collection.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const itemsPath = opt("--items");
const out = opt("--out", ".design/retro/rating.html");
if (!itemsPath) { console.error("--items <file> is required"); process.exit(1); }

const items = JSON.parse(readFileSync(itemsPath, "utf8"));
let bytes = 0;
for (const it of items) {
  if (!it.id || !it.title) { console.error(`Each item needs id and title: ${JSON.stringify(it).slice(0, 80)}`); process.exit(1); }
  if (it.image && !it.image.startsWith("data:")) {
    const p = path.isAbsolute(it.image) ? it.image : path.resolve(process.cwd(), it.image);
    const buf = readFileSync(p);
    bytes += buf.length;
    const mime = /\.png$/i.test(p) ? "image/png" : /\.webp$/i.test(p) ? "image/webp" : "image/jpeg";
    it.image = `data:${mime};base64,${buf.toString("base64")}`;
  }
}
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const json = JSON.stringify(items).replace(/</g, "\\u003c");
const tpl = readFileSync(path.join(here, "../templates/rating-page.html"), "utf8");
const html = tpl
  .replaceAll("__TITLE__", esc(opt("--title", "רטרוספקטיבה")))
  .replace("__LEAD__", esc(opt("--lead", "סמן מה אהבת ומה לא, והוסף הערה כשמשהו כמעט נכון. כל סימון מלמד את הסקיל לקראת הפרויקט הבא.")))
  .replace("__ITEMS_JSON__", json);
mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
writeFileSync(out, html);
console.log(`Wrote ${out} — ${items.length} items, ${(bytes / 1024 / 1024).toFixed(1)} MB of images`);
if (bytes > 8 * 1024 * 1024) console.warn("⚠ Images exceed ~8 MB; use --format jpeg --quality 60 or fewer items.");
