# EraByEra вЂ” AI Agent Operating Guide

**Status:** Active
**Last updated:** 2026-07-10
**Applies to:** Cursor, Codex, Claude Code, ChatGPT, and other AI coding agents
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This document is mandatory reading for any AI agent working on EraByEra.
> The owner works on several unrelated projects. Every prompt and every substantive response must clearly identify this project and repository.

---

## 1. Primary Rule

**Never assume you are in the correct repository. Verify repository context before inspecting or editing code.**

Expected context:

```text
Project: EraByEra
Repository: erabyera
Repository path: C:\Projects\erabyera
Remote: https://github.com/jeehead-cloud/erabyera.git
Expected branch: main
```

If the actual repository, path, remote, or branch does not match, stop and report the mismatch.

---

## 2. Required Repository Context Block in Prompts

Every implementation prompt should begin with:

```text
Repository context

Project: EraByEra
Repository: erabyera
Repository path: C:\Projects\erabyera
Remote: https://github.com/jeehead-cloud/erabyera.git
Expected branch: main

Current state

<Describe known working-tree state, or say "Expected working tree: clean".>

Task

<One clearly scoped task.>

Before making changes, verify:
- current working directory
- repository root
- git remote -v
- current branch
- git status --short
- changed files match the stated current state
```

---

## 3. Mandatory Repository Verification

Run or verify the equivalent of:

```powershell
Get-Location
git rev-parse --show-toplevel
git remote -v
git branch --show-current
git status --short
```

### Stop conditions

Stop before editing if:

- repository root is not `C:\Projects\erabyera`;
- the prompt references another project;
- branch differs from the expected branch without explicit instruction;
- unexpected uncommitted changes exist;
- the task depends on files or data that are not present;
- configured remote does not match `https://github.com/jeehead-cloud/erabyera.git`.

---

## 4. Required Header in Agent Responses

Every substantive implementation response must begin with:

```text
Repository context

Project: EraByEra
Repository: erabyera
Repository path: C:\Projects\erabyera
Remote: https://github.com/jeehead-cloud/erabyera.git
Branch: <actual value>
Working tree: <clean / dirty>
```

If dirty, list changed files immediately.

---

## 5. Scope Discipline

### One prompt = one logical task

Examples:

- add URL persistence for selected year;
- render place markers for the selected year;
- add Zod validation for journey paths;
- fix territory visibility at boundary years.

Do not combine unrelated product work, refactoring, dependency upgrades, and documentation cleanup in one change unless explicitly requested.

### One commit = one logical change

Do not commit or push unless explicitly requested.

### Do not silently expand scope

Report adjacent issues instead of fixing them, unless they block the requested task.

---

## 6. Before Editing Code

For non-trivial tasks:

1. read `PROJECT.md`, `CURRENT_STATUS.md`, and the relevant specialized document;
2. inspect actual source files before proposing changes;
3. trace the complete data flow: source file в†’ validation в†’ selectors в†’ map layer в†’ detail panel;
4. search for an existing utility or pattern before adding a new one;
5. confirm temporal boundary semantics (`yearFrom` / `yearTo`) before changing filters;
6. verify map-library coordinate order вЂ” GeoJSON uses `[longitude, latitude]`, while many UI APIs expose `[latitude, longitude]`;
7. use a small script or automated check for geometry, date-range, and data-integrity changes.

Do not guess the current architecture from these documents if the repository differs.

---

## 7. Architecture Principles

Read `ARCHITECTURE.md` before structural changes. Key constraints:

- historical content lives in versioned data files, not hardcoded React components;
- raw data is validated before use;
- map rendering uses MapLibre layers and sources rather than hundreds of independent React DOM markers where possible;
- selected year, filters, and selected entity are client UI state;
- URL state must remain shareable and reproducible;
- there is no backend in the MVP;
- historical facts must not be generated or silently вЂњcompletedвЂќ by an AI agent.

---

## 8. Product and Data Rules

Read `PRODUCT_RULES.md` before changing behavior or schemas.

Especially important:

- date ranges are inclusive unless explicitly documented otherwise;
- unknown is not the same as zero, empty, or false;
- uncertain dates and locations must remain uncertain in the data model;
- a city, polity, or person may have multiple time-dependent records;
- modern borders and modern labels must not leak into historical layers;
- each factual record needs at least one source before being treated as production content;
- disputed historical claims must not be flattened into a single definitive statement without metadata.

---

## 9. Historical Content Safety

AI agents may help structure, transform, or validate supplied historical data, but must not:

- invent citations;
- invent coordinates or exact dates and present them as verified;
- silently copy contemporary state borders into historical periods;
- use unsourced AI output as canonical project data;
- rewrite disputed claims as settled facts;
- automatically ingest third-party data without checking its license and attribution requirements.

When facts are missing, use explicit placeholders such as `null`, `unknown`, or a documented TODO.

---

## 10. Validation

Standard checks after non-trivial code changes:

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npm run data:validate
```

Only report `PASS` for commands actually run successfully. Use `NOT RUN` otherwise.

If the repository does not yet contain one of these scripts, do not claim it exists. Add scripts only when requested or required by the task.

For visual map changes, also report manual verification separately:

- map opens;
- pan/zoom works;
- selected year updates layers;
- browser console has no new errors;
- URL reload restores state when relevant.

---

## 11. Root Cause Before Fix

For defects, explain why the behavior occurred.

Good:

> A polity disappeared one year too early because the selector treated `yearTo` as exclusive, while the project data contract defines both boundaries as inclusive.

Weak:

> Fixed polity dates.

---

## 12. Required Completion Summary

```text
Repository context

