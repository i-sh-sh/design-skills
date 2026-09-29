# Modern CSS Catalog

Platform features that replace JavaScript, hacks, or whole libraries. Each entry: what it's for, a minimal snippet, and a support tier.

**Support tiers** (as of late 2026 — support moves fast; confirm on webstatus.dev or caniuse before relying on anything below tier A):

- **A — Baseline:** all major engines. Use freely.
- **B — Chromium + Safari:** Firefox missing or partial. Use as an enhancement with a working fallback.
- **C — Chromium only / experimental:** enhancement only, behind `@supports`, never load-bearing.

## Contents
1. Layout
2. Selectors & logic
3. Color
4. Typography
5. Motion & transitions
6. Components & overlays
7. Progressive enhancement pattern

---

## 1. Layout

**Container queries (A)** — components respond to their container, not the viewport. The right default for cards, sidebars, and anything reused in different widths.
```css
.card-list { container-type: inline-size; }
@container (width > 36rem) { .card { grid-template-columns: 12rem 1fr; } }
```
Tailwind v4: `@container` on the parent, `@md:grid-cols-2` on children. Units `cqi`/`cqb` for container-relative sizing (fluid type inside a component: `font-size: clamp(1rem, 4cqi, 2rem)`).

**Subgrid (A)** — children align to the parent grid; fixes misaligned card titles/footers across a row.
```css
.cards { display: grid; grid-template-columns: repeat(3, 1fr); }
.card  { display: grid; grid-row: span 3; grid-template-rows: subgrid; }
```

**Logical properties (A)** — `margin-inline-start`, `inset-inline-end`, `padding-block`, `border-start-start-radius`. Mandatory for bidirectional UI; see `bidi.md`.

**`aspect-ratio`, `gap` in flex, `inset` (A)** — no padding hacks.

**Anchor positioning (B)** — position tooltips/popovers relative to a trigger in pure CSS, with automatic flipping.
```css
.trigger { anchor-name: --menu; }
.menu {
  position: absolute; position-anchor: --menu;
  position-area: block-end span-inline-end;   /* logical → mirrors in RTL */
  position-try-fallbacks: flip-block;
}
```
Fallback: keep Radix/Floating UI positioning; add CSS anchors as enhancement.

**Masonry / grid-lanes (C)** — native masonry is still settling (syntax changed during standardization). Use a CSS-columns or JS fallback; check status before use.

## 2. Selectors & logic

**`:has()` (A)** — parent/sibling-aware styling without JS: `form:has(:invalid) .submit { opacity: .5 }`, `.card:has(img)`, `body:has(dialog[open]) { overflow: hidden }`.

**Nesting (A)** — native CSS nesting, `&`.

**`:focus-visible`, `:is()`, `:where()`, `:not()` lists (A)** — `:where()` for zero-specificity defaults that are easy to override.

**Cascade layers `@layer` (A)** — Tailwind v4 uses them; put overrides in the right layer rather than raising specificity.

**`:dir(rtl)` (A)** — matches computed direction, including inherited. Prefer it (or `[dir=rtl] &`) over class toggles.

**`@scope` (B)** — scoped styles with a lower boundary; useful for embedded content/widgets.

**Style queries on custom properties (B)** — `@container style(--variant: compact) { … }` — theme-ish variants driven by a variable.

**Scroll-state container queries (C)** — `@container scroll-state(stuck: top)` to style a sticky header only once it's stuck; `snapped` for carousels. Enhancement only.

**`if()` / `sibling-index()` / `sibling-count()` (C)** — inline conditionals and index-based staggers (`transition-delay: calc(sibling-index() * 30ms)`). Until broader support, pass the index as `style={{ '--i': index }}`.

## 3. Color

**OKLCH / OKLab (A)**, **`color-mix()` (A)**, **relative color syntax (A)** — `oklch(from var(--primary) calc(l + .1) c h)`. The basis of the token system in `design-system.md`.

**`light-dark()` (A)** — `color: light-dark(#111, #eee)` driven by `color-scheme`. Handy for one-off values; the main theme should still use semantic tokens.

**Display P3 (B-ish, display dependent)** — OKLCH values beyond sRGB show more vivid on P3 screens. If you use them, provide an sRGB fallback via `@media (color-gamut: p3)` and check that the design still works clipped.

## 4. Typography

