# Motion System

Motion is part of the interface's meaning: it shows where things come from, what changed, and what caused it. Decoration is the last reason to animate, not the first.

## Contents
1. Principles
2. Motion tokens
3. Product vs. showcase choreography
4. Choosing the tool
5. Patterns (with code)
6. Reduced motion
7. Reviewing motion

---

## 1. Principles

1. **Every motion has a cause.** A user action, a state change, or a scroll position. Nothing moves "because it's nice".
2. **Motion shows origin and destination.** Menus grow from their trigger, dialogs from the button that opened them, deleted items collapse the space they left.
3. **Fast in, faster out.** Entrances ~200–300ms; exits ~70% of that. Users wait for entrances, never for exits.
4. **Interruptible.** A user who clicks again mid-animation should get an immediate response. Springs and CSS transitions retarget naturally; keyframe animations and chained timeouts don't.
5. **Small distances.** In product UI, 4–16px of travel. Large travel reads as slow even at short durations.
6. **One thing leads.** In a group, the primary element moves first or most; secondary elements follow with small staggers (20–40ms, total ≤ 300ms in product).
7. **Consistency is the signature.** Same curves and durations everywhere make the whole product feel like one object.

## 2. Motion tokens

Defined in `templates/motion.css` (CSS) and `templates/motion.ts` (Motion for React). Keep them in sync.

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 100ms | Press feedback, color/opacity state changes |
| `--duration-fast` | 150ms | Hovers, small toggles, tooltips, exits |
| `--duration-base` | 220ms | Menus, popovers, tabs, most UI transitions |
| `--duration-slow` | 320ms | Dialogs, drawers, larger layout changes |
| `--duration-deliberate` | 500ms | Page transitions, showcase reveals |
| `--duration-cinematic` | 900ms | Showcase only: hero sequences |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default for moving between two on-screen states |
| `--ease-enter` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Elements arriving (strong deceleration) |
| `--ease-exit` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Elements leaving (accelerate away) |
| `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Showcase reveals, dramatic but settled |
| `--ease-spring` | `linear(...)` spring approximation | CSS springs without JS |
| `--motion-distance` | `1` (→ `0` for reduced motion) | Multiplier for every translation |
| `--dir-sign` | `1` LTR, `-1` RTL | Multiplier for horizontal direction |

Springs (Motion for React), described by perceived duration and bounce:

| Preset | `visualDuration` | `bounce` | Use |
|---|---|---|---|
| `snappy` | 0.25 | 0 | Product default: menus, tabs, toggles, layout |
| `smooth` | 0.4 | 0.1 | Larger surfaces, drawers, cards expanding |
| `bouncy` | 0.5 | 0.3 | Playful brands, success moments, showcase only |

Avoid `ease-in-out` for UI entrances (slow start feels laggy) and `linear` for anything except continuous loops, progress, and scroll-linked motion.

## 3. Product vs. showcase choreography

**Product mode**
- Motion budget: state changes, layout continuity, feedback. No scroll-triggered reveals of app content — users have seen it before and need it now.
- No entrance animation on the page's primary content at load. Subtle fade (≤ 150ms) at most.
- Layout animations (items reordering, panels resizing, a tab indicator sliding) are the highest-value motion in product UI: they preserve the user's mental map.
- Toasts, dialogs, popovers: spring in from their origin, fade out fast.
- Optimistic UI + a brief confirmation beats a spinner.

**Showcase mode**
- Choreograph sections like scenes: an establishing move, then the details.
- Scroll-linked motion that *advances a story* (a product assembling, a timeline filling, a before/after scrub) rather than fading every block.
- Kinetic typography for the hero headline or one key statement — not every heading.
- One signature motion moment per page; 1–2 supporting effects; everything else static or subtle.
- Keep hero text visible at first paint (animate transform/secondary elements) — see `a11y-performance.md` on LCP.

## 4. Choosing the tool

Use the lightest tool that can do the job well. Mixing is fine; one per concern.

| Need | Tool |
|---|---|
| Hover/press/focus, color, simple enter via `@starting-style`, popover/dialog open/close | **CSS transitions** |
| Scroll-progress bars, reveal-on-view, parallax, scrubbed effects | **CSS scroll-driven animations** (`animation-timeline`), fallback to Motion `useScroll`/`whileInView` |
| Page/route transitions, shared-element morphs between views | **View Transitions API** (same-document and cross-document); React `<ViewTransition>` where available |
| Mount/unmount animation in React, layout animations, shared `layoutId`, gestures (drag, hover, tap), springs | **Motion for React** (`motion` package, `motion/react`) |
| Complex timelines, pinned scroll storytelling, SVG morphing, text splitting, heavy choreography | **GSAP** (+ ScrollTrigger, SplitText, MorphSVG, Flip — all free since 3.13) with `@gsap/react` `useGSAP` |
| Smooth scrolling that stays in sync with scroll-driven effects | **Lenis** (`lenis/react`) — showcase only; never on product/app routes |
| Interactive vector illustrations with state machines | **Rive** (`@rive-app/react-canvas`); **Lottie** (`lottie-react`/dotLottie) for simple playback |
| 3D, shaders, particles | **React Three Fiber + drei**; see `creative-tech.md` |

Bundle notes: prefer `LazyMotion` + `m` components with `domAnimation` for product bundles; import GSAP plugins only on the routes that use them; dynamically import 3D.

## 5. Patterns

### Dialog / popover enter–exit with pure CSS

```css
.dialog {
  transition:
    opacity var(--duration-base) var(--ease-enter),
    translate var(--duration-base) var(--ease-enter),
    scale var(--duration-base) var(--ease-enter),
    display var(--duration-base) allow-discrete,
    overlay var(--duration-base) allow-discrete;
  opacity: 1; translate: 0 0; scale: 1;

  @starting-style { opacity: 0; translate: 0 calc(8px * var(--motion-distance)); scale: 0.98; }
}
.dialog:not([open]) {
  opacity: 0; scale: 0.98;
  transition-duration: var(--duration-fast);
  transition-timing-function: var(--ease-exit);
}
```

Works with `<dialog>` and `[popover]`; with Tailwind: `starting:opacity-0 starting:scale-98`.

### Height auto (accordion, disclosure)

```css
/* Chromium: animate to/from auto directly */
:root { interpolate-size: allow-keywords; }
.panel { height: 0; overflow: clip; transition: height var(--duration-base) var(--ease-standard); }
.panel[data-open] { height: auto; }

