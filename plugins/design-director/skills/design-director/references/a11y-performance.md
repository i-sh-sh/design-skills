# Accessibility & Performance Guardrails

The checks that keep an ambitious design shippable. Run them in phase 6, and consult the performance section before committing to any heavy effect.

## Accessibility — WCAG 2.2 AA essentials

| Check | Target | How |
|---|---|---|
| Text contrast | ≥ 4.5:1 body, ≥ 3:1 large (≥ 24px, or ≥ 18.66px bold) | `scripts/contrast.mjs` on tokens, both themes; spot-check text over images/gradients in screenshots |
| Non-text contrast | ≥ 3:1 for UI component boundaries, focus rings, icons that convey meaning | Same script on border/ring tokens vs. surfaces |
| Focus visible | Every interactive element, clearly visible, not obscured by sticky headers (2.4.11) | Tab through the page; screenshot a focused state; `scroll-padding-top` for sticky headers |
| Target size | ≥ 24×24px (2.5.8); aim for 44px on touch | Inspect icon buttons, close buttons, inline links in dense UIs |
| Keyboard | All functionality reachable, logical order, no traps; Escape closes overlays | Native elements + Radix/React Aria primitives; test manually |
| Semantics | Real `<button>`, `<a href>`, headings in order, landmarks, labelled inputs | Read the JSX; no `div onClick` |
| Color alone | Errors, statuses and links not distinguished by color only | Add icon/text/underline |
| Motion | `prefers-reduced-motion` honored; auto-moving content > 5s pausable (2.2.2); nothing flashes > 3×/s (2.3.1) | `capture.mjs --reduced-motion`; check marquees, carousels, video heroes |
| Text resize | Usable at 200% zoom, no clipped text | Fixed heights on text containers are the usual culprit |
| Language & direction | `lang` and `dir` on `<html>`; `lang` on inline foreign-language passages | See `bidi.md` |
| Alt text | Meaningful images described; decorative images `alt=""`; decorative canvas `aria-hidden` | Read the JSX |
| Dragging | Drag interactions have a single-pointer alternative (2.5.7) | Reorderable lists need buttons or keyboard too |

Glass/blur surfaces and text over imagery are where contrast fails most often — measure the worst spot, not the average.

## Performance — design decisions that cost

**Core Web Vitals targets:** LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (75th percentile of real users).

### LCP (largest contentful paint)
- **Don't hide the LCP element behind an entrance animation.** Elements at `opacity: 0` aren't counted as painted, so a hero headline that fades in after hydration pushes LCP out by the animation delay + JS time. Keep it visible at first paint; animate a clip/translate reveal that starts visible, or animate secondary elements instead.
- Hero images: `next/image` with `priority` (or `preload` in newer versions — check the installed Next API), correct `sizes`, AVIF/WebP.
- Fonts: `next/font` (self-hosted, preloaded, `size-adjust`ed fallback). Load only the weights/subsets you use; prefer one variable file per family.

### CLS (layout shift)
- Reserve space for images, embeds, 3D canvases (fixed aspect-ratio boxes with a poster).
- Don't animate layout properties (`width`, `height`, `top`, `margin`) — use `transform`; for real layout changes use Motion's `layout` (FLIP, transform-based) or View Transitions.
- Late-loading banners/cookie bars: overlay, don't push content.

### INP (responsiveness)
- Heavy per-frame JavaScript competes with input. Prefer CSS/WAAPI (compositor) animations; Motion runs transform/opacity animations via WAAPI where possible.
- Scroll handlers: use CSS scroll-driven animations or `useScroll` (passive, rAF-batched), never layout reads in a scroll listener.
- Don't attach `pointermove` effects to hundreds of elements; one listener on the container, CSS variables for the values.
- Big lists: virtualize (TanStack Virtual) before animating them.

### Compositor-friendly properties
Animate `transform` (`translate`, `scale`, `rotate`), `opacity`, `filter`, `clip-path`. Avoid animating `box-shadow` on large areas (animate a pseudo-element's opacity instead), `backdrop-filter` on large moving surfaces, and anything that triggers layout. `will-change` only on elements about to animate, removed after.

### Heavy effects budget
- **3D/WebGL/shaders:** dynamic import (`ssr: false`), poster first, pause offscreen (`IntersectionObserver`) and on hidden tabs, cap DPR at 2, degrade on weak devices (`navigator.hardwareConcurrency <= 4`, `navigator.deviceMemory <= 4` where available, or R3F `PerformanceMonitor`), off under reduced motion.
- **Video heroes:** muted, `playsinline`, poster, compressed (AV1/H.264 fallback), pause control, and a static image on `Save-Data` / reduced motion.
- **Libraries (rough, gzipped):** Motion full `motion` component ~30+ KB, with `LazyMotion` + `domAnimation` much less; GSAP core ~25 KB, plugins extra; three.js 150 KB+; Lenis ~4 KB. Load per route; product routes should not pay for showcase effects.
- **Smooth scrolling** (Lenis) adds a rAF loop and can fight with native behaviors — showcase routes only.

## Quick verification checklist

```
[ ] contrast.mjs passes for all semantic pairs, light + dark
[ ] Tab through: focus always visible, order logical, Escape closes overlays
[ ] capture.mjs --reduced-motion: page complete, no movement, nothing hidden
[ ] LCP element visible in the first filmstrip frame
[ ] No layout shift visible across filmstrip frames of initial load
[ ] 390px: no horizontal scroll, targets ≥ 24px (44px preferred)
[ ] RTL + LTR captures reviewed
[ ] Heavy effects: lazy-loaded, poster present, paused offscreen
```