**`text-wrap: balance` (A)** for headings; **`text-wrap: pretty` (B)** for paragraphs (no orphans). Harmless where unsupported.

**Variable fonts + `font-variation-settings` / `font-weight` ranges (A)** — animate weight on hover for a tactile effect (showcase).

**`font-size-adjust` (A)** — normalizes x-height across fallback fonts; useful when Hebrew and Latin faces differ in apparent size.

**`text-box: trim-both cap alphabetic` (B)** — trims the extra space above caps/below baseline so type aligns optically with icons and boxes. Latin-centric; check Hebrew rendering.

**`initial-letter` (B)** — real drop caps for editorial Latin.

**`hanging-punctuation` (Safari only)** — nice-to-have.

## 5. Motion & transitions

**Individual transform properties (A)** — `translate`, `scale`, `rotate` animate independently; compose without overwriting each other.

**`@starting-style` + `transition-behavior: allow-discrete` (A)** — enter animations from `display: none`, and exit animations for `display`/`overlay` (dialogs, popovers). See `motion.md`.

**View Transitions, same-document (A)** — `document.startViewTransition()`; **cross-document** via `@view-transition { navigation: auto }` (B). View transition types and `view-transition-class` help target groups — check support for the specific sub-feature.

**Scroll-driven animations (B)** — `animation-timeline: scroll()` / `view()`, `animation-range`, named timelines, `timeline-scope`. Runs off the main thread. Fallback: static or Motion `useScroll`.
```css
.progress { transform-origin: 0 50%; animation: grow linear; animation-timeline: scroll(root); }
[dir=rtl] .progress { transform-origin: 100% 50%; }
@keyframes grow { from { scale: 0 1; } }
```

**`linear()` easing (A)** — arbitrary easing curves, including spring and bounce approximations, in pure CSS (see `--ease-spring` in `templates/motion.css`).

**`@property` (A)** — typed custom properties that *interpolate*: animate gradients, angles, counters.
```css
@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
.ring { background: conic-gradient(from var(--angle), var(--primary), transparent 40%); animation: spin 4s linear infinite; }
@keyframes spin { to { --angle: 360deg; } }
```

**`interpolate-size: allow-keywords` / `calc-size()` (C)** — animate to/from `height: auto`. Use with the grid-rows fallback from `motion.md`.

**`@media (prefers-reduced-motion)` (A)**, **`prefers-reduced-transparency` (B/C)**, **`prefers-contrast` (A)** — respect them.

## 6. Components & overlays

**Popover API (A)** — `popover` attribute + `popovertarget`: top-layer, light-dismiss, focus handling, no z-index wars. `popover="hint"` for tooltips (check support).

**`<dialog>` (A)** — modal top-layer with `::backdrop`; `closedby="any"` for light dismiss (check support).

**Invoker commands (B)** — `<button commandfor="dlg" command="show-modal">` opens dialogs/popovers declaratively.

**Customizable `<select>` (C)** — `appearance: base-select` + `::picker(select)` fully styleable native select. Enhancement over a styled native select; keep Radix Select where you need consistency today.

**`field-sizing: content` (B/C)** — auto-growing textareas and inputs without JS.

**`accent-color` (A)** — brand-colored checkboxes, radios, range, progress in one line.

**`scrollbar-gutter: stable` (A)**, **`scrollbar-color` / `scrollbar-width` (A)** — no layout jump when scrollbars appear; themed scrollbars.

**`overscroll-behavior: contain` (A)** — stops scroll chaining out of drawers and modals.

**Scroll snap (A)** — carousels without JS; works in RTL (note: `scrollLeft` is 0 at the start and negative toward the end in RTL — see `bidi.md`).

**`shape()` / `clip-path` (B)**, **`corner-shape: squircle` (C)** — organic shapes, squircles for app-icon-like surfaces (fallback: normal radius).

## 7. Progressive enhancement pattern

Build the solid baseline first, then layer:

```css
.hero-title { opacity: 1; }                         /* works everywhere */

@supports (animation-timeline: view()) {           /* enhancement */
  @media (prefers-reduced-motion: no-preference) {
    .hero-title { animation: settle linear both; animation-timeline: view(); animation-range: cover 0% cover 40%; }
  }
}
```

In JS: `if ("startViewTransition" in document) { … } else { update() }`. Never let an enhancement's absence break layout, hide content, or trap focus.
