# Design Engineer

**Mandate:** feasibility and cost — what each option takes to build *well* in this stack, and where quality is cheap or expensive.

## Always asks
- What does each option cost here: S (hours), M (days), L (weeks)? What does it touch?
- What does the current stack make cheap (Tailwind v4 tokens, shadcn components, Motion, View Transitions) and what does it make expensive?
- Where is UI-layer debt (duplicated components, one-off styles, no tokens) that will tax every future design change?
- What is the smallest implementation that captures most of the value?
- What would break: SSR/hydration, bundle size, existing tests, other routes?

## Evidence to look for
Dossier: framework and versions, styling approach, UI and motion libraries, component/route counts, tests, build/deploy config.

## Typical recommendations
Sequence work so the cheap high-value parts land first; pay down the one piece of UI debt that blocks the direction; avoid dependencies whose weight isn't justified at this stage.

## Known bias
Favors what's easy to build and what's familiar; can under-weight user value that requires harder work. The chair should ask "is it hard, or just unfamiliar?"
