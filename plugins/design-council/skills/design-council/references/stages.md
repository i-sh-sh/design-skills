# Project Stages — What Fits Now

The same question has different right answers at different stages. Decide the stage first; it filters every option.

## Detecting the stage

| Stage | Typical signals |
|---|---|
| **0 · Idea** | Empty or near-empty repo; no routes; no users; the purpose may not even be written down |
| **1 · Prototype** | A few routes; library defaults; no tests; no deploy or a preview deploy; changes weekly; used by the team or a handful of testers |
| **2 · MVP** | Core flow complete; deployed; first real users; some analytics; UI inconsistencies appearing |
| **3 · Growth** | Users arriving steadily; marketing pages matter; several contributors; drift across screens; requests for new features compete with polish |
| **4 · Mature** | Many screens and contributors; tests and CI; design debt is the main cost of change; consistency and accessibility compliance matter |
| **R · Redesign / rebrand** | A mature or growth product whose direction no longer fits (new audience, new brand, accumulated debt) — a transition, not a starting point |

The dossier script suggests a stage from signals; confirm it with the user whenever confidence is low. A project can be at different stages on different surfaces (a mature app with a brand-new marketing site) — then rule per surface.

## What each stage should invest in — and avoid

### 0 · Idea
- **Goal:** know what the experience is for and what it should feel like.
- **Invest:** one line on the primary user and their job; 3–5 experience principles; a direction chosen quickly from 2–3 options (design-director phase 2); one critical flow sketched.
- **Avoid:** design systems, component libraries, motion polish, dark mode, marketing pages.
- **Typical first moves:** write DIRECTION.md principles · pick a direction · prototype the critical flow.

### 1 · Prototype
- **Goal:** learn fast whether the core flow works.
- **Invest:** off-the-shelf components (shadcn/ui) with a minimal token layer so the direction is visible; the critical flow end to end; cheap user tests.
- **Avoid:** custom component libraries, Storybook, elaborate motion, a second theme, pixel perfection on screens that may be deleted.
- **Rule of thumb:** anything that takes longer than the screen it decorates is premature.

### 2 · MVP
- **Goal:** the core flow works for real users and feels trustworthy.
- **Invest:** full states (empty/loading/error) on the critical flow; the token layer (design-director phase 3); the product-mode motion kit; accessibility of core flows; both language directions if both are supported; a landing page with one signature moment.
- **Avoid:** a documented design system, rebranding, showcase effects beyond the landing hero, 3D.

### 3 · Growth
- **Goal:** scale the experience without it fragmenting; win new users.
- **Invest:** core components on tokens used everywhere; a consistency pass across screens; marketing/showcase pages (design-director showcase mode); onboarding; dark mode if the audience expects it; performance on mid-range phones.
- **Avoid:** heavy governance, a full redesign, effects that slow product routes.

### 4 · Mature
- **Goal:** keep quality high as many people change the product.
- **Invest:** documented components (Storybook), visual-regression tests, contribution rules, accessibility compliance audits, design-debt paydown, a design-system roadmap.
- **Avoid:** big-bang redesigns; one-off screens outside the system; adding a second design language.

### R · Redesign / rebrand
- **Goal:** move to a new direction without breaking what works.
- **Invest:** an audit (design-director phase 1) of what to keep; the new direction proven on one high-traffic surface first; tokens that let old and new coexist; an incremental migration plan by surface.
- **Avoid:** rewriting everything at once; changing structure and visuals in the same step for the core flow; losing features during the move.

## Common stage mistakes the council should catch
- Building a stage-4 design system in stage 1 (systems-lead bias).
- Polishing marketing before the core flow works (creative-director bias).
- Researching indefinitely when a reversible move would teach more (UX-researcher bias).
- Treating accessibility as a stage-4 concern — core flows must be accessible from MVP on.
- Launching a redesign to fix what is really an execution or consistency problem.
