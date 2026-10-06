---
description: Run the design retrospective on this project — rate what was built and turn the lessons into skill improvements (proposed as a PR)
argument-hint: "[--since <git ref|YYYY-MM-DD>] [--mini]"
---

Run the design-director retrospective for this project, following `references/retrospective.md` of the design-director skill.

Arguments from the user: $ARGUMENTS

- `--since` limits the range of commits considered (default: the project's whole history, or since the last retro recorded in `owner/projects.md`).
- `--mini` skips the rating page: read the session for signals, update pitfalls, and propose the changes.

Never merge the resulting PR yourself — the owner approves it.