Project: EraByEra
Repository: erabyera
Repository path: C:\Projects\erabyera
Remote: https://github.com/jeehead-cloud/erabyera.git
Branch: <actual value>
Working tree: <clean / dirty>

Design / Root cause
<explanation>

Files changed
- path/to/file

Behavior
- what changed
- what stayed unchanged
- limitations / edge cases

Validation
- npm run typecheck: PASS / FAIL / NOT RUN
- npm run lint: PASS / FAIL / NOT RUN
- npm run test: PASS / FAIL / NOT RUN
- npm run build: PASS / FAIL / NOT RUN
- npm run data:validate: PASS / FAIL / NOT RUN
- manual browser check: PASS / FAIL / NOT RUN

Documentation maintenance
- CURRENT_STATUS.md: UPDATED / REVIEWED вЂ” NO UPDATE REQUIRED
- Recent change recorded: YES / NO
- Significant change recorded: YES / NO
- Significant-change rationale: <short explanation, or "Not applicable">

Commit
- hash and message, or "Not committed"
```

An iteration is not complete until the `CURRENT_STATUS.md` review described in section 13 has been performed.

---

## 13. Documentation Updates

Update the specialized documents when their domain changes:

- roadmap or product scope в†’ `PROJECT.md`;
- current implementation and next steps в†’ `CURRENT_STATUS.md`;
- data or behavior invariants в†’ `PRODUCT_RULES.md`;
- stack, folders, schema, technical decisions в†’ `ARCHITECTURE.md`;
- hosting, environment, release workflow в†’ `DEPLOYMENT.md`.

Important decisions must not remain only in chat history.

### Update after every iteration

At the end of every user-request iteration, before presenting the final completion summary, the agent must review `CURRENT_STATUS.md` and update it when the iteration produced any relevant new information.

A completed Cursor iteration means every user prompt that results in repository inspection, decisions, code changes, data changes, configuration changes, documentation changes, or validation.

This requirement applies even when:

- the iteration contains only documentation changes;
- implementation is incomplete;
- validation fails;
- an issue is discovered but not fixed;
- the agent makes a project decision or records an owner decision;
- no source code was changed, but the factual project state changed.

Do not add empty, repetitive, or purely conversational entries. If an iteration truly produced no repository-relevant information, explicitly state in the completion summary that `CURRENT_STATUS.md` was reviewed and no update was required.

### Two-level change history

`CURRENT_STATUS.md` maintains two categories of changes.

#### Recent changes

Recent changes are ordinary implementation details and smaller improvements that may be useful for near-term continuity but do not need to be preserved forever.

Examples:

- minor UI adjustments;
- small refactors;
- routine bug fixes;
- validation improvements;
- dependency or configuration adjustments;
- small documentation corrections;
- temporary known issues;
- incremental data additions.

Rules:

- record recent changes in a dated, newest-first section in `CURRENT_STATUS.md`;
- retain approximately the latest three months;
- entries older than three months may be removed during normal documentation maintenance;
- before removing an old entry, confirm that it is not a significant change and that any still-relevant factual state is already represented elsewhere in the documentation;
- group related small changes from one iteration into one concise entry rather than creating a noisy file-by-file log.

#### Significant changes

Significant changes are decisions or developments that future agents must understand permanently.

Examples:

- completed or materially redefined milestones;
- architecture or technology-stack decisions;
- changes to core product behavior or product scope;
- data-model or schema changes with lasting consequences;
- changes to historical-data rules or temporal semantics;
- introduction or removal of major subsystems;
- deployment architecture changes;
- major incidents and their reusable root-cause lessons;
- important owner decisions;
- changes that make older assumptions or documentation invalid.

Rules:

- the agent must independently assess whether each iteration contains a significant change;
- significant changes must be recorded in a separate permanent, dated, newest-first section in `CURRENT_STATUS.md`;
- significant-change entries must never be deleted merely because they are old;
- significant entries may only be corrected, clarified, consolidated without loss of meaning, or explicitly marked as superseded;
- when superseded, preserve the old decision and link it to the newer decision;
- significant changes should explain the decision or outcome and why it matters, not merely list modified files.

### Classification rule

When uncertain whether a change is significant, use this test:

> Would a future AI agent risk making a wrong architectural, product, historical-data, deployment, or roadmap decision if this change were forgotten?

If yes, classify it as significant.

The same iteration may produce both:

- a concise recent-change entry describing implementation details; and
- a permanent significant-change entry describing the lasting decision or outcome.

Avoid duplicating identical text across the two sections.

### Current-state synchronization

The change history does not replace the main current-state sections.

After every iteration, also update the relevant factual sections of `CURRENT_STATUS.md`, including when applicable:

- current development phase;
- milestone status;
- implemented functionality;
- known issues and limitations;
- decisions already made;
- open decisions;
- nearest next steps;
- validation or deployment status.

Remove or correct statements that are no longer true. `CURRENT_STATUS.md` must describe current reality, not become only a chronological changelog.

---

## 14. Final Safety Rule

**If repository context, historical facts, source quality, licensing, task scope, or working-tree state is ambiguous, stop before making destructive or broad changes. Use explicit unknowns rather than plausible inventions.**
