# EraByEra — Current Status

**Status:** Foundation implementation — F4 complete locally
**Last updated:** 2026-07-17
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This file records what is actually implemented today. It must remain factual
> and must be reviewed after every repository-relevant agent iteration.

---

## 1. Current Development Phase

EraByEra is a Git repository on `main`. F1 is committed at `e80b4a6`, F2 at `44867c5`, and F3 at `1a9fa5d`. F4 — Source Data and Runtime Build Pipeline is complete in the local working tree and has not been committed.

F4 adds canonical repository JSON/GeoJSON, complete graph validation, deterministic published-only runtime generation, committed manifests/indexes, and a browser-safe immutable loader. All content remains obvious synthetic fixture data. The visible application remains unchanged; no real historical content, map integration, or backend was added.

---

## 2. Foundation Milestone Status

### F1 — Application Shell and Routing — Complete and committed

React, TypeScript, Vite, React Router, shared shell, route placeholders, error handling, and responsive styling are established.

### F2 — Historical Time Domain — Complete and committed

Committed at `44867c5`: zero-free BCE/CE years, inclusive temporal ranges, explicit unknown-end semantics, date precision, Zod schemas, and focused tests.

### F3 — Domain Schemas and Validation Foundation — Complete and committed

Implemented:

- schema version `1` and dataset-version validation;
- lowercase, URL-safe, language-neutral entity IDs;
- strict Source and SourceReference schemas;
- editorial statuses and shared published-source enforcement;
- categorical confidence, location accuracy, and territory-control metadata;
- validated `[longitude, latitude]` coordinates;
- distinct Place, Polity, TerritoryPeriod, Person, HistoricalEvent, Battle, Journey, and ContentCollection schemas;
- time-dependent place, polity, person, and journey-stage records that reuse F2 schemas;
- inclusive temporal-overlap and missing-reference helpers;
- synthetic representative fixtures only;
- stable public exports from `src/domain/entities/index.ts`;
- 66 new F3 tests, bringing the suite to 121 passing tests in 2 files.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 2 files, 121 tests;
- `npm run build`: PASS;
- `git diff --check`: PASS;
- browser checks: NOT RUN — F3 is domain-only and does not alter visible UI behavior.

### F4 — Source Data and Runtime Build Pipeline — Complete locally

Implemented:

- explicit versioned wrappers in `data/source/` and bounded territory/journey GeoJSON in `data/geometry/`;
- synthetic-only canonical fixtures with globally unique top-level IDs;
- aggregate strict-schema, dataset-version, cross-reference, overlap, and geometry validation;
- deterministic published-only `runtime.json`, reference `index.json`, and manifest with counts and SHA-256 fingerprint;
- read-only stale-output checking and byte-stable generation without timestamps;
- browser-safe runtime validation and deep-frozen loading in `src/data`;
- `data:validate`, `data:build`, and `data:check` commands using Node-only TypeScript scripts;
- 50 focused pipeline tests, bringing the suite to 171 passing tests in 3 files.

Validation on 2026-07-17:

- `npm run data:validate`: PASS — 12 canonical synthetic records;
- `npm run data:build` twice with hash comparison: PASS — byte-identical output;
- `npm run data:check`: PASS;
- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 3 files, 171 tests;
- `npm run build`: PASS;
- `git diff --check`: PASS;
- browser checks: NOT RUN — F4 changes data/tooling boundaries and no visible UI behavior.

### F5–F18 — Planned

Not started. See `FOUNDATION_IMPLEMENTATION_PLAN.md` for the approved sequence.

---

## 3. Current Technical Decisions

- Canonical source-data objects use strict Zod schemas; unknown fields fail rather than being silently stripped.
- Entity IDs contain lowercase letters, digits, and single hyphens only. They do not require type prefixes or UUIDs.
- Common metadata is limited to genuinely shared identity, name, editorial status, and summary fields. Entity-specific fields remain in distinct schemas.
- Published entity records require at least one SourceReference. Draft, reviewed, and deprecated records may be structurally valid without one.
- Sources are bibliographic records and do not self-reference to satisfy the published-source rule.
- Uncertainty remains categorical rather than percentage-based.
- Coordinates are always `[longitude, latitude]` with geographic bounds.
- Place importance and Person importance use an explicit integer scale from 1 to 5.
- Battle is a specialized member of the HistoricalEvent union and requires structured sides and result details.
- Journey stages must appear in a unique sequential order beginning at 1.
- Content collections use grouped entity IDs and require their recommended start year inside a closed collection range.
- Top-level entity IDs are globally unique across types so reference-index and future untyped-selection keys are unambiguous.
- Canonical source and geometry are editable; committed generated files are derived and never hand-edited.
- Validation covers every editorial state, while public runtime output includes only `published` records and referenced geometry.
- Generated output is deterministic, has no timestamps, and is fingerprinted with SHA-256.
- Place name, ownership, importance, and polity-capital overlaps are rejected until competing interpretations receive an explicit schema representation.
- All entity temporal fields reuse `src/domain/time`; no second time model exists.
- Zod and Vitest remain the only domain validation/testing dependencies.

