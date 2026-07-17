# EraByEra — Current Status

**Status:** Foundation implementation — F2 complete locally
**Last updated:** 2026-07-17
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This file records what is actually implemented today. It must remain factual
> and must be reviewed after every repository-relevant agent iteration.

---

## 1. Current Development Phase

EraByEra is a Git repository on `main`. F1 — Application Shell and Routing is committed at `e80b4a6`. F2 — Historical Time Domain is complete in the local working tree and has not yet been committed.

The application foundation still provides the shared shell, routes, error handling, and responsive styling established in F1. F2 adds a UI-independent, tested domain module for historical years, date precision, and temporal ranges. No visible application behavior changed.

---

## 2. Foundation Milestone Status

### F1 — Application Shell and Routing — Complete and committed

Implemented in `e80b4a6`:

- React, TypeScript, and Vite application scaffold;
- React Router shell and `/map`, `/explore`, and `/sources` routes;
- root redirect, not-found handling, and error recovery;
- responsive design-token-based layout and accessible navigation.

### F2 — Historical Time Domain — Complete locally

Implemented:

- centralized validation for non-zero signed historical years;
- BCE/CE formatting;
- previous, next, and arbitrary historical-year movement that skips year zero;
- date precision values: `exact`, `year`, `approximate`, `decade`, `century`, `range`, `before`, `after`, and `unknown`;
- Zod schemas for historical years, date precision, and temporal ranges;
- inclusive temporal-range activity and intersection utilities;
- explicit opt-in handling for unknown ends as open-ended;
- deterministic nearest-year behavior that returns `null` when an unknown end cannot support a later result;
- a stable public API from `src/domain/time/index.ts`;
- a non-browser Vitest setup with 55 domain tests.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 1 test file, 55 tests;
- `npm run build`: PASS;
- `git diff --check`: PASS;
- browser checks: NOT RUN — F2 is domain-only and does not alter visible UI behavior.

### F3 — Domain Schemas and Validation Foundation — Next

Not started. F3 introduces distinct validated entity contracts without adding real historical content or a universal optional-field model.

### F4–F18 — Planned

Not started. See `FOUNDATION_IMPLEMENTATION_PLAN.md` for the approved sequence.

---

## 3. Current Technical Decisions

- The application stack is React + TypeScript + Vite + React Router.
- npm is the package manager and `package-lock.json` is maintained alongside dependency changes.
- Historical years are signed JavaScript safe integers: BCE is negative, CE is positive, and zero is invalid.
- Historical movement counts real displayed years, so transitions go directly between `-1` and `1`.
- Closed temporal ranges use inclusive boundaries.
- `yearTo: null` means unknown or unsupplied and is not ongoing by default. Consumers must explicitly pass `treatUnknownEndAsOpenEnded` when that interpretation is valid.
- Zod provides runtime validation for the historical-time domain.
- Vitest provides non-browser unit testing; `npm run test` is non-interactive and `npm run test:watch` is available for local development.
- Domain code is independent from React and exported through `src/domain/time/index.ts`.
- Routing uses `createBrowserRouter`; static hosting must provide an `index.html` fallback for application routes.
- MapLibre, Zustand, historical entities, and the data pipeline remain absent until their owning milestones.
- Design materials under `design/` are read-only references.

---

## 4. Known Limitations and Risks

- F2 operates at whole-year precision; day/month calendars and conversion are out of scope.
- An unknown range end deliberately prevents default activity and later nearest-year conclusions. Each future domain model must choose open-ended semantics explicitly where appropriate.
- No timeline, year input, URL year state, map state, entities, or real historical data exist yet.
- Direct application URLs require a static-host rewrite/fallback to `index.html`; no hosting provider is configured.
- Browser-only F1 route refresh, Back/Forward behavior, rendered layout, and console state still require owner verification.
- Basemap source, license, attribution, and hosting provider remain later decisions.

---

## 5. Nearest Next Steps

1. Review and commit F2 when ready.
2. Begin F3 — Domain Schemas and Validation Foundation.
3. Reuse the F2 historical-year, precision, and range schemas in entity contracts rather than duplicating time logic.
4. Keep real historical records and the runtime data pipeline out of F3.
5. Continue the approved sequence in `FOUNDATION_IMPLEMENTATION_PLAN.md`.

---

## 6. Maintenance Rule

Review this document at the end of every repository-relevant iteration. Keep current-state sections synchronized with reality, record ordinary work under Recent Changes, and preserve lasting decisions or completed milestones under Significant Changes.

Only report validation that actually ran. Do not treat planned scripts, deployment, or browser checks as complete.

---

## Recent Changes — Rolling Three-Month History

<!-- Newest first. Keep approximately three months. -->

### 2026-07-17 — Implemented F2 historical time domain

- Added centralized historical-year movement and formatting, inclusive temporal-range utilities, explicit unknown-end policy, and date-precision validation.
- Added Zod and a minimal Vitest setup with 55 passing domain tests.
- Updated architecture and operational documentation without changing visible application behavior or approved product rules.

### 2026-07-17 — Recovered and completed F1 application foundation

- Recovered the interrupted React/Vite application without discarding valid work.
- Verified the router, shell, route placeholders, error states, responsive CSS, and design-token adaptation.
- Confirmed typecheck, lint, and production build passed; browser validation was intentionally omitted during recovery.

### 2026-07-10 — Iteration-level CURRENT_STATUS maintenance introduced

- Required agents to review and update `CURRENT_STATUS.md` after every repository-relevant iteration.
- Added rolling recent-change and permanent significant-change history sections.

---

## Significant Changes — Permanent History

<!-- Newest first. Never delete entries merely because of age. -->

### 2026-07-17 — Historical time semantics centralized in F2

- EraByEra now represents BCE years as negative safe integers and CE years as positive safe integers, with zero invalid and skipped by all movement utilities.
- Temporal ranges are inclusive; unknown ends remain unknown and require explicit opt-in before they are treated as open-ended.
- Why it matters: all future schemas, selectors, layers, URLs, and search behavior must reuse this module so historical boundaries cannot drift between features.

### 2026-07-17 — F1 application shell and routing established

- EraByEra gained its first working application foundation: React, TypeScript, Vite, React Router, shared navigation, route placeholders, responsive styling, and safe error states.
- Why it matters: later milestones can build on stable screen boundaries without re-scaffolding the project.

### 2026-07-10 — Mandatory post-iteration CURRENT_STATUS review

- `CURRENT_STATUS.md` must be reviewed after every iteration that changes or discovers repository state, decisions, code, data, configuration, documentation, or validation.
- Recent minor history is retained for approximately three months; significant changes are retained permanently.

---

## Guiding Rule

**This file describes reality, not intention.**
