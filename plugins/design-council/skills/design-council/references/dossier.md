# The Dossier

Every member judges the same facts. The dossier collects them once, in `.council/dossier.md`.

## Contents
1. **Question** — the decision question and its options.
2. **Stage** — suggested stage, signals, confidence; confirmed by the user if needed.
3. **Project facts** — from `scripts/dossier.mjs`.
4. **Experience evidence** — screenshots (paths) and what they show; critical flows observed.
5. **Written context** — README/DESIGN.md/CLAUDE.md excerpts about purpose and audience; brand material.
6. **History** — `.council/DIRECTION.md` summary and past decisions (number, title, status, revisit triggers).
7. **Owner taste** — pointer to the taste profile if one exists (chair and creative director use it; it's a tie-breaker, not evidence).
8. **Unknowns** — what the dossier could not establish. Members should not fill these with confident guesses.

## Running the script

```bash
node <skill>/scripts/dossier.mjs --root .                 # markdown to stdout
node <skill>/scripts/dossier.mjs --root . --json          # machine-readable
node <skill>/scripts/dossier.mjs --root . --out .council/dossier.facts.md
```

It never modifies the project. It reads `package.json`, config files, source files (skipping `node_modules`, build output and large files) and `git log`.

## Reading the signals

| Signal | What it suggests |
|---|---|
| Physical vs logical spacing classes (`ml-*` vs `ms-*`) | RTL readiness; high physical count + Hebrew support = inclusive-design issue |
| Hard-coded hex colors vs token usage (`@theme`, CSS variables, `oklch(`) | System maturity and drift |
| `components.json`, `@radix-ui/*` | shadcn/ui base; cheap consistency |
| `.storybook/`, visual tests | Stage 4 practices present |
| `next-themes`, `dark:` usage | Dark-mode status |
| `next-intl` / `i18next`, `dir=` handling | Multi-language and direction support |
| `motion`, `framer-motion`, `gsap`, `lenis`, `three`, `@react-three/fiber` | Motion ambitions and bundle weight |
| `prefers-reduced-motion` / `motion-reduce:` | Motion accessibility |
| Deploy config (Vercel, Netlify, Docker) + analytics deps | Real users; stage ≥ 2 |
| Commit count, contributors, age | Maturity and team size |

Signals are hints. A screenshot or a user's statement outranks a heuristic.
