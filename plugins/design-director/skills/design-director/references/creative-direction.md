# Creative Direction

How to go from "make it look good" to a point of view — and avoid the generic look.

## Contents
1. Extract the brief
2. The generic look (what to avoid, and what to do instead)
3. Building a direction
4. Direction archetypes
5. Presenting directions
6. The signature element

---

## 1. Extract the brief

Get these, from the user or by inference from the product (say what you inferred):

- **Audience** — who, in what context (a CFO at a desk vs. a courier on a phone).
- **Three adjectives** the brand should evoke, and one it must *not* (e.g. "precise, calm, confident — not playful").
- **The feeling after 5 seconds** on the landing page.
- **Competitors / references** — what to learn from and what to differ from.
- **Constraints** — existing logo/colors, accessibility needs, performance budget, languages (Hebrew + English implies fonts for both scripts from day one).

If the user doesn't know, propose answers. A direction built on a guessed brief beats one built on no brief.

## 2. The generic look

These patterns signal "default output". Each is fine when *chosen*; the problem is reaching for them automatically.

| Default | Why it's generic | Try instead |
|---|---|---|
| Purple→blue gradient hero | The single most common AI/SaaS look | A palette derived from the brief; one saturated accent on a quiet neutral; duotone photography; a texture (grain, halftone, paper) |
| Inter/system font for everything | Invisible, no voice | A display face with character + a workhorse text face; see pairings in `bidi.md` |
| Centered hero, headline + subline + 2 buttons | Template layout | Asymmetric grid, oversized type bleeding off the edge, headline set against product UI, editorial columns |
| 3 feature cards, icon in a circle | Zero information density | Bento with real product fragments, a single annotated screenshot, a numbered narrative, a comparison table |
| `rounded-2xl` + soft shadow on every card | No shape language | Decide: sharp (0–4px, precise), soft (12–20px, friendly), or mixed with a rule (containers sharp, controls pill) |
| Fade-up on every element on scroll | Motion as wallpaper | Motion only where it explains: reveal a sequence, connect two states, reward an action |
| Glassmorphism everywhere | Hurts contrast, dated when overused | Solid layered surfaces; reserve blur for overlays that float over content |
| Emoji or mixed icon sets | Inconsistent voice | One icon family (Lucide, Phosphor, Tabler), one stroke width, sized to the type |
| Stock blob/sparkle decoration | Decoration without meaning | A graphic motif derived from the product itself (its data, its grid, its shape) |

## 3. Building a direction

A direction is a set of **coordinated decisions**, each traceable to the brief:

| Axis | Decide |
|---|---|
| **Concept** | One sentence. "A precision instrument." "A friendly neighborhood shop." "A late-night broadcast." |
| **Typography** | Display face + text face (+ mono if technical), for **both** Latin and Hebrew. Scale ratio. Tracking and case rules. |
| **Color** | Neutral family (warm/cool/true), one primary accent, optional secondary; how much accent per screen (e.g. ≤ 10%); dark-mode character. OKLCH values. |
| **Shape** | Radius rule, border vs. shadow, line weight, icon style. |
| **Layout** | Grid (12-col editorial, strict modular, asymmetric), density, whitespace attitude, how imagery sits (bleed, framed, cut-out). |
| **Imagery** | Photography style, illustration, 3D, product UI as imagery, data as imagery. |
| **Motion signature** | Curve personality (crisp/soft/springy), distance (small/large), choreography (sequential/simultaneous), one hero motion. |
| **Signature element** | The one memorable idea (section 6). |

## 4. Direction archetypes

Starting points, not templates. Mix and adapt; always push one axis further than feels safe.

**Swiss Precision** — strict grid, big neo-grotesk type, generous whitespace, one hard accent (signal red, cobalt), sharp corners, hairline rules. Motion: crisp, short, linear-ish ease-out, things slide along grid lines. *Good for:* fintech, B2B tools, data products.

**Editorial** — serif display + humanist sans, magazine columns, pull quotes, drop caps (Latin) / oversized first word (Hebrew), warm off-white paper, ink black. Motion: slow reveals, text-led, page-turn view transitions. *Good for:* content, luxury, consultancies, publications.

**Technical Instrument** — dark UI, mono accents, dense but calm, thin borders instead of shadows, subtle grid/dot background, glow used sparingly as signal. Motion: fast, precise, spring with zero bounce, number tickers, command-palette energy. *Good for:* dev tools, AI products, analytics.

**Soft Tactile** — warm neutrals, large radii, gentle inner/outer shadows, rounded humanist type, pastel accents with one deeper tone, grain texture. Motion: soft springs with slight bounce, press-to-squish. *Good for:* consumer apps, health, education.

**Neo-Brutalist** — raw grid, heavy borders, flat saturated blocks, hard offset shadows, oversized type, visible structure. Motion: snappy, no easing subtlety, hard cuts, playful hover displacements. *Good for:* creative tools, youth brands, events.

**Cinematic Dark** — near-black with depth (not #000), dramatic type scale, full-bleed media, light as material (gradients that behave like light, not like paint), 3D or video hero. Motion: long scroll-driven sequences, parallax depth, pinned storytelling. *Good for:* launches, hardware, premium products.

**Playful Systematic** — bold color system with 4–6 hues assigned to meanings, geometric shapes as a motif, chunky type, stickers/badges. Motion: bouncy springs, stagger, confetti-level rewards on key moments only. *Good for:* community, gaming-adjacent, kids/family, marketplaces.

## 5. Presenting directions

For each direction, give the user a compact card:

```markdown
### A — "Precision Instrument"
**Concept:** the product as a finely machined tool — calm, exact, fast.
**Type:** Geist (Latin) + IBM Plex Sans Hebrew · display 600, tight tracking (Latin only) · ratio 1.25
**Color:** cool neutrals oklch(0.98 0.005 250) → oklch(0.16 0.01 250); accent cobalt oklch(0.56 0.19 262); accent ≤ 8% of any screen
**Shape:** 6px radius, 1px borders, no shadows except overlays
**Motion:** springs with zero bounce, 150–220ms; layout transitions connect every state change
**Signature:** a live "instrument panel" hero built from real product components, numbers ticking to real values
```

Better than prose: if you can run code, build a single specimen page (type scale, palette swatches, a button, a card, a hero fragment — once per direction, side by side), capture it, and show the screenshot. Three directions should be *visibly different at a glance*; if two look alike, replace one.

When the user picks, restate the chosen direction as the project's design principles (3–5 bullets) and keep them in a file the project can reference (e.g. `DESIGN.md` at the repo root) so future sessions stay consistent.

## 6. The signature element

One idea per product that makes it recognizable. It should come *from the product*, not be pasted on:

- A data product whose hero is its own live chart, rendered in the brand's line style.
- A scheduling app whose section dividers are timeline ticks.
- A Hebrew-first brand whose display type uses a distinctive Hebrew typeface at huge size, with Latin as the secondary voice.
- A dev tool whose page transitions behave like a terminal cursor.
- A marketplace whose cards "stack" like physical tickets.

Carry it through: the signature appears in the hero, echoes in one or two product details (an empty state, a loading indicator, a success moment) and nowhere else. Repetition beyond that turns it into wallpaper.
