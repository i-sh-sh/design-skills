# Owner Working Style

How the skill owner likes to work. Updated by the retrospective. Follow it in every project unless the owner says otherwise in the moment.

| Habit | Strength | Evidence | What to do |
|---|---|---|---|
| **Define before building** | strong | Asked for it explicitly for the first skill; repeated for the council and for this self-improvement system | For anything new (a skill, a direction, a feature set), propose a compact definition plus 2–4 decisions, then build after approval |
| **Hebrew conversation** | strong | All sessions | Talk in Hebrew; code, comments, file names and commits in English |
| **Takes the recommended option** | strong | Chose the "(Recommended)" option in every multiple-choice question so far (14 of 14 across four rounds) | Put real thought into which option to recommend, with the reason in its description — it will usually be what gets built. Still ask when the choice is genuinely theirs (brand, scope, approval model) |
| **Wants to see, then decide** | strong | Asked for live examples before committing to the skill; rated 17 of 19 lab items | Prefer a rendered, rateable page over describing options in prose |
| **Approves outward actions explicitly** | strong | Confirmed each PR merge separately; in MoshLab merged PRs #4, #5, #7, #8 with one word each ("מזג") | Ask before merging, deploying, or creating repos; one confirmation covers one action. "מזג" means: check CI on the latest commit, then merge |
| **Decides on the built thing, not the proposal** | strong | MoshLab: accepted council 0003 after its implementation was shown in the same PR; accepted 0004 only after merging its build | Ship the decision record and its implementation together, with screenshots, and ask for acceptance once, at merge. Don't park the work waiting for "accept" on a paper ruling |
| **Moves on instead of rejecting** | medium | MoshLab: "עזוב את המיתוג" left the branding proposal (PR #6) open; later chose the name MoshLab on their own | When the owner switches topic, mark the open proposal as parked in its PR/decision, and don't count it as rejected |
| **Wants more motion than a restrained default** | medium | MoshLab: asked for an "extreme" upgrade of touch, swipe and animation one day after the council limited motion (0003 → 0004) | When a brief leaves room, offer an expressive motion option next to the restrained one instead of ruling it out |
| **Fast, trusting feedback loops** | medium | Short approvals ("מאשר", "כן") | Keep the reply to a decision short; put detail in files, not in chat |
| **Thinks in products for real communities** | medium | ProUnit: Moshal students and coordinators, community day | Ask early who the audience of a demo is — it changed the ProUnit direction |

## Environment notes (cloud sessions)

These recur in the owner's environment; plan around them instead of discovering them again.

- `ui.shadcn.com`, `vercel.com` and `*.vercel.app` are blocked by the network policy. Write shadcn-style components by hand (see `patterns/`), and verify deployments through GitHub commit statuses instead of opening the site.
- The GitHub App cannot create repositories — the owner creates them, then the session attaches them.
- A changed network policy or environment applies only to sessions started after the change. A thread that was blocked before keeps its old environment: start a new thread instead of retrying.
- `git push` from a cloud session sometimes fails with GitHub 500 (MoshLab, 2026-10-07). Fall back to the GitHub MCP `push_files` / `create_or_update_file` tools rather than retrying the push in a loop.
- Vercel preview URLs are behind Vercel login by default; the production deployment is public. To share with someone outside the team, merge to main or use Vercel's Share link.
- Never `pkill -f` / `pgrep -f` with a pattern that also appears in your own command line: it kills the shell (exit 144). Find the PID with `ps -eo pid,args | awk '$2 ~ /^next-server/'` and kill that.
