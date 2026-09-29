# Creative Techniques (Showcase Mode)

A menu of "wow" techniques, each with its cost, its risk, and how to do it well. Pick **one signature moment per page** and at most one or two supporting effects. Product routes get none of these except where noted.

| Technique | Impact | Cost (effort / bundle / perf risk) | Notes |
|---|---|---|---|
| Kinetic headline | High | Low / low / low | Best ratio of wow to cost |
| Pointer spotlight / glow cards | Medium | Low / none / low | Desktop (`pointer: fine`) only |
| Magnetic buttons | Low–medium | Low / Motion / low | One or two CTAs, never every button |
| Scroll-scrubbed story | Very high | High / GSAP or CSS / medium | Needs real content to tell |
| Shared-element page morph | High | Medium / none / low | View Transitions; product-safe |
| SVG line draw / morph | Medium | Low–medium / none–GSAP / low | Logos, diagrams, signatures |
| Grain / noise texture | Medium (subtle) | Low / none / low | Instantly less "flat" |
| Marquee / ticker | Low–medium | Low / none / low | Needs pause control |
| Shader gradient background | High | Medium / ~small (OGL) – large (three) / medium | Poster fallback required |
| 3D hero (R3F) | Very high | High / large / high | Only when 3D *is* the story |
| Interactive illustration (Rive) | High | Medium (design asset) / medium / low | Great for onboarding, empty states |
| Physics / particles | Medium | Medium–high / medium / high | Rarely worth it |

---

## Kinetic typography

Split the headline and animate the pieces. For bidirectional text, **split by words** by default: word order and bidi reordering stay correct, and Hebrew/English mixed lines don't scramble.

