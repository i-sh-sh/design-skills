# Audit Rubric

Use this in phase 1 (baseline) and phase 6 (critique). Score each dimension 1–5 from **screenshots you actually looked at**, plus a quick read of the code for the things screenshots can't show (tokens, states, semantics).

## Scale

- **1** broken or absent · **2** inconsistent, noticeably weak · **3** competent, generic · **4** considered, consistent · **5** distinctive and excellent

A "3" is the default output of any tool. The job is to move the important dimensions to 4–5.

## Dimensions

| # | Dimension | What to look for | Common failure |
|---|---|---|---|
| 1 | **Hierarchy** | One obvious primary action/message per view; the squint test (blur your eyes — what survives?) | Everything the same weight; three competing CTAs |
| 2 | **Typography** | Deliberate pairing, a real scale (not 7 random sizes), comfortable measure (45–75ch Latin, ~40–65 for Hebrew), balanced/pretty wrapping, no orphans in headings | Default font, one weight, headings as big body text |
| 3 | **Color** | Semantic roles, restrained accent use, both themes designed (not inverted), contrast passes | Accent everywhere; muddy dark mode; gray-on-gray text |
| 4 | **Space & rhythm** | Consistent spacing scale, related things grouped (proximity), generous where it matters, aligned edges | Random paddings; cramped cards; nothing aligns to anything |
| 5 | **System consistency** | Tokens used, not hard-coded values; same component looks the same everywhere; radii/shadows coherent | `#3b82f6` literals, five border radii, mixed icon sets |
| 6 | **Interaction states** | Hover, focus-visible, active, disabled, loading; empty/error/loading for data | Buttons without pressed/focus state; blank screen while loading |
| 7 | **Motion** | Purposeful, fast in product, choreographed in showcase, interruptible, reduced-motion aware | No feedback at all, or fade-up on everything; 600ms dropdowns |
| 8 | **Responsiveness** | Composed at 390px, not just stacked; touch targets; no horizontal scroll; container-aware components | Desktop layout squeezed; tiny tap targets; overflowing tables |
| 9 | **Bidirectional** | Correct mirroring in RTL and LTR, icons, motion direction, mixed-script text, fonts for both scripts | `ml-4` everywhere; arrows pointing backwards; Latin fallback font for Hebrew |
| 10 | **Accessibility** | Contrast, focus visibility, semantics, labels, keyboard path, target size | Div buttons; outline removed; placeholder-as-label |
| 11 | **Performance feel** | Fast first paint, no layout shift, smooth 60fps interactions, lazy heavy media | Hero fades in after JS loads; CLS from fonts/images |
| 12 | **Distinctiveness** | Would you recognize this product from a cropped screenshot? Is there a signature element? | Looks like every template |

## Report format

Keep it scannable. For a small task, collapse to the three biggest issues.

```markdown
## Design audit — <page/scope>

**Stack:** Next 16 · React 19 · Tailwind v4 · shadcn/ui · motion — (detected)
**Mode:** product | showcase | mixed (which routes are which)

| Dimension | Score | Key issue |
|---|---|---|
| Hierarchy | 2 | Hero headline and 3 CTAs compete; no clear primary |
| ... | | |

### Top fixes (highest impact first)
1. **<fix>** — why it matters, what it touches
2. ...

### Keep
- Things that already work and must survive the redesign
```

## Critique pass (phase 6)

Before calling anything done, look at each screenshot and answer honestly:

1. What is the first thing my eye lands on — is it the right thing?
2. Is there any element whose size, weight or color I can't justify?
3. Does the RTL version look *designed*, or merely flipped?
4. Does dark mode look like its own design, with visible surface layers?
5. At 390px, is it composed or just stacked?
6. Would a cropped screenshot be recognizable as this product?
7. Did the motion filmstrip show anything late, floaty, or unmotivated?

Anything answered "no" or "not sure" is the next iteration.
