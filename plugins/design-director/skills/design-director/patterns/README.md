# Patterns

Production-tested components and CSS, extracted from real projects. Each one is bidirectional (RTL/LTR), reduced-motion aware, keyboard accessible and built on the semantic tokens in `templates/globals.css`. **Use these before writing a new version** — they encode the fixes already paid for (`references/pitfalls.md`).

## Install into a project

Assumes Next.js/React + Tailwind v4 with the token layer from `templates/`.

```bash
SKILL=<skill dir>
mkdir -p src/components/ui src/lib src/styles
cp $SKILL/patterns/ui/*.tsx src/components/ui/          # base kit (shadcn/ui-style, logical props only)
cp $SKILL/patterns/utils.ts src/lib/utils.ts            # cn()
cp $SKILL/patterns/patterns.css src/styles/patterns.css # motion utilities used below
# then copy the patterns you need from the table into src/components/
npm i radix-ui class-variance-authority clsx tailwind-merge lucide-react
```

Add `@import "../styles/patterns.css";` to `globals.css` after the motion tokens. Imports assume the `@/` alias for `src/`.

## Index

| File | What | Mode | Owner weight | Needs |
|---|---|---|---|---|
| `ui/button.tsx` | Button with variants, 44px default height, press scale | both | — | `radix-ui` (Slot), cva |
| `ui/input.tsx`, `ui/textarea.tsx` | Text fields with `unicode-bidi: plaintext` (never `dir="auto"`, P-003) | both | — | — |
| `ui/badge.tsx`, `ui/card.tsx`, `ui/label.tsx` | Base kit | both | — | `radix-ui` (Label) |
| `segmented.tsx` | Segmented control / tabs with a sliding spring indicator; radio semantics; arrow keys follow reading direction | product | +2 | — |
| `stateful-button.tsx` | Submit button: idle → spinner → drawn check, fixed width | product | +2 | `ui/button` |
| `toaster.tsx` | `<Toaster>` provider + `useToast()`; CSS-spring enter, fast exit, `role="status"` | product | +2 | `toast-motion` |
| `drawer.tsx` | Drawer from the inline-end edge / bottom sheet on phones (Radix Dialog) | product | +2 | `overlay-motion`, `drawer-motion` |
| `page-transition.tsx` | Directional route transitions + card→page morph via React `<ViewTransition>` (Next 16) | product | +2 | `.nav-forward/.nav-back/.morph` CSS |
| `number-ticker.tsx` | Counts up once, tabular digits, final value at rest and under reduced motion | both | +2 | — |
| `patterns.css` | The utilities above + `collapse-row` (grid 0fr↔1fr add/remove rows) | — | +2 | motion tokens |
| `utils.ts` | `cn()` that knows the template's type scale (P-016) and `count()` for Hebrew counts (P-015) | — | — | `tailwind-merge` |
| `gesture/physics.ts` | Dependency-free gesture physics: interruptible spring, velocity tracker, momentum projection, rubber-band, Android haptic tick, `useReducedMotion()` | product | +2 | — |
| `gesture/swipe-deck.tsx` | Generic keep/skip deck: `items`, `renderCard`, `renderDone`, `labels`; momentum flick, grab-point tilt, undo, ← → and Backspace, announced verdicts | product | +2 | `physics.ts`, `ui/button`, `.deck*` CSS |
| `gesture/use-sheet-drag.ts` | Drag-to-dismiss for the bottom sheet in `drawer.tsx`: rubber-band up, momentum down, backdrop fades with the drag | product | +2 | `physics.ts`, `.sheet-grab` CSS |
| `gesture/use-tilt.ts` | Pointer-follow card tilt + light (mouse/pen); press-in on touch; writes 4 CSS variables per frame | both | +2 | `.tilt` CSS |
| `gesture/gesture.css` | Scroll-driven header settle + reading-progress thread, kinetic headline (masked, LCP-safe), cards that unfold on scroll, scroll-drawn bars, phone snap rail with depth, tilt and sheet-grab styles; all behind `@supports` and off under reduced motion | both | +3 (kinetic headline, scroll-drawn line), +2 (scroll reveals) | motion tokens |

Gesture kit: copy `gesture/*.ts` to `src/lib/` and `gesture.css` to `src/styles/`, import it after `patterns.css`. The signature is "touch carries velocity, scroll drives scroll effects": nothing runs on a timer. Every gesture keeps a button and a key path.

Card→page morph: wrap the card and the destination header in `<ViewTransition name={\`item-${id}\`} share="morph" default="none">`, and tag links with `transitionTypes={["nav-forward"]}` / `["nav-back"]`; wrap each page in `<PageTransition>`. Anchor fixed chrome with `style={{ viewTransitionName: "site-header" }}` (or `bottom-nav`).

## Adding a pattern

The retrospective proposes a new pattern when a component was **built in a project, loved by the owner (or reused twice), and has no project-specific data in it**. Generalize first: strip copy and data, keep the motion, a11y and bidi behavior, use semantic tokens only. Add a row to the index with the owner weight from `owner/taste-profile.md`.