- **Split words are atomic inlines, and atomic inlines are neutral to the bidi algorithm.** If each word becomes its own `inline-block`, a run of English words inside a Hebrew sentence (or Hebrew inside English) displays in *reverse order* ("Design System" → "System Design"). Group each opposite-direction run into a single unit with its own `dir`, and keep trailing punctuation outside that unit so it lands on the correct side. Verify with a screenshot in both directions.
- Don't split inside a word to style part of it: Hebrew prefixes (ש, ה, ו, ב, ל, מ, כ) attach to the next word, and a split there introduces a visible gap. Put the whole word, prefix included, in the emphasized span.
- Splitting by characters is fine for pure Latin or pure Hebrew (Hebrew letters don't join, unlike Arabic — **never split Arabic by character**). Keep niqqud (vowel marks) attached to their letter: split by grapheme with `Intl.Segmenter`, not by code unit.
- GSAP `SplitText` (free since 3.13) handles lines/words/chars, masks for clipped reveals (`mask: "lines"`), and re-splits on resize (`autoSplit`). Always keep an accessible label: the original text in `aria-label` on the container and `aria-hidden` on the split spans (SplitText does this by default in recent versions — verify).
- A pure-CSS version: wrap words in spans with `style="--i: n"` and use `animation-delay: calc(var(--i) * 40ms)`.
- Directions: a "rise with clip" reveal (translateY in a masked line) works identically in RTL and LTR. Horizontal reveals must use `--dir-sign`.
- Keep the headline visible at first paint if it's the LCP element (animate from `translate` + clip rather than opacity 0), or keep the animation very short.

Variable-font effects: animate `font-weight` / `font-variation-settings` on hover, or scrub width/weight with scroll for a display word. Check that the Hebrew face is variable too, otherwise the effect only works on Latin.

## Pointer spotlight cards

```tsx
function Spotlight({ children }: { children: React.ReactNode }) {
  return (
    <div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className="group relative overflow-hidden rounded-lg border bg-card pointer-coarse:[&>.glow]:hidden"
    >
      <div className="glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-(--duration-base) group-hover:opacity-100"
        style={{ background: "radial-gradient(24rem circle at var(--x) var(--y), color-mix(in oklch, var(--primary) 14%, transparent), transparent 60%)" }} />
      <div className="relative">{children}</div>
    </div>
  );
}
```

Coordinates are physical pixels from the pointer, so no direction handling is needed. A border-only variant (glow visible only on the card border via a mask) looks more refined than a full-surface glow.

## Magnetic button

Motion `useMotionValue` + `useSpring` for x/y, set from pointer offset × 0.2–0.35 on `pointermove`, reset on `pointerleave`. Only on `(pointer: fine)` and not under reduced motion. Limit to the primary CTA.

## Scroll-scrubbed story

For "product assembling", "timeline filling", "before → after" sequences.

- CSS-first when the effect is per-element: `animation-timeline: view()`.
- GSAP ScrollTrigger with `pin` + `scrub` when you need a pinned scene with multiple coordinated steps (pattern in `motion.md`).
- Image sequences (video-like scrubbing): prefer a scrubbed `<video>` with frequent keyframes, or a canvas drawing preloaded frames — lazy-load and cap total weight.
- Each scroll step must show progress; test with `capture.mjs --scroll-steps`.
- Mobile: shorter pin distances, fewer steps; consider replacing pinning with a simple stacked layout under 768px.
- Lenis (smooth scroll) makes scrubbed effects feel premium; use only on showcase routes and disable it under reduced motion.

## Shared-element morph (View Transitions)

The most "native app" feeling effect on the web, and safe for product routes too: a list thumbnail morphs into the detail page hero. Give both the same unique `view-transition-name` and let the browser interpolate. Tune `::view-transition-group(name)` duration/easing with the motion tokens. Keep names unique on the page at any moment or the transition is skipped.

## SVG

- **Line draw:** `stroke-dasharray` = path length, animate `stroke-dashoffset` to 0 (CSS, or scroll-linked with `animation-timeline`). `pathLength="1"` on the path simplifies the math.
- **Morph:** GSAP MorphSVG (free) handles mismatched point counts; `flubber` as a lightweight alternative.
- **Direction:** a path drawn "from the start edge" should reverse in RTL — mirror the SVG (`scale: -1 1` under `:dir(rtl)`) only if it contains no text or asymmetric meaning.
- Animated logos: keep the static version as the SVG default; animate on hover or once on load.

## Texture: grain & noise

A subtle grain removes the sterile "flat vector" look, especially on gradients and dark surfaces.

```css
.grain::after {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .06; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Also good: halftone/dither patterns for editorial or retro directions; dot or line grids for technical ones (use `background-image` gradients, fade with `mask-image`).

## Marquee

Pure CSS: duplicate the content once, animate `translate` from 0 to −50% (× `--dir-sign`), `animation-play-state: paused` on hover and focus-within, and a visible pause button (WCAG 2.2.2). Stop entirely under reduced motion. Use `mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)` for soft edges — horizontal masks are symmetric, so no bidi change needed.

## Shader gradient backgrounds

Living, light-like gradients (mesh gradients, flowing noise, aurora):

- Lightweight: a single full-screen fragment shader in **OGL** or raw WebGL2 (a few KB) rather than all of three.js.
- Keep colors from the palette tokens (pass as uniforms, converted from OKLCH to linear RGB).
- Render at reduced resolution (0.5× DPR) — soft gradients don't need full resolution — and pause when offscreen or tab hidden.
- Ship a static poster (a pre-rendered frame as AVIF/WebP) shown immediately and under reduced motion; fade the canvas in once it's running.
- A cheaper illusion: 2–3 large blurred radial gradients animated with `@property` angles/positions in CSS.

## 3D hero (React Three Fiber)

Only when the product *is* spatial or the 3D carries the story (hardware, architecture, a product the user can rotate).

- Stack: `@react-three/fiber` + `@react-three/drei` (`Environment`, `ContactShadows`, `Float`, `useGLTF`, `PresentationControls`, `ScrollControls`), `@react-three/postprocessing` sparingly.
- Load: `next/dynamic(() => import("./Scene"), { ssr: false })`, poster image in the same box until ready, `Suspense` + drei `useProgress` for a branded loader.
- Assets: glTF/GLB compressed with Draco or Meshopt, KTX2 textures; budget the model (e.g. < 1–2 MB for a hero).
- Performance: `dpr={[1, 2]}`, `frameloop="demand"` for mostly static scenes, `<PerformanceMonitor>` + `AdaptiveDpr` to degrade on weak devices, pause when offscreen.
- WebGPU: three.js's `WebGPURenderer` (with TSL shaders) is viable now that the major engines ship WebGPU, with automatic WebGL2 fallback — use it for heavy particle/compute work; for a simple hero, WebGL is fine.
- Accessibility: the canvas is decorative (`aria-hidden`) or has a text alternative; controls must not trap scroll or keyboard.
- Alternatives when a designer owns the scene: Spline (export to React), or a rendered video loop.

## Interactive illustrations (Rive)

Rive state machines respond to hover, click and inputs (e.g. a mascot that follows the cursor, an onboarding illustration that reacts to progress). Small runtime, small files, crisp at any size. Requires a design asset from the Rive editor; you can wire inputs with `useRive` + `useStateMachineInput`. Lottie/dotLottie for simpler non-interactive animations exported from After Effects.

## Moments of delight (product-safe)

Small, earned rewards are the one "creative" thing product mode welcomes:

- Success states: a check that draws itself, a subtle burst on first completion (not every save).
- Empty states: an illustration or the signature motif, with a clear next action.
- Loading: skeletons that match the real layout; a branded progress indicator for long waits.
- Streaming/AI output: text streams in with a soft fade per chunk, a cursor that uses the brand accent.
- Numbers that tick to their value once when a dashboard loads (with `tabular-nums`).

Rule of thumb: if a user sees the effect more than a few times a day, it should be ≤ 300ms and skippable by simply continuing to work.
