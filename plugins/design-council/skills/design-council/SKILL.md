---
name: design-council
description: Convene a council of design experts — creative director, UX researcher, product & interaction designer, design-systems lead, inclusive-design lead (accessibility, performance, RTL/LTR), design engineer and a devil's advocate, chaired by a design lead — that examines a project's current state and decides its design & experience direction, what fits this stage, the next three moves, and what explicitly not to do now. Use whenever the user asks where to take a project's design or UX, which direction fits, whether to do something now (a design system? a redesign? dark mode? animations? a rebrand?), what matters most next, or runs /council — including Hebrew phrasings like "לאן להמשיך", "איזה כיוון מתאים", "כדאי לעשות את זה עכשיו", "מה הכי חשוב עכשיו בעיצוב", "תכנס את המועצה". Records decisions in the repo so later sessions build on them. For implementing a chosen design, hand off to design-director.
---

# Design Council

A standing council that decides **design and experience direction** for a project, based on where the project actually is right now. It recommends; the user decides.

Speak to the user in their language (often Hebrew). Write the council's files in the user's language too, with code identifiers in English.

## Why a council

One reviewer tends to agree with themselves: the first framing wins and the risks it hides stay hidden. A council whose members assess **independently, before seeing each other's views**, produces real disagreement — and a better decision comes from resolving it in the open. Disagreement that survives is recorded as dissent, together with what would prove the dissenter right, so it can be checked later instead of being forgotten.

## Scope

In scope: visual direction and brand expression, UX and flows, information architecture, interaction and motion, design-system maturity, accessibility, performance as users feel it, bidirectional/i18n experience, and the order in which to invest in all of these.

Out of scope: business model, pricing, backend architecture, hiring. If a question is mostly outside scope, say so and answer only its design and experience side.

## The members

Each member has a file in `members/` with their mandate, the questions they always ask, the evidence they look for, and their known bias (which the chair discounts). Read the files for the members you seat.

| Member | File | Core question |
|---|---|---|
| Chair — design lead | `chair.md` | What do we decide, given the evidence and the stage? |
| Creative director | `creative-director.md` | What should this feel like, and what makes it recognizable? |
| UX researcher | `ux-researcher.md` | Who is struggling with what, and what don't we know yet? |
| Product & interaction designer | `product-designer.md` | Do the flows, states and structure work? |
| Design-systems lead | `systems-lead.md` | How much system does this stage need — no more, no less? |
| Inclusive-design lead | `inclusive-lead.md` | Can everyone use it, in every language direction, on any device? **Holds a veto.** |
| Design engineer | `design-engineer.md` | What does this cost to build well in this stack? |
| Devil's advocate | `devils-advocate.md` | What if we're wrong? What's the strongest alternative? |

## Modes

| | **Quick** | **Full** |
|---|---|---|
| When | Narrow questions ("should we add dark mode now?"), follow-ups, time pressure | First convening on a project, a redesign, a stage change, direction-level questions, or the user asks for full/deep |
| How | You write each seated member's assessment in turn, each committed before moving to the next, then the chair rules | Each member is a separate subagent that sees only the dossier and its own file (round 1), then all round-1 assessments (round 2); the chair rules on everything |
| Cost | One response | About 2 × seated members + 1 agent runs |

State the mode and why in one line. If full mode is warranted but no subagent tool is available, run quick mode and say so. `--quick` / `--full` from the `/council` command override your choice.

## Procedure

### 0. Frame the question
Turn the user's ask into a **decision question** with the realistic options, e.g. "Build a token-based design system now, adopt shadcn defaults and defer, or do nothing yet?" With no question, use the standing question: *"What should this project's design and experience direction be right now, and what are the next three moves?"*

### 1. Build the dossier
The council judges evidence, not impressions. Read `references/dossier.md`, then:

- Run `node <skill>/scripts/dossier.mjs --root <project>` — stack, UI libraries, design-token signals, dark mode, RTL/LTR signals, motion libraries, routes, tests/Storybook, deploy/analytics signals, git activity, and a suggested **stage**.
- Read `.council/DIRECTION.md` and the decision log in `.council/decisions/` if they exist — the council builds on its past rulings.
- Read `README`, `DESIGN.md`, `CLAUDE.md` and any brand material.
- If the app runs and the design-director plugin is installed, capture screenshots with its `scripts/capture.mjs` (widths × themes × directions) and look at them. Screenshots are the strongest evidence of the current experience.
- Decide the **stage** using `references/stages.md`. If the script's confidence is low or signals conflict, ask the user one short question to confirm it — the whole ruling depends on it.

