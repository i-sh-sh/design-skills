# Council Calibration

What the council has learned from how its rulings were received. Updated by the design-director retrospective (and after any ruling the owner accepts, overrides or that gets superseded). The chair reads this before every ruling.

## Lessons (apply these)

| ID | Lesson | Evidence | Applied where |
|---|---|---|---|
| C-001 | **Ask who the next milestone is for before convening full mode.** An unknown audience made 0001's brand ruling wrong; one answer from the owner overturned it the next day. | ProUnit 0001 → 0002 | `SKILL.md` step 1 (dossier): ask about audience when unknown |
| C-002 | **Dissent about "who will judge this" deserves extra weight.** The creative director's and the devil's advocate's dissent ("neutral will look 'not ours' to coordinators") was the part that turned out right. | ProUnit 0001 dissent vindicated in 0002 | Chair rule 8 |
| C-003 | **The devil's advocate's structural alternatives are worth adopting.** "Project page as the base unit" was adopted by every member in round 2 and survived into the build. | ProUnit 0001 round 2 | Keep the "name what's missing" duty strong |
| C-004 | **Full mode on an empty repo still pays off** when the question is direction-level: 6 of 7 members revised in round 2. | ProUnit 0001 | `references/deliberation.md` cost note |
| C-005 | **Quick mode is enough for a narrow re-ruling** driven by new owner answers. | ProUnit 0002 (accepted unchanged) | `SKILL.md` re-convening rule |
| C-006 | **Don't rule out the owner's +2 taste silently.** 0003 put the kinetic headline and scroll effects (both +2) on the not-now list for stage fit; the next day the owner asked for "extreme" motion and 0004 reversed it. The creative director's dissent ("the feed will feel static") was the part that was right. Stage-fit restraint is right for an audience you can't ask; this owner is reachable, so ask. | MoshLab 0003 → 0004 | Chair rule 7; `SKILL.md` step 6 |
| C-007 | **Naming is the owner's call, not a ruling.** The branding convening recommended keeping the working name; the owner parked it, then picked "MoshLab · Where Ideas Become Projects" themselves (with their PM). For product names, show options on a page and ask; don't open a decision PR until there is a pick. | MoshLab branding (PR #6) | This lesson; `references/decision-format.md` (`parked`) |
| C-008 | **Reserve decision numbers across parallel threads.** Branding (PR #6) and motion were both written as 0004 in parallel. | MoshLab | `references/decision-format.md` numbering |
| C-009 | **Build the cheap moves with the ruling.** 0003 was accepted in one word once its implementation was in the same PR; 0004 waited 8 days for acceptance and was accepted at merge. | MoshLab 0003, 0004 | `SKILL.md` step 6 |

## Owner decision patterns

- Accepts the council's recommended option when the reasoning is shown (0002 accepted as is).
- Chooses design-and-experience scope for the council (not business or tech).
- Provides decisive context in short answers (audience, permission, language). Ask the question directly instead of hedging around the unknown.
- Wants more expression than the council's stage-fit default: overrode the minimal-motion limits of 0003 within a day (MoshLab).
- Decides on built results: accepts at merge, with screenshots in front of them.
- Moves on rather than rejecting: an unanswered proposal is parked, not refused.
- Brings outside product input (a PM spec, a new name) mid-project; treat it as a revisit trigger for the brief, not as a design correction.

## Ruling log

| Project | Decision | Mode | Stage | Ruling (short) | Outcome | Vindicated dissent |
|---|---|---|---|---|---|---|
| ProUnit | 0001 | full (7) | 0 → 1 | Neutral-intentional scaffold, bidirectional, project page as base unit | Superseded before acceptance by owner answers | Creative director, devil's advocate (audience = coordinators) |
| ProUnit | 0002 | quick (7) | 0 → 1 | Moshal product, Hebrew-only RTL, accessible mobile-first, two flows framed by the community day | Accepted unchanged; built and deployed | — (pending: post-demo feedback) |
| MoshLab | 0003 | quick (7) | 1 | Polish inside the Moshal brand; the bridge between institutions is the only delight; no kinetic headline, confetti or rounded corners | Accepted unchanged ("מאשר") with its build in PR #5; motion clauses superseded the next day by 0004 | Creative director (kinetic headline / static feed) |
| MoshLab | branding (PR #6, numbered 0004) | quick (7) | 1 | Sub-brand of Moshal; keep the name ProUnit, "bridge" mark | Parked by the owner; owner later chose the name MoshLab themselves | Inclusive lead + devil's advocate wanted a new name now (partly vindicated: the name changed) |
| MoshLab | 0004 | owner request | 1 | "Motion with a body": swipe deck, draggable sheet, tilt, kinetic headline, scroll-driven effects; a11y rules kept | Accepted at merge (2026-10-15) | — |

## Updating this file

After each ruling's outcome is known: add a log row; if the outcome teaches something general (not just about one project), add a lesson with the next C-ID and apply it where it belongs (`SKILL.md`, a member file, `references/`) in the same change. Don't delete rows.
