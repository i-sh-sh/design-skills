# Bidirectional Design (RTL ⇄ LTR)

Both directions are first-class. A Hebrew page should look *designed in Hebrew*, not like an English page in a mirror, and vice versa.

## Contents
1. Document setup (Next.js)
2. Layout rules
3. What mirrors and what doesn't
4. Typography for Hebrew + Latin
5. Mixed-direction content
6. Motion and interaction in both directions
7. Components & libraries
8. Testing

---

## 1. Document setup (Next.js)

Set `lang` and `dir` on `<html>` from the locale, server-side, so the first paint is already correct:

```tsx
// app/[locale]/layout.tsx
const rtlLocales = new Set(["he", "ar", "fa", "ur"]);

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dir = rtlLocales.has(locale) ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir} className={`${sans.variable} ${hebrew.variable}`} suppressHydrationWarning>
      <body>
        <MotionRoot dir={dir}>{children}</MotionRoot>
      </body>
    </html>
  );
}
```

(`params` is a Promise in recent Next versions; in older ones it's a plain object.) i18n routing with `next-intl` is the common choice. `MotionRoot` is in `templates/motion.ts`; if you use Radix, also wrap with its `DirectionProvider dir={dir}`.

`lang` matters as much as `dir`: it drives font selection, hyphenation, quotes, and `:lang(he)` styles in `templates/globals.css`.

## 2. Layout rules

- **Logical everything.** Tailwind: `ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s border-e rounded-s rounded-e rounded-ss …`, `float-start`, `scroll-ms-*`. CSS: `margin-inline-start`, `inset-inline-end`, `padding-inline`, `border-start-start-radius`.
- Flex and grid already follow `dir` — `justify-start` means the start edge. Use `gap` instead of `space-x-*`.
- Physical values are allowed only for things that are physically fixed regardless of language (e.g. a map, a media timeline scrubber, a chart's x-axis if you've decided it's LTR).
- Search for leaks before shipping: `rg -n '\b(ml|mr|pl|pr|left|right)-|text-(left|right)|rounded-(l|r|tl|tr|bl|br)-' src app components`.
- Shadows and gradients with a horizontal component (`box-shadow: 4px 0 …`, `linear-gradient(to right …)`) need a direction-aware version — use `--dir-sign` in the offset, or `to left` under `:dir(rtl)`.
- `transform-origin` for horizontal scaling (progress bars, underline animations) must switch: `origin-left` → use `[transform-origin:0_50%]` plus `rtl:[transform-origin:100%_50%]`, or `transform-origin: inline-start` style helpers via a utility.

## 3. What mirrors and what doesn't

**Mirror** (they encode reading direction): back/forward arrows, chevrons in breadcrumbs and "next" buttons, reply/forward, undo/redo (usually), list bullets and indentation, progress bars and sliders, steppers and timelines that represent sequence, text-alignment icons, sidebar collapse icons, quote marks' positions.

**Don't mirror**: check marks, search/magnifier, play/pause/media controls (media timelines are LTR universally), clocks and clockwise refresh icons, logos, brand marks, numbers and digits, phone keypad, charts' numeric axes (decide explicitly — many Hebrew products keep time axes LTR), images and photography (never flip photos — text in them becomes mirrored).

Implementation: `rtl:-scale-x-100` on directional icons, or a `DirectionalIcon` wrapper that applies it. Keep the list of which icons are directional in one place.

## 4. Typography for Hebrew + Latin

**Font stack technique.** Put the Latin face first and the Hebrew face second: Latin fonts usually don't contain Hebrew glyphs, so the browser falls back per character to the Hebrew face. One `font-family` then handles mixed text correctly:

```css
--font-sans: var(--font-latin), var(--font-hebrew), system-ui, sans-serif;
```

If a single family covers both scripts well (Rubik, Heebo, Assistant, Noto), use it alone.

With `next/font/google`, load the Hebrew face with `subsets: ["hebrew"]` (add `"latin"` only if you'll use its Latin) and expose each font as a variable.

**Pairings** (Google Fonts, free; ✓ = family designed as a Hebrew+Latin pair):

| Role | Hebrew | Latin partner | Character |
|---|---|---|---|
| Neutral UI sans | IBM Plex Sans Hebrew ✓ | IBM Plex Sans | Technical, precise |
| Neutral UI sans | Heebo ✓ | Roboto / Heebo's own Latin | Clean, familiar |
| Friendly sans | Assistant ✓ | Source Sans 3 | Humanist, soft |
| Geometric/rounded | Rubik ✓ | Rubik | Friendly, rounded corners |
| Universal | Noto Sans Hebrew ✓ | Noto Sans | Maximum coverage |
| Editorial serif | Frank Ruhl Libre | Newsreader / Instrument Serif / Source Serif 4 | Classic, literary |
| Serif alt | Noto Serif Hebrew, David Libre | Noto Serif, Libre Caslon | Traditional |
| Display | Secular One, Suez One | Bricolage Grotesque, Space Grotesk | Bold headlines |
| Condensed display | Karantina | Oswald, Bebas Neue | Posters, sport, loud |
| Elegant display | Bellefair | Cormorant, Italiana | Luxury, fashion |
| Rounded soft | Varela Round | Varela Round, Nunito | Kids, gentle brands |
| Handwritten | Amatic SC, Playpen Sans Hebrew | same family | Informal accents only |
| Mono | Cousine (Hebrew-capable) | JetBrains Mono, Geist Mono | Code, technical data |

For premium brands, Israeli foundries (e.g. Fontef, HaGilda, Masterfont) and free libraries like Hafontia offer far more distinctive Hebrew display faces — suggest them when the direction calls for it; licensing is the user's decision.

**Hebrew typesetting rules:**

- **No case.** `uppercase` does nothing to Hebrew, and letter-spacing breaks the word shapes. Labels and eyebrows: use weight, size, color, or a small rule/marker instead of caps + tracking. `templates/globals.css` resets tracking under `:lang(he)`.
- **Apparent size.** Many Hebrew faces look smaller than their Latin partners at the same `font-size`. Match optically (e.g. Hebrew at 105–110%) via `size-adjust` in `@font-face` or a `:lang(he)` size factor — judge from screenshots, not numbers.
- **Line-height.** Slightly more generous than Latin, especially with niqqud: body ~1.6–1.75, headings ~1.15–1.25.
- **Measure.** Hebrew words are shorter; aim for roughly 40–65 characters per line.
- **Numbers** remain LTR inside RTL text and render correctly by default; use `tabular-nums` in tables.
- **Punctuation** at line ends is handled by the bidi algorithm — don't "fix" it by hand; if it looks wrong, the real problem is usually missing isolation (section 5).
- **Italics** don't really exist in Hebrew typography; for emphasis use weight or color. Many Hebrew fonts have no italic — the browser fakes an ugly slant.
- **Quotes:** Hebrew uses ״ ״ or " " and gershayim (״) in acronyms (צה״ל) — preserve the user's characters.

## 5. Mixed-direction content

The Unicode bidi algorithm handles most mixing, but boundaries between directions need isolation:

- **User-generated or unknown-direction text** (names, titles, comments, search results): `dir="auto"` on its container, or `<bdi>` for inline values.
- **Always-LTR content** inside RTL: code, file paths, URLs, emails, phone numbers, product SKUs, math — `dir="ltr"` (inline: `<span dir="ltr">`), plus `unicode-bidi: isolate` (implied by `dir`).
- **Inputs:** `dir="auto"` for free text; `dir="ltr"` for email/URL/phone/number inputs, with `text-align: end` in RTL forms if it looks detached from the label (decide by screenshot).
- **Interpolated strings:** `"{count} פריטים"` — wrap interpolated values in `<bdi>` in components that render translated strings with variables.
- **Truncation:** `text-overflow: ellipsis` follows direction; for mixed content in one line, isolate each segment.
- **Icons adjacent to text:** use flex with `gap`, not margins, so the icon lands on the right side automatically.
- **Per-word wrappers break mixed runs.** `inline-block`/`inline-flex` elements are treated as neutral characters by the bidi algorithm, so wrapping each word separately (for kinetic type, highlights, tooltips per word) reverses the order of an opposite-direction run. Wrap the whole run in one element with `dir`, or keep the words as plain inline text.
- **Mono and Latin-only faces need a Hebrew fallback in the stack** (`"IBM Plex Mono", "Heebo", monospace`). Otherwise Hebrew labels set in the mono face fall back to a system monospace with wide, uneven spacing.
- **Hebrew prefixes** (ש, ה, ו, ב, ל, מ, כ) belong to the next word. Never put an element boundary between a prefix and its word; emphasize the whole word.

## 6. Motion and interaction in both directions

- **Horizontal motion multiplies by the direction sign.** CSS: `translate: calc(var(--dir-sign) * 24px) 0`. React: `x: 24 * sign` via `useDirSign()`. Vertical motion needs no change.
- **"From the start edge"** means from the right in RTL. Drawers anchored to `inset-inline-start` slide in from the start edge in both directions; think in logical terms and derive the sign.
- **Swipe gestures:** "swipe to go next" is right-to-left in LTR and left-to-right in RTL. Multiply drag offsets by the sign before deciding next/previous. Carousels with Embla: set `direction: 'rtl'`.
- **Scroll position:** in RTL, `scrollLeft` is `0` at the start and becomes **negative** toward the end (per spec in all modern engines). Normalize with `Math.abs` or compute via `scrollWidth - clientWidth`; better, use `scrollIntoView` and scroll snap and avoid raw offsets.
- **Scroll-driven horizontal effects:** `animation-timeline: scroll(inline)` progress follows the inline direction; keyframes with `translate` need `--dir-sign`.
- **GSAP:** multiply `x`/`xPercent` by the sign; ScrollTrigger's horizontal pinned sections need the sign in the tween, not in the trigger.
- **Staggers** that sweep across a row should start from the start edge in both directions — order by DOM position (which follows reading order), not by x-coordinate.
- **Asymmetric easing illusions:** motion that "falls" to the right can feel different in RTL — review filmstrips in both directions, not just one.

## 7. Components & libraries

- **Radix / shadcn/ui:** wrap in `DirectionProvider`; components accept `dir`. Menus, tabs (arrow-key order), sliders and scroll areas depend on it.
- **Base UI / Headless UI / React Aria:** React Aria reads locale via `I18nProvider` and handles direction thoroughly; others follow the document `dir`.
- **Embla carousel:** `direction: "rtl"` option plus `dir="rtl"` on the container.
- **Charts (Recharts, Visx, ECharts):** decide axis direction explicitly; mirror legends and tooltips' placement with logical CSS.
- **Toasts (Sonner):** set `dir`; place at `bottom-left`/`bottom-right` by logical choice (start/end) computed from direction.
- **Date pickers:** locale-aware formatting (`Intl.DateTimeFormat("he-IL")`), week starts on Sunday in Israel, and arrows mirrored.
- **Tailwind plugins/animations** from third parties often hard-code `left`/`right` — review before adopting.

## 8. Testing

- Capture both directions every time: `capture.mjs --dirs ltr,rtl`, ideally with `--rtl-url` pointing at the real Hebrew route so real strings and fonts render.
- Look specifically for: icons pointing the wrong way, cramped Hebrew line-height, tracked Hebrew labels, misplaced absolute elements (badges, close buttons), shadows falling the wrong way, drawers/toasts entering from the wrong side, mixed strings with punctuation in the wrong place.
- Pseudo-localization: temporarily set Hebrew text ~30% longer and English ~30% shorter to check layouts don't depend on string length.