---

## 4. Known Limitations and Risks

- F4 has only synthetic fixtures; real historical content still requires reviewed sources, licensing, and attribution.
- The runtime loader exists but is not yet connected to screens or map layers.
- Competing temporal interpretations cannot yet coexist in canonical fixture files because the current schema has no explicit variant/claim grouping.
- Published-source enforcement checks coverage presence, not whether the referenced source exists or is editorially adequate.
- Fixtures are synthetic structure examples, not publishable historical data.
- No timeline, URL year state, map state, entity UI, search, or runtime data loading exists yet.
- Direct application URLs still require a static-host fallback; no hosting provider is configured.

---

## 5. Nearest Next Steps

1. Review and commit F4 when ready.
2. Begin F5 using the generated runtime boundary rather than canonical authoring files.
3. Select and license a physical basemap before public map integration.
4. Keep the synthetic fixture isolated from future reviewed historical datasets.

---

## 6. Maintenance Rule

Review this document at the end of every repository-relevant iteration. Keep current-state sections synchronized with reality, record ordinary work under Recent Changes, and preserve lasting decisions or completed milestones under Significant Changes.

Only report validation that actually ran.

---

## Recent Changes — Rolling Three-Month History

### 2026-07-17 — Implemented F4 static data pipeline

- Added versioned synthetic canonical JSON/GeoJSON, aggregate validation, deterministic committed runtime artifacts, a reference index/manifest, and browser-safe immutable loading.
- Added 50 pipeline tests plus operational commands and synchronized architecture, product-rule, deployment, and current-state documentation.

### 2026-07-17 — Implemented F3 validated entity contracts

- Added strict modular schemas, synthetic fixtures, published-source enforcement, and pure reference/overlap validation helpers.
- Added 66 tests covering valid and invalid entity structures without adding UI, real content, or pipeline behavior.
- Updated architecture and current-state documentation; product rules and operational commands remain unchanged.

### 2026-07-17 — Implemented F2 historical time domain

- Added centralized historical-year movement and formatting, inclusive temporal-range utilities, explicit unknown-end policy, and date-precision validation.
- Added Zod and Vitest with 55 passing tests.

### 2026-07-17 — Recovered and completed F1 application foundation

- Established and verified the application shell, routes, error states, and responsive styling.

---

## Significant Changes — Permanent History

### 2026-07-17 — Canonical-to-runtime data boundary established

- Canonical authoring data now lives in versioned `data/source` and `data/geometry` files; application consumers use deterministic published-only output through `src/data`.
- Complete-dataset validation now enforces globally unique IDs, reference integrity, explicit overlap policy, and matching GeoJSON before generation.
- Why it matters: future UI/map work has one reproducible, reviewable, backend-free data contract and cannot accidentally publish drafts or import Node-only pipeline code.

### 2026-07-17 — Stable historical-entity schema contract established

- Historical entities now have distinct strict runtime schemas with stable IDs, explicit uncertainty, source coverage rules, bounded coordinates, and reusable F2 temporal fields.
- Battle remains compatible with HistoricalEvent, while time-dependent Place, Polity, Person, and Journey records retain specialized contracts.
- Why it matters: F4 and later UI/map milestones can validate and consume one stable model instead of inventing incompatible entity shapes.

### 2026-07-17 — Historical time semantics centralized in F2

- BCE is negative, CE is positive, zero is invalid, temporal boundaries are inclusive, and unknown ends require explicit interpretation.

### 2026-07-17 — F1 application shell and routing established

- EraByEra gained its first working React/Vite application foundation and stable route boundaries.

### 2026-07-10 — Mandatory post-iteration CURRENT_STATUS review

- `CURRENT_STATUS.md` must be reviewed after every repository-relevant iteration.
- Recent minor history is rolling; significant changes are retained permanently.

---

## Guiding Rule

**This file describes reality, not intention.**
