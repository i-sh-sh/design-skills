# Owner Taste Profile

The skill owner's design preferences, learned from rated examples and finished projects. Updated by the retrospective (`references/retrospective.md`). Use these as **defaults when a brief leaves room** — they never override a project's own brand, audience or explicit instructions. When a brief pulls against this profile, follow the brief and say so in one line.

## How to read the weights

Each preference has a **weight** from −3 to +3 and its **evidence** (where it was learned).

| Weight | Meaning | How to act |
|---|---|---|
| +3 | Loved repeatedly, across projects | Default choice; propose it first |
| +2 | Loved once with clear signal, or chosen in a real project | Strong default |
| +1 | Mild preference / accepted without comment | Tie-breaker |
| 0 | Neutral or unrated | Use only when the brief calls for it, flag as optional |
| −1 | Mild dislike / changed once | Avoid unless asked |
| −2 | Rejected | Don't propose; mention only if the brief clearly demands it |
| −3 | Rejected repeatedly | Treat as off the table for this owner |

Weights move one step per new signal, in either direction, and never jump straight to ±3 from one project. Contradicting evidence moves the weight toward 0 before it can flip sign.

## Directions

| Preference | Weight | Evidence |
|---|---|---|
| **Soft & tactile**: warm cream base, rounded humanist type (Rubik-like), large radii, press-in buttons, gentle bounce, stacked cards | **+2** | Lab 2026-09 loved; chosen as ProUnit base (2026-09-30) |
| **Precision instrument**: light, cool neutrals, one cobalt-like accent, visible grid, 4px radius, zero-bounce springs, live data as hero | **+2** | Lab 2026-09 loved |
| **Cinematic dark**: near-black, huge condensed type, moving light | **−2** | Lab 2026-09 rejected |

When presenting 2–3 directions: one from each +2 family adapted to the project, and a third slot for a genuinely different idea that is **not** a −2 direction.

## Surfaces & texture

| Preference | Weight | Evidence |
|---|---|---|
| Light themes over dark as the primary look | +2 | Lab (cinematic dark rejected, both light directions loved) |
| Clean surfaces; depth from layered surfaces, borders, soft shadows | +1 | Grain rejected |
| Grain / noise textures | **−2** | Lab 2026-09 rejected |

## Showcase effects

| Effect | Weight | Evidence |
|---|---|---|
| Kinetic headline (word rise with mask) | **+3** | Lab loved; MoshLab retro loved (2026-10-15) |
| Scroll-drawn line / chart | **+3** | Lab loved; MoshLab retro loved (bars and bridges draw on scroll) |
| Number tickers | +2 | Lab loved; used in ProUnit community pulse |
| Flowing variable-font weight | +2 | Lab loved |
| Marquee with pause control | +2 | Lab loved |
| Live shader background | 0 | Lab unrated |
| Magnetic button | 0 | Lab unrated |
| Spotlight cards | 0 | Lab unrated (toggled, then cleared) |
| Scroll-driven reading progress / header settle | +2 | MoshLab: explicit request; retro loved ("scroll effects") |
| Cards that unfold on scroll (wave per column) | +2 | MoshLab: explicit request; retro loved |

## Product micro-interactions (the default kit)

Every product micro-interaction shown so far was loved. Build these in unless there's a reason not to; ready implementations live in `patterns/`.

| Pattern | Weight | Evidence |
|---|---|---|
| Sliding tab / segmented indicator | +2 | Lab loved; shipped in ProUnit |
| CSS-spring toasts | +2 | Lab loved; shipped in ProUnit |
| Direction-aware drawer / bottom sheet | +2 | Lab loved; shipped in ProUnit |
| Collapsing list rows | +2 | Lab loved; shipped in ProUnit |
| Stateful button (press → loading → drawn check) | +2 | Lab loved; shipped in ProUnit |
| Content-shaped skeleton | +2 | Lab loved; shipped in ProUnit |
| Card-to-page morph (View Transitions) | +2 | Lab loved; shipped in ProUnit |

## Physical gesture motion

New in MoshLab (2026-10): the owner explicitly asked for an "extreme" upgrade of touch, swipe and animation, then rated every gesture pattern "loved" in the retro. Ready code: `patterns/gesture/`.

| Pattern | Weight | Evidence |
|---|---|---|
| Swipe deck (keep/skip with momentum and rubber-band), with a summary of what was kept | +2 | MoshLab request + retro loved (deck and its summary) |
| Drag-to-dismiss bottom sheet | +2 | MoshLab request + retro loved |
| Pointer tilt + light on cards | +2 | MoshLab request + retro loved |
| Phone snap rail with depth | +1 | MoshLab request (not rated) |

## Concept & delight

| Preference | Weight | Evidence |
|---|---|---|
| **A signature element that is the product's idea made visible** (MoshLab: the bridge between institutions, which sparks on hover and gains a pending link after a join request), instead of generic delight | +2 | MoshLab retro: both bridge items loved; confetti was never wanted |
| Product screens that state the project's structure plainly (problem / vision side by side, team with skills and hours, expectations before joining) | +1 | MoshLab retro: all five screens loved |

## Summary

Light over dark · clean over textured · warm-tactile or precise, never dramatic · motion that explains, and plenty of it when it has a body (gestures, scroll) · polished micro-interactions everywhere · project brand first when one exists.
