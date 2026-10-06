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
