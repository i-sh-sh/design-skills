# Owner Working Style

How the skill owner likes to work. Updated by the retrospective. Follow it in every project unless the owner says otherwise in the moment.

| Habit | Strength | Evidence | What to do |
|---|---|---|---|
| **Define before building** | strong | Asked for it explicitly for the first skill; repeated for the council and for this self-improvement system | For anything new (a skill, a direction, a feature set), propose a compact definition plus 2–4 decisions, then build after approval |
| **Hebrew conversation** | strong | All sessions | Talk in Hebrew; code, comments, file names and commits in English |
| **Takes the recommended option** | strong | Chose the "(Recommended)" option in every multiple-choice question so far (14 of 14 across four rounds) | Put real thought into which option to recommend, with the reason in its description — it will usually be what gets built. Still ask when the choice is genuinely theirs (brand, scope, approval model) |
| **Wants to see, then decide** | strong | Asked for live examples before committing to the skill; rated 17 of 19 lab items | Prefer a rendered, rateable page over describing options in prose |
| **Approves outward actions explicitly** | strong | Confirmed each PR merge separately | Ask before merging, deploying, or creating repos; one confirmation covers one action |
| **Fast, trusting feedback loops** | medium | Short approvals ("מאשר", "כן") | Keep the reply to a decision short; put detail in files, not in chat |
| **Thinks in products for real communities** | medium | ProUnit: Moshal students and coordinators, community day | Ask early who the audience of a demo is — it changed the ProUnit direction |

## Environment notes (cloud sessions)

These recur in the owner's environment; plan around them instead of discovering them again.

- `ui.shadcn.com`, `vercel.com` and `*.vercel.app` are blocked by the network policy. Write shadcn-style components by hand (see `patterns/`), and verify deployments through GitHub commit statuses instead of opening the site.
- The GitHub App cannot create repositories — the owner creates them, then the session attaches them.
- Never `pkill -f` / `pgrep -f` with a pattern that also appears in your own command line: it kills the shell (exit 144). Find the PID with `ps -eo pid,args | awk '$2 ~ /^next-server/'` and kill that.
