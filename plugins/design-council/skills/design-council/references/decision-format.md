# Decision Records

The council's memory lives in the project, in git, so every later session — and every human — sees the same history.

## Layout

```
.council/
├── DIRECTION.md            living summary: stage, principles, current direction, not-now, open questions
├── dossier.md              facts for the latest convening (overwritten each time)
└── decisions/
    ├── 0001-initial-direction.md
    ├── 0002-dark-mode-timing.md
    └── ...
```

- Numbering: four digits, next free number; slug in English kebab-case (file names stay ASCII even when content is Hebrew).
- One decision per file. Never edit an accepted decision's ruling; supersede it with a new one.

## Statuses

| Status | Meaning |
|---|---|
| `proposed` | Council ruled; waiting for the user |
| `accepted` | The user accepted (possibly with changes, recorded in the file) |
| `rejected` | The user declined; keep the file — the reasoning is still useful |
| `superseded by NNNN` | A later decision replaced it |

## DIRECTION.md upkeep

Rewrite it (from `templates/DIRECTION.md`) whenever a decision is accepted or superseded:

- **Stage** and date confirmed.
- **Primary user and job** — one line each.
- **Experience principles** — 3–5, each a sentence a designer could apply to a new screen.
- **Current direction** — visual and experience direction in a short paragraph, with a link to the decision that set it.
- **Accepted decisions** — index with one line each.
- **Not now** — the merged not-now lists of accepted decisions, each with its revisit trigger.
- **Open questions** — unknowns the council flagged, with the cheapest way to answer each.
- **Last convened** — date, question, mode.

Keep it under ~80 lines. It is what other skills (design-director) read first.

## Git

Commit `.council/` changes with a message like `council: 0003 ruling on onboarding flow (proposed)`, only when the user asks for commits in this session or the repo's conventions say so. Screenshots referenced in a dossier stay out of git unless the user wants them (design-director keeps them in `.design/`).
