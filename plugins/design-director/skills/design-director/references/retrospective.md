# Retrospective — How the Skill Improves Itself

After every project (or major milestone), the skill turns what happened into durable improvements to itself. The owner approves every change. This is the mechanism that makes each project start from a higher floor than the last.

## Contents
1. Why it compounds
2. When to run it
3. Step 1 — Gather facts
4. Step 2 — Read the session for signals
5. Step 3 — The rating page
6. Step 4 — Turn signals into changes
7. Step 5 — Propose the changes (PR)
8. Step 6 — Measure the trend
9. Guardrails

---

## 1. Why it compounds

Five things accumulate, and each makes the next project better by default:

| Store | Grows by | Effect on the next project |
|---|---|---|
| `owner/taste-profile.md` | Weighted preferences with evidence | First proposals already match the owner; fewer "not for me" |
| `references/pitfalls.md` | Lessons climbing the ladder (note → rule → check → component) | Mistakes that happened once can't happen again |
| `patterns/` | Loved components, generalized | Less code written from scratch; proven motion/a11y/bidi by default |
| `owner/projects.md` | Metrics per project | You can see whether quality is actually improving — and where it isn't |
| Council calibration (`design-council/learning/calibration.md`) | How rulings were received | Rulings land closer to what the owner accepts |

The goal per project: **higher first-pass quality, fewer critique rounds, more issues caught by checks instead of by eye, more patterns reused.** If a metric stops improving, the retrospective's job is to find out why.

## 2. When to run it

- **Suggest it (one line, don't run unasked)** when a milestone lands: a PR merged to the main branch, a successful production deploy, the end of a council-planned move, or the owner says the project or phase is done ("סיימנו", "זה מוכן").
- **Run it** when the owner agrees, or invokes `/design-retro`.
- Small task (one component, a quick fix)? Do a **mini-retro**: only step 2 and pitfall updates, no rating page.

## 3. Step 1 — Gather facts

```bash
node <skill>/scripts/retro.mjs --root <project> [--since <ref or YYYY-MM-DD>]
```

It reports commits, areas changed, patterns in use, guardrail status (and runs the checks), screenshots on disk, council decisions and **candidate components** for `patterns/`. Read `owner/projects.md` for the previous project's metrics to compare against.

## 4. Step 2 — Read the session for signals

The richest evidence is the conversation itself. Scan it and list, with a quote or pointer for each:

| Signal | Example | Usually updates |
|---|---|---|
| Owner corrected a design decision | "פחות קפיצי", "make the header lighter" | taste-profile (−1 on what was changed, +1 on the replacement) |
| Owner rejected an option or a proposal | Chose against the recommendation | taste-profile / working-style |
| Owner accepted without changes | "מאשר" on a direction | taste-profile (+1, capped) |
| A bug found in critique by eye | Arrow flipped, field LTR | pitfalls (new or promotion) |
| A bug a check caught | Contrast failed | pitfalls metrics (good — the ladder works) |
| Environment friction | Blocked host, missing token | owner/working-style "Environment notes" |
| Something written twice | Same helper in two places | candidate pattern / kit script |
| Council ruling outcome | Accepted / overridden / superseded | design-council calibration |

Be honest about what **you** got wrong: those are the entries that make the next project better.

## 5. Step 3 — The rating page

Pick 6–15 items the owner can judge by looking: each main screen, the signature element, motion patterns used, the chosen direction, any new effect. For each:

1. Screenshot it as JPEG (smaller pages): `capture.mjs --url … --selector … --format jpeg --quality 70 --out .design/retro`.
2. Write `.design/retro/items.json` (`id`, `title`, `description`, `category`, `kind`, `image`). Descriptions say what's distinctive in one line, in the owner's language.
3. Build: `node <skill>/scripts/build-rating-page.mjs --items .design/retro/items.json --out .design/retro/rating.html --title "<project> · רטרוספקטיבה"`.
4. Publish with the Artifact tool, `capabilities: {"db": {}}`. Give the owner the link; ask them to write "סיימתי" when done.
5. Read ratings with the artifact data tool: collection `feedback` (`verdict`: love | no | null, `note`).

No artifact tool in this environment? Ask one multi-select question ("which of these did you love?") plus one free-text question for notes.

## 6. Step 4 — Turn signals into changes

Prepare the concrete edits:

- **Taste** (`owner/taste-profile.md`): move weights one step per signal, with evidence "<project> retro: loved/rejected/changed". New preference → start at ±1 (±2 only with an explicit rating). Keep a project's *brand* out of the owner's taste: "Moshal blue" is the project's, not the owner's.
- **Working style** (`owner/working-style.md`): new habits only when seen at least twice, or stated explicitly.
- **Pitfalls** (`references/pitfalls.md`): add new entries; **promote** every pitfall that recurred or was caught only by eye. If promotion to L3/L4 is feasible, implement it in the same change (extend `kit/check-logical.mjs`, add a pattern, fix a template).
- **Patterns** (`patterns/`): extract components that were loved (or reused twice) and are not project-specific; generalize, typecheck, add to the index with their weight.
- **Workflow** (SKILL.md, references): when a step of the workflow itself failed or was skipped for a good reason, fix the instruction — and explain the why in the text.
- **Council** (`design-council/learning/calibration.md`): log each ruling's outcome.
- **Project log** (`owner/projects.md`): add the entry with metrics (newest first).

## 7. Step 5 — Propose the changes (PR)

All changes go through the owner:

1. Get a checkout of the skills repo (`i-sh-sh/design-skills`). In a cloud session, attach it (add-repo) and clone; locally, use the existing clone.
2. Branch `retro/<project>-<YYYY-MM-DD>`, commit the edits, bump plugin versions (minor for new patterns/checks, patch for profile-only changes).
3. Validate: `claude plugin validate .`; typecheck any new pattern; run any changed kit script on a sample.
4. Open a PR whose body is a table **change → evidence** (quote the signal), grouped by store, plus the metrics comparison. Tell the owner in one paragraph what will be different next project.
5. Merge only after the owner approves.
6. After the merge, refresh the account copy: run `node scripts/package-skills.mjs` in the skills repo and send the owner the zips from `dist/`, with one line: replace `design-director` and `design-council` in claude.ai → Settings → Capabilities → Skills. Until they do, other projects keep the previous version.

If the skills repo can't be reached, write the full proposal and a patch to `<project>/.design/retro/proposal.md` and tell the owner where it is.

## 8. Step 6 — Measure the trend

In the PR and in `owner/projects.md`, compare with the previous project:

| Metric | Previous | This | Trend |
|---|---|---|---|
| First-pass issues | | | |
| Caught by checks / by eye | | | |
| Critique rounds | | | |
| Owner corrections | | | |
| Patterns reused | | | |
| Owner rating (loved share) | | | |

If a metric got worse, say why and what the PR changes about it. "Exponential" means each project's learnings are applied *before* the next one starts — check that the previous retro's promotions actually prevented their pitfalls this time.

## 9. Guardrails

- The owner approves every change; never merge a retro PR yourself.
- One project moves a taste weight by at most one step (two only with an explicit rating), so a single project can't overfit the profile.
- Never store personal data about third parties (end users, colleagues) or secrets in the skill. Project names and public context are fine.
- Keep entries short and specific; delete nothing from the pitfalls registry or the project log (history is the point).
- A retro that finds nothing to change is a valid result — say so instead of inventing changes.