/* Cross-browser fallback: grid rows */
.panel-grid { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--duration-base) var(--ease-standard); }
.panel-grid[data-open] { grid-template-rows: 1fr; }
.panel-grid > * { overflow: hidden; }
```

### Press feedback

```tsx
<motion.button whileTap={{ scale: 0.97 }} transition={spring.snappy} />
```

CSS equivalent: `active:scale-[0.97] transition-transform duration-(--duration-instant)`.

### Shared indicator (tabs, segmented control, nav)

```tsx
{tabs.map(t => (
  <button key={t.id} onClick={() => setActive(t.id)} className="relative px-3 py-1.5">
    {active === t.id && (
      <motion.span layoutId="tab-indicator" transition={spring.snappy}
        className="absolute inset-0 rounded-md bg-muted" />
    )}
    <span className="relative">{t.label}</span>
  </button>
))}
```

Direction-safe automatically: the indicator moves to wherever the next tab is laid out.

### Lists: add, remove, reorder

```tsx
<AnimatePresence initial={false} mode="popLayout">
  {items.map(item => (
    <motion.li key={item.id} layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1, transition: spring.snappy }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: duration.fast, ease: ease.exit } }} />
  ))}
</AnimatePresence>
```

### Direction-aware slide (drawer, carousel, step wizard)

```tsx
const sign = useDirSign(); // 1 in LTR, -1 in RTL — from templates/motion.ts
<motion.aside initial={{ x: `${100 * sign}%` }} animate={{ x: 0 }} exit={{ x: `${100 * sign}%` }} transition={spring.smooth} />
```

(For a drawer anchored to the *end* edge. Anchored to the start edge, negate.) In CSS: `translate: calc(100% * var(--dir-sign)) 0`.

### Scroll reveal (showcase), CSS-first

```css
@supports (animation-timeline: view()) {
  .reveal {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
  }
}
@keyframes reveal {
  from { opacity: 0; translate: 0 calc(24px * var(--motion-distance)); }
}
```

Without support, elements simply show (progressive enhancement). If the reveal is essential to the design, fall back to Motion `whileInView={{ opacity: 1, y: 0 }}` with `viewport={{ once: true, amount: 0.4 }}`.

### Page transitions (View Transitions)

Multi-page / cross-document (plain navigations): `@view-transition { navigation: auto; }` in CSS (`templates/motion.css`).

Same-document (SPA / Next App Router): wrap the state change in `document.startViewTransition(() => ...)`. In React, prefer the `<ViewTransition>` component when the installed React/Next version supports it (Next: `experimental.viewTransition`), otherwise a small wrapper around `startViewTransition` for router navigations. Verify against current docs — this API surface is moving.

Shared element morph: give the same `view-transition-name` to the thumbnail and the detail hero (`view-transition-name: product-42`), unique per page. Customize with `::view-transition-group(product-42) { animation-duration: var(--duration-slow); animation-timing-function: var(--ease-standard); }`.

### Pinned scroll story (showcase, GSAP)

```tsx
"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Story() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=200%", scrub: true, pin: true } })
        .from(".step-1", { opacity: 0, y: 40 })
        .from(".step-2", { opacity: 0, y: 40 })
        .to(".visual", { scale: 1.1, ease: "none" }, 0);
    });
  }, { scope: root });
  return <section ref={root}>…</section>;
}
```

`gsap.matchMedia()` gives reduced-motion and breakpoint variants with automatic cleanup. In RTL, horizontal `x` values need `* sign`.

### Number ticker

Motion `animate(from, to, { onUpdate })` writing into a text node formatted with `Intl.NumberFormat(locale)`; use `tabular-nums` so width doesn't jitter. Run once when in view; show the final value immediately under reduced motion.

## 6. Reduced motion

Strategy: remove movement, keep meaning.

- CSS: `--motion-distance: 0` under `prefers-reduced-motion: reduce` (already in `templates/motion.css`) collapses every translation that uses it, while opacity/color transitions continue.
- Disable: parallax, scroll-scrubbed transforms, auto-playing carousels/marquees, large zooms, smooth-scroll libraries, 3D camera moves (show a static frame).
- Motion for React: wrap the app in `<MotionConfig reducedMotion="user">` (the `MotionRoot` in `templates/motion.ts` does this) — transforms and layout animations are disabled, opacity kept.
- GSAP: register effects inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
- Anything auto-moving for more than 5 seconds needs a visible pause control (WCAG 2.2.2), regardless of preference.

## 7. Reviewing motion

You can't watch video, so review motion as frames:

- `scripts/capture.mjs --filmstrip 8 --interval 60` after load, or with `--click <selector>` / `--hover <selector>` to capture an interaction. Read the frames in order: is the start state right, does it settle by ~frame 4–5 in product mode, does anything overshoot or jump?
- `--scroll-steps 6` for scroll-driven sequences: each step should show meaningful progress, not "nothing, nothing, everything".
- Re-run with `--reduced-motion` and confirm the page is complete and usable.
- Read the code for interruptibility: no `setTimeout` chains driving visuals, no animation that blocks input.
