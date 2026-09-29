# Design System Foundations

Tokens first, components second. A redesign without a token layer is a repaint that decays within a month.

## Contents
1. Token architecture
2. Color in OKLCH
3. Dark mode
4. Typography
5. Space, size, radius
6. Elevation & borders
7. Focus & states
8. Tailwind v4 wiring
9. Components (shadcn/ui and friends)
10. Tailwind v3 projects

---

## 1. Token architecture

Three layers. Components only ever reference the semantic layer.

```
primitive   --blue-500: oklch(0.56 0.19 262)           raw palette, never used directly in components
semantic    --primary: var(--blue-500)                   role-based, switches per theme
component   --button-radius: var(--radius-md)            only when a component needs its own knob
```

Semantic color roles to define (names match shadcn/ui so its components work unchanged):

`background, foreground, card, card-foreground, popover, popover-foreground, primary, primary-foreground, secondary, secondary-foreground, muted, muted-foreground, accent, accent-foreground, destructive, destructive-foreground, success, warning, border, input, ring`

Add `surface-1…3` (layered surfaces) when the design has more than two depth levels.

## 2. Color in OKLCH

Why OKLCH: equal steps in `L` look like equal steps in lightness across hues, so a palette built on it is predictable, and contrast is easier to control. Tailwind v4's default palette is OKLCH.

Building a ramp for one hue:

- Keep **hue** nearly fixed (allow ±5–10° drift: yellows shift toward orange as they darken, blues toward violet look richer).
- Step **lightness** evenly: e.g. 0.98, 0.95, 0.90, 0.82, 0.72, 0.62, 0.54, 0.46, 0.38, 0.30, 0.22.
- **Chroma** peaks in the middle of the ramp and falls off at both ends — very light and very dark colors can't hold much chroma inside sRGB.
- Check gamut: `scripts/contrast.mjs` warns when an OKLCH color falls outside sRGB. Out-of-gamut values render clipped and differ between browsers/displays.

Neutrals: never pure gray. Give them a trace of the brand hue (chroma 0.005–0.015) — warm or cool is a brand decision.

Accent discipline: the primary accent is a signal. Budget it (e.g. ≤ 10% of a screen). If everything is accented, nothing is.

Deriving variants from tokens (Baseline, use freely):

```css
--primary-hover: oklch(from var(--primary) calc(l - 0.05) c h);
--primary-soft:  color-mix(in oklch, var(--primary) 12%, var(--background));
```

Contrast targets: body text ≥ 4.5:1 (WCAG) and roughly APCA Lc ≥ 75; large text/UI components ≥ 3:1 (Lc ≥ 60 for large text, ≥ 45 for non-text). Check both themes.

## 3. Dark mode

Design it; don't invert it.

- Background: a very dark, slightly tinted neutral (`oklch(0.16 0.01 h)`), not `#000` — pure black makes white text vibrate and kills depth.
- Depth comes from **lighter** surfaces as they rise (surface-1 → 3 each ~+0.03–0.05 L), plus subtle borders. Shadows barely read on dark backgrounds.
- Reduce accent chroma slightly and raise its lightness so it doesn't glow harshly.
- Text: off-white (`oklch(0.96 0.005 h)`) for body, lower L for secondary. Avoid pure white large areas.
- Images/illustrations: consider a dimmed or alternate version; logos need a dark variant.
- Support system preference *and* a manual toggle. Class strategy (`.dark` on `<html>`) with `next-themes` is the standard in Next.js; set `color-scheme` so form controls and scrollbars follow.

## 4. Typography

**Pairing** — one display face with character, one text face that disappears into reading, optionally a mono. For Hebrew + Latin, pick per-script faces that share skeleton and weight range; see `bidi.md` for pairings and the font-stack technique.

**Scale** — choose a ratio by mode: product 1.125–1.2 (dense, many levels close together), showcase 1.25–1.414 (drama). Make display sizes fluid:

```css
/* 44px at 360px viewport → 96px at 1440px */
--text-display: clamp(2.75rem, 1.66rem + 4.81vw, 6rem);
```

Formula: `clamp(min, intercept + slope·vw, max)` where `slope = (max − min) / (maxVw − minVw) · 100` and `intercept = min − slope·minVw/100`. Keep body text fixed or nearly fixed (16–18px) — fluid body text hurts zoom.

**Rules that separate considered from default:**

- Line-height falls as size rises: body 1.5–1.65, headings 1.05–1.2, display 0.95–1.05 (Hebrew needs ~0.05–0.1 more; see `bidi.md`).
- Tight tracking on large Latin display (−0.02 to −0.04em); loose tracking only on small uppercase Latin labels. Hebrew: tracking 0.
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Measure: 45–75 characters for Latin body, slightly narrower for Hebrew.
- Tabular numbers (`font-variant-numeric: tabular-nums`) in tables, prices, counters, timers.
- Limit weights: 2–3 per family. Use variable fonts when available.
- Load with `next/font` (self-hosted, no layout shift), subsets for every script used, and expose each as a CSS variable.

