# Known Pitfalls — the Ladder

Every mistake the skill has made (or nearly made) in a real project, and how far it has been promoted. This file is why quality compounds: a lesson that only lives in prose gets forgotten; a lesson that became a check or a component can't recur.

## The ladder

| Level | Name | What it means | Who enforces it |
|---|---|---|---|
| L1 | **Note** | Written down here, with the symptom | You, if you remember to read this file |
| L2 | **Rule** | In a reference file or SKILL.md at the point where the mistake happens | You, while following the workflow |
| L3 | **Check** | A script that fails (`kit/check-logical.mjs`, `contrast.mjs`, a CI step) | The machine, every run |
| L4 | **Component** | A pattern or template where the right thing is the default (`patterns/`, `templates/`) | Nobody needs to — the wrong version isn't written |

**Promotion rule (applied in every retrospective):** a pitfall that appeared again, or that was caught only by eye, moves up at least one level if a higher level is possible. Aim for L3 or L4 for anything that can be detected mechanically. Record the promotion in the table and in `owner/projects.md`.

**At the start of every project:** skim this table. While building, treat every L1/L2 item as a checklist line for phase 6.

## Registry

| ID | Pitfall | Symptom | Level | Where enforced | First seen |
|---|---|---|---|---|---|
| P-001 | Physical `left/right` utilities and CSS in an RTL or bidirectional app | Layout mirrored wrong; badges and close buttons on the wrong side | **L3** | `kit/check-logical.mjs` | ProUnit |
| P-002 | Token pairs below WCAG AA (e.g. warning color 4.34:1) | Low-contrast text; out-of-gamut OKLCH | **L3** | `scripts/contrast.mjs`, `kit` npm script + CI | ProUnit |
| P-003 | `dir="auto"` on text inputs and textareas | Empty field and placeholder render LTR in an RTL form; mixed placeholder scrambled | **L3 + L4** | `kit/check-logical.mjs` (bidi rule) and `patterns/input.tsx` | ProUnit |
| P-004 | Directional icon double-flip: picking `ArrowLeft` for "forward in Hebrew" *and* adding the mirror class | Arrow points backwards | L2 | `references/bidi.md` (author icons in LTR meaning) | ProUnit |
| P-005 | Per-word `inline-block` wrappers around mixed-direction text | English run inside Hebrew displays reversed ("System Design") | L2 | `references/bidi.md`, `references/creative-tech.md` | Lab |
| P-006 | Latin-only / mono font without a Hebrew fallback in the stack | Hebrew falls back to system monospace with wide gaps | L2 + L4 | `references/bidi.md`; `templates/globals.css` stacks | Lab |
| P-007 | Splitting a Hebrew prefix (ש/ה/ו/ב/ל/מ/כ) from its word with an element boundary | Visible gap: "ש מסבירה" | L2 | `references/bidi.md` | Lab |
| P-008 | Tailwind v4 tree-shakes unused `@theme` variables | `var(--ease-exit)` undefined in plain CSS | **L4** | `templates/motion.css` uses `@theme static` | design-director build |
| P-009 | `var(--font-x)` with no fallback in a font stack | Whole `font-family` invalid → Times | **L4** | `templates/globals.css` fallbacks | design-director build |
| P-010 | Vercel project imported before the app existed → framework preset "Other" | Build succeeds locally, deployment fails | **L4** | `kit` writes `vercel.json` with `"framework": "nextjs"` | ProUnit |
| P-011 | Copy labels that read as fragments in Hebrew ("מחפשים מ" before chips) | Awkward microcopy | L1 | — (caught in critique) | ProUnit |
| P-012 | Lists without a cap on dense dashboards | One column twice as long as its neighbor | L1 | — (cap at ~6 + "ועוד N") | ProUnit |
| P-013 | Framework assumptions from memory on a new major version (Next 16) | Wrong APIs | L2 | SKILL.md phase 1: read the framework's bundled docs / AGENTS.md | ProUnit |
| P-014 | `setState` inside an effect for animation counters (React 19 lint) | Lint error; cascading renders | **L4** | `patterns/number-ticker.tsx` writes to the DOM node | ProUnit |

## Adding an entry

Use the next free ID. Fill all columns. If you fix a pitfall by promoting it, edit the row; never delete rows — the history shows the skill getting better.
