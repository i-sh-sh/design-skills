# Project Log

One entry per project, newest first, written by the retrospective. The log is what makes the skill compound: before a new project, read the last entries for what worked, what had to be fixed, and how the metrics are trending.

## Metrics (tracked per project)

| Metric | What it measures | Goal over time |
|---|---|---|
| **First-pass issues** | Problems found in the first screenshot critique of each screen | ↓ |
| **Caught by checks vs. by eye** | Of all issues found, how many an automated check caught | share caught by checks ↑ |
| **Critique rounds** | Build → capture → fix loops before the owner saw it | ↓ |
| **Owner corrections** | Times the owner had to change something the skill decided | ↓ |
| **Patterns reused** | Ready patterns used instead of written from scratch | ↑ |
| **Owner rating** | Share of rated items marked "loved" in the retrospective | ↑ |

---

## MoshLab (ProUnit, continued) — 2026-10-06 → 2026-10-15

**What:** the same Moshal community-projects demo after a provisional Moshal brand layer (sampled from moshalprogram.org.il, no logo or licensed font copied), council 0003 polish, the "motion with a body" upgrade (0004), the rename to **MoshLab · Where Ideas Become Projects**, and the PM spec's profile, problem/vision, join expectations and alumni-mentor features. PRs #4, #5, #7, #8 merged.
**Direction:** 0003 (polish inside the brand; the bridge between institutions as the one delight) accepted, then partly superseded a day later by the owner's motion request (0004, accepted 2026-10-15).

**Metrics (vs. ProUnit baseline)**
| Metric | ProUnit | MoshLab | Trend |
|---|---|---|---|
| First-pass issues | 6 | 4 in the 0003 critique (Hebrew counts ×3 screens, duplicate CTA, `cn()` dropping type sizes, weak join moment) | ↓ |
| Caught by checks / by eye | 1 / 5 | 0 / 4 (contrast, bidi lint and the input rule all passed: last retro's L3 promotions held) | checks found nothing new to catch; new pitfalls promoted to L4 |
| Critique rounds | 2–3 per screen | 1–2 per change (390/1280 captures + browser run, no console errors) | ↓ |
| Owner corrections | 0 design + 3 direction answers | 1 direction override (motion), 1 abandoned proposal (branding), 1 owner-chosen name | ≈ |
| Patterns reused | 0 | 9 (segmented, stateful button, toasts, drawer, collapse rows, view transitions, ticker, plaintext inputs, skeleton) | ↑↑ |
| Owner rating | lab 14/19 | pending (rating page 2026-10-15) | — |

**What worked**
- The pattern library: nine patterns reused, and none of P-001…P-014 recurred.
- Showing the built result in the same PR as the decision: 0003 was accepted with one word.
- Using an existing capture of the brand site instead of fighting the network policy.

**What had to be fixed**
- P-015…P-018 (Hebrew counts, `cn()` type sizes, duplicate CTA, decision-number collision).
- The council ruled out motion the owner loves (+2) as "not now"; the owner reversed it the next day (council C-006).

**Promoted after this project**
- `cn()` with the type scale and `count()` → `patterns/utils.ts` (L4).
- Gesture kit (`physics.ts`, sheet drag, tilt, scroll and kinetic CSS) → `patterns/gesture/`.

---

## ProUnit — 2026-09-29 → 2026-10-06

**What:** Hebrew-only RTL demo for Moshal program students (propose recruiting projects, join across degrees and institutions) and coordinators (community-day "community pulse"). Next.js 16, React 19, Tailwind v4, Radix. Deployed on Vercel.
**Direction:** council decisions 0001 (superseded) → 0002 (accepted): product of Moshal, brand swap via one file, soft-tactile placeholder, two flows framed by the community day.

**Metrics (baseline — first project)**
- First-pass issues: 6 (double-flipped arrow; empty inputs LTR via `dir="auto"`; label "מחפשים מ"; bridges list too long; role row on mobile; warning color contrast 4.34:1)
- Caught by checks: 1 of 6 (contrast). By eye from screenshots: 5.
- Critique rounds: 2–3 per screen.
- Owner corrections: 0 design corrections; 3 answers that changed the direction (demo audience, brand permission, no English).
- Patterns reused: 0 (everything written fresh; now extracted to `patterns/`).
- Owner rating: lab 14 loved / 2 rejected / 3 unrated (pre-project).

**What worked**
- Council full mode on an empty repo: 6 of 7 members revised in round 2; the adopted structure came from the devil's advocate.
- Asking who the demo audience is — it flipped the brand decision.
- Screenshot critique caught every bidi bug that the code review missed.

**What had to be fixed (→ `references/pitfalls.md`)**
- P-001…P-010 recorded from this project.

**Promoted after this project**
- `dir="auto"` on inputs → automated check in `kit/check-logical.mjs`.
- Framework preset "Other" on Vercel → `kit` adds `vercel.json`.
- Seven micro-interactions → `patterns/`.
