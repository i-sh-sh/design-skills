# Deliberation

How the rounds run. The point of the structure is **independence first, then confrontation**.

## Full mode (subagents)

Run all round-1 members in parallel, in the same turn, so none can see another's output. Give each exactly this context and nothing else from the conversation:

### Round 1 prompt (one per seated member)

```
You are the <MEMBER NAME> on a design council for the project at <ROOT>.

Read, in this order:
1. <SKILL>/members/<member>.md — your mandate, questions and known bias
2. <ROOT>/.council/dossier.md — the shared facts
3. <SKILL>/references/stages.md — the section for stage <STAGE>
You may also open project files and screenshots the dossier points to.

The council's question: <QUESTION>
Options on the table: <OPTIONS>

Write your assessment using <SKILL>/templates/assessment.md. Rules:
- Take a clear position. "It depends" is not a position.
- Cite dossier evidence for each claim, or mark it (assumption).
- Judge fit for stage <STAGE>, not in general.
- Name the risks of your own position and what would change your mind.
- Stay within your mandate; you'll see the others' views later.
Write in <LANGUAGE>. Return only the assessment (max ~350 words).
```

### Between rounds
Write all round-1 assessments, labeled by member, to `.council/round1.md` (in the user's language). Round-2 members read that one file instead of receiving the text inline — it keeps prompts short and guarantees every member sees exactly the same record. The decision record's appendix links to it.

### Round 2 prompt (one per seated member, again in parallel)

```
You are the <MEMBER NAME> on the design council, now in round 2 (cross-examination).
Read: <SKILL>/members/<member>.md, <ROOT>/.council/dossier.md, and <ROOT>/.council/round1.md (all round-1 assessments, including yours).

Using <SKILL>/templates/cross-exam.md:
- Name the strongest point another member made — especially one that challenges you.
- Say where you still disagree, and what evidence would settle it.
- State your updated position (unchanged, or revised and why).
Write in <LANGUAGE>, max ~180 words.
```

### Round 3 — chair
You (the main session) act as chair: read `members/chair.md`, all assessments and cross-examinations, and write the ruling with `templates/decision.md`. The chair's reasoning should reference members by role ("the design engineer's cost estimate…").

**Cost note:** full mode runs about 2 × seated + 1 agent passes. For reference, the first real convening (7 seated, Hebrew, empty repo) took 14 subagent runs of roughly 50k tokens each, about 30–45 seconds per round. It was worth it there: 6 of 7 members revised their position in round 2, and the adopted structure (the project page as base unit) came from the devil's advocate — something quick mode would likely have missed. Tell the user the mode before starting; for a narrow question, quick mode is almost always enough.

## Quick mode (single session)

Discipline matters more here, because one mind writes every voice:

1. Write each member's round-1 assessment **in sequence, committing to it before starting the next** — don't revise earlier members after reading later ones.
2. Write the devil's advocate **last** in round 1, attacking whatever position is leading.
3. Round 2: one or two sentences per member responding to the others.
4. The chair rules.

Keep each assessment short (5–8 lines). Quick mode trades independence for speed — say so in the decision record's `Mode` field.

## Showing the deliberation

In chat, don't paste every assessment. Show: the question, the seated members, each member's one-line position (a small table), the ruling, the three moves, the not-now list and the dissent. The full text lives in the decision record's appendix.
