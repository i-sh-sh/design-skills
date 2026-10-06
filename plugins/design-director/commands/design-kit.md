---
description: Install the design-director quality guardrails into this project (bidi lint, contrast check, CI, Vercel framework pin)
argument-hint: "[--dry-run]"
---

Install the design-director kit into the current project:

1. Run `node <design-director skill dir>/kit/install-kit.mjs --root . $ARGUMENTS` and show what it added and skipped.
2. Run `npm run check` and report the result. Fix any failures that come from the kit's own checks (physical left/right classes, `dir="auto"` on text fields, token contrast) — or list them for the user if the fix touches files they own.
3. Mention which `patterns/` would fit this project (see the skill's `patterns/README.md`).