## 5. Space, size, radius

- **Spacing** on a 4px base. Tailwind v4 derives all spacing utilities from `--spacing: 0.25rem`, so `p-4` = 16px, `p-4.5` = 18px — any multiple works without config.
- Use space to express relationships: related items 4–8px apart, groups 16–24px, sections 64–160px (showcase) or 24–48px (product).
- **Density**: product UIs may need a compact mode; drive it with a variable (`--density: 1` → `0.85`) multiplied into control heights and paddings rather than duplicating components.
- **Control heights**: pick a scale and use it for buttons, inputs, selects together: 32 / 36 / 40 / 48px.
- **Radius**: a small scale (`--radius-sm/md/lg/xl`) derived from one `--radius` knob. **Nested radius rule:** inner radius = outer radius − padding (never larger than outer), or nested corners look bloated.

## 6. Elevation & borders

- Decide early: **borders or shadows** as the primary separator. Mixing both heavily looks indecisive.
- Shadows: layered (a tight dark contact shadow + a wide soft ambient one), tinted with the neutral hue, not black:

```css
--shadow-md:
  0 1px 2px oklch(0.2 0.02 260 / 0.06),
  0 4px 12px -2px oklch(0.2 0.02 260 / 0.08);
```

- Elevation should mean something: base content < sticky header < dropdown/popover < dialog < toast. Map a z-index scale to it.
- Hairlines: `1px` with a low-contrast border token; on high-DPI, `0.5px` borders look refined on dark UIs (test at 1x too).

## 7. Focus & states

- Focus ring: 2px ring + 2px offset in `--ring`, using `:focus-visible` only (no ring on mouse click). Must reach 3:1 against adjacent colors.
- State layers: hover/pressed as a translucent overlay of foreground (`color-mix(in oklch, currentColor 8%, transparent)`), so one rule works on any surface color.
- Pressed feedback: slight scale (0.97–0.98) or a darker state layer; ≤ 100ms.
- Disabled: reduce contrast and remove pointer events, but keep the label readable; explain *why* disabled when it isn't obvious (tooltip or helper text).

## 8. Tailwind v4 wiring

`templates/globals.css` contains a complete, working starting point. The key mechanics:

- `@import "tailwindcss";` then `@custom-variant dark (&:where(.dark, .dark *));` for class-based dark mode.
- Semantic values live as plain CSS variables in `:root` and `.dark`, and are exposed to Tailwind via `@theme inline { --color-primary: var(--primary); }` — `inline` makes the utility reference the variable itself, so theme switching and nested overrides work.
- Theme namespaces generate utilities: `--color-*` → `bg-*/text-*/border-*`, `--font-*` → `font-*`, `--text-*` (with `--text-*--line-height`, `--text-*--letter-spacing`) → `text-*`, `--radius-*` → `rounded-*`, `--shadow-*` → `shadow-*`, `--ease-*` → `ease-*`, `--animate-*` → `animate-*`, `--breakpoint-*` → responsive variants.
- Arbitrary variable shorthand: `duration-(--duration-fast)`, `bg-(--brand-soft)`.
- Custom utilities with `@utility name { ... }`; custom variants with `@custom-variant`.
- Built-in variants worth knowing: `starting:` (@starting-style), `rtl:`/`ltr:`, `motion-safe:`/`motion-reduce:`, `@container` + `@sm:` container queries, `has-[...]:`, `group-has-*`, `not-*`, `inert:`, `open:`, `pointer-fine:`/`pointer-coarse:`.

## 9. Components

shadcn/ui (Radix or Base UI primitives) gives accessible behavior; the default styling is a *starting point* and is instantly recognizable. Make it yours:

- Re-tune tokens first (radius, borders, neutrals, ring) — most of the change comes for free.
- Adjust `cva` variants in the copied components: sizes to your control-height scale, add brand variants, remove variants you won't use.
- Replace the default focus, hover and pressed treatments with the system's.
- Keep the primitives' accessibility (roles, keyboard handling, focus management) intact.
- Radix provides `DirectionProvider`; wrap the app with the current `dir` so menus, sliders and tabs behave correctly in RTL.

Component checklist before calling one done: all states (section 7), both themes, both directions, 390px width, keyboard-only use, reduced motion.

## 10. Tailwind v3 projects

Same token design; different wiring: CSS variables in `:root`/`.dark` holding color channels or full values, mapped in `tailwind.config` `theme.extend.colors` (`primary: 'oklch(var(--primary) / <alpha-value>)'` pattern, or full `var(--primary)` if alpha modifiers aren't needed). v3 has `rtl:`/`ltr:` variants and, from 3.3, logical utilities (`ms-*`, `ps-*`, `start-*`). Offer the v4 upgrade (`npx @tailwindcss/upgrade`) as a separate, explicit step — not as a side effect of a redesign.