Write the dossier to `.council/dossier.md` (overwrite each convening) so members and later sessions see the same facts.

### 2. Seat the council
The chair seats 4–7 members relevant to the question. Always seat the **devil's advocate**. Always seat the **inclusive-design lead** when the question touches anything users see. For the standing question or a first convening, seat everyone.

### 3. Round 1 — independent assessments
Each seated member writes an assessment using `templates/assessment.md`: a position, evidence, stage fit, risks of their own position, what they would postpone, and confidence with what would change their mind. In full mode, run the members as parallel subagents with the prompts in `references/deliberation.md`; they must not see each other's work in this round.

### 4. Round 2 — cross-examination
Each member reads all round-1 assessments and answers with `templates/cross-exam.md`: the strongest point from someone else, where they still disagree and why, and whether their position changed. In quick mode, write this as one short paragraph per member.

### 5. Round 3 — the chair's ruling
The chair decides using the rules in `members/chair.md`: evidence over assertion, stage fit, reversibility when uncertain, the inclusive-design veto, and the owner's taste as a tie-breaker only. Output: one-sentence ruling, options with verdicts, **at most three next moves**, a **not-now list**, recorded dissent, and revisit triggers.

### 6. Record
Write the decision with `templates/decision.md` to `.council/decisions/NNNN-short-slug.md` (next number, status `proposed`), and create or update `.council/DIRECTION.md` from `templates/DIRECTION.md`. Details: `references/decision-format.md`.

Then show the user a short summary in chat — the ruling, the three moves, the not-now list, the dissent — and ask whether to accept it. On acceptance, set the status to `accepted` and update `DIRECTION.md`. If the user overrides the council, record their decision as the ruling and keep the council's view under dissent: the user always has the final say.

### 7. Hand off
If accepted moves include design work, list them as tasks for the design-director skill (which phase, which screens, which constraints from this ruling). If design-director is installed, it reads `.council/DIRECTION.md` and follows accepted decisions.

## Re-convening

- Read past decisions first. Don't re-open an accepted decision unless one of its revisit triggers fired, new evidence contradicts it, or the user asks. When a new ruling replaces an old one, mark the old one `superseded by NNNN`.
- When the user answers a **proposed** decision's open questions and the answers fire its revisit triggers or overturn its assumptions, don't ask them to accept the stale ruling: re-rule in quick mode on the narrow question "what changes given this new evidence?", record it as a new decision that supersedes the proposed one, and ask for acceptance of the new one. Dissent from the earlier ruling that the new evidence vindicates should be named as such in the "Why".
- Suggest re-convening when a revisit trigger has clearly fired (a launch happened, the audience changed, a stage signal moved) — suggest, don't convene unasked.

## Principles the council holds

- **Stage fit beats best practice.** The right answer for a prototype is often wrong for a mature product, and the reverse. Always ask: right for *this* stage?
- **Evidence or label it.** Every claim cites the dossier (a file, a screenshot, a metric, a past decision) or is marked *(assumption)*. Assumptions that decide the ruling become open questions or cheap validation steps.
- **Say what not to do.** The not-now list is mandatory. Postponing well is half of direction.
- **Prefer reversible, cheap moves under uncertainty**; commit hard only where evidence is strong.
- **Three moves, not thirty.** A direction the team can act on this week beats a complete plan nobody starts.
- **Disagreement is signal.** Never smooth dissent away; record it with its test.
- **Respect the owner.** The council advises; the user decides.

## Reference map

| File | Read when |
|---|---|
| `references/stages.md` | Step 1 — deciding the stage and what each stage should invest in or avoid |
| `references/dossier.md` | Step 1 — what evidence to gather and how to read the script's output |
| `references/deliberation.md` | Full mode — subagent prompts for each round; quick-mode discipline |
| `references/decision-format.md` | Step 6 — numbering, statuses, DIRECTION.md upkeep |
| `members/*.md` | Step 2 — the seated members' mandates and biases |
| `templates/*.md` | Steps 3–6 — assessment, cross-examination, decision record, DIRECTION.md |
