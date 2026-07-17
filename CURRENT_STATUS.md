# EraByEra — Current Status

**Status:** Foundation implementation — F9 implemented; owner browser verification pending
**Last updated:** 2026-07-17
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This file records what is actually implemented today. It must remain factual
> and must be reviewed after every repository-relevant agent iteration.

---

## 1. Current Development Phase

EraByEra is a Git repository on `main`. F1 is committed at `e80b4a6`, F2 at `44867c5`, F3 at `1a9fa5d`, F4 at `2fe64a7`, F5 at `78ef489`, F6 at `89bb5ea`, F7 at `5c8d61e`, and F8 at `3c06c6c`. F9 — Polities and Territory Layers is implemented in the local working tree; owner external-browser verification remains pending.

F9 establishes the first time-changing area layer using clearly synthetic data: selected-year polity and territory presentation, uncertainty-aware native MapLibre fills and boundaries, typed URL selection, overlap preservation, compact polity details, missing-geometry behavior, and visible source references. F8 place behavior remains integrated above territories.

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

### F4 — Source Data and Runtime Build Pipeline — Complete and committed

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

### F5 — Physical MapLibre Shell — Implemented; owner verification pending

Implemented:

- `maplibre-gl` 5.24.0 and `react-map-gl` 8.1.1 through the MapLibre-only entry point;
- repository-managed physical style and local Natural Earth land, coastline, lake, and river GeoJSON;
- Eastern Mediterranean initial viewport at longitude 28, latitude 37, zoom 3.5;
- standard map interaction and restrained navigation controls without geolocation;
- visible MapLibre and Natural Earth attribution;
- non-blocking loading feedback and recoverable map-specific retry state;
- responsive full-height map integration under the existing application shell;
- six pure F5 tests covering viewport, attribution, local sources, physical-only layers, forbidden categories, and remote/style exclusions;
- basemap license, provenance, exact asset hashes, production terms, and manual verification documentation.

Automated and static acceptance criteria pass. F5 is not marked fully browser-verified because the requested no-browser constraint leaves actual WebGL rendering, interaction, visual layer inspection, responsiveness, and console checks to the owner in ordinary Chrome or Edge.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 4 files, 177 tests;
- F5 structural style audit: PASS — 6 tests;
- `npm run data:validate`: PASS — 12 canonical synthetic records;
- `npm run data:check`: PASS;
- `npm run build`: PASS — MapLibre emits a non-blocking large-chunk warning;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F6 — URL-Synchronized Map State — Implemented; owner verification pending

Implemented:

- one typed `MapUrlState` and centralized defaults using F2 historical years and the F5 viewport;
- strict parsing, safe normalization, deterministic serialization, canonicalization, and canonical-share URL helpers;
- Web Mercator-safe latitude and F5 zoom clamping, finite-number rejection, negative-zero normalization, and controlled coordinate precision;
- stable future layer identifiers with absent-versus-empty semantics and canonical ordering;
- typed `type:id` entity references and collection IDs validated with the F3 entity-ID schema without runtime resolution;
- preservation and deterministic ordering of unrelated query parameters;
- React Router integration with replace-on-canonicalization, replace-on-map-movement, push-capable explicit updates, and Back/Forward restoration by location state;
- controlled F5 map synchronization that writes only on `moveend` and suppresses equivalent updates;
- 50 pure F6 tests without a DOM or MapLibre renderer.

Automated and static acceptance criteria pass. URL/map behavior remains pending owner verification in an ordinary external browser under the requested no-browser constraint.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 5 files, 227 tests;
- `npm run data:validate`: PASS — 12 canonical synthetic records;
- `npm run data:check`: PASS;
- `npm run build`: PASS — MapLibre emits a non-blocking large-chunk warning;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F7 — Timeline Controls — Implemented; owner verification pending

Implemented:

- visible F2-formatted selected year with URL state as the only committed source of truth;
- positive magnitude plus explicit BCE/CE direct input, Apply/Enter commit, Escape restoration, and announced validation errors;
- previous/next year and previous/next selected-step actions using F2 zero-free movement;
- local step sizes `1`, `5`, `10`, `25`, `50`, and `100` with no URL or local-storage expansion;
- native slider covering 1000 BCE through 1000 CE through a zero-free ordinal mapping;
- honest out-of-range behavior that retains valid direct years while clamping only the slider presentation;
- replace-only F6 year updates that preserve viewport, layers, selection, collection, and unrelated parameters;
- responsive bottom-map overlay with attribution clearance, touch-sized mobile controls, native keyboard operation, labels, focus states, live year output, and accessible range text;
- 57 pure model tests without DOM or browser infrastructure.

Automated and static acceptance criteria pass. Rendered layout, actual control interaction, viewport preservation, responsive usability, and console behavior remain pending owner verification in ordinary Chrome or Edge.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 6 files, 284 tests;
- `npm run data:validate`: PASS — 12 canonical synthetic records;
- `npm run data:check`: PASS;
- `npm run build`: PASS — MapLibre emits a non-blocking large-chunk warning;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F8 — Place Layer and Place Cards — Implemented; owner verification pending

Implemented:

- bundled generated-runtime loading through the F4 schema/version/deep-freeze boundary with loading, atomic error, retry, and no-active-place states;
- three clearly synthetic published place fixtures proving default activity, period names, low-zoom hiding, and inactive selection;
- pure F2-based activity, name, ownership, importance, nearest-year, presentation, and source-aggregation selectors;
- centralized importance thresholds from zoom 1.5 through 5.5 and null no-importance visibility;
- compact deterministic GeoJSON with stable IDs and no full records or source objects;
- one local MapLibre place source, five native importance circle layers, and a selected highlight layer without glyphs or remote data;
- click/pointer interaction, push-history typed place selection, empty-map place clearing, and refresh/Back-compatible URL restoration;
- selected-place override across inactivity, zoom, and disabled `places` layer state;
- compact responsive details with period-aware facts, uncertainty, source references, unresolved/missing-location handling, and inactive-year actions;
- reusable F2 historical-range formatting;
- 94 new F8/time tests, bringing the suite to 378 tests in 9 files.

Automated and static acceptance criteria pass. Runtime loading in the actual browser, marker rendering, interaction, responsive panel behavior, and browser console checks remain pending owner verification.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 9 files, 378 tests;
- `npm run data:validate`: PASS — 14 canonical synthetic records;
- `npm run data:build` twice: PASS — deterministic output;
- `npm run data:check`: PASS;
- `npm run build`: PASS — MapLibre emits a non-blocking large-chunk warning;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F9 — Polities and Territory Layers — Implemented; owner verification pending

Implemented:

- pure F2-based polity activity, capital, ruler, active-territory, nearest-year, presentation, and selected-year evidence selectors;
- three synthetic territory periods proving an immediate period change, overlapping default-year claims, Polygon and MultiPolygon geometry, approximate/disputed styling, and an active-but-unmapped polity year;
- deterministic compact territory GeoJSON sourced from the immutable generated F4 runtime boundary;
- one native MapLibre source with normal fill, solid and dashed boundary, selected fill, and non-color-only selected boundary layers beneath F8 places;
- typed push-history polity selection, URL restoration, owned-selection clearing, selected override when `territories` is disabled, and explicit place-click priority;
- compact responsive polity card with activity, existence, capitals, rulers, current control/confidence, evidence, inactive actions, and active-but-unmapped messaging;
- 69 new selector, geometry, overlap, selection, source, and layer tests, bringing the suite to 447 tests in 11 files.

Automated and static acceptance criteria pass. Actual WebGL territory rendering, clicks, overlap hit behavior, responsive panel layout, and browser console checks remain pending owner verification in ordinary Chrome or Edge.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 11 files, 447 tests;
- `npm run data:validate`: PASS — 16 canonical synthetic records;
- `npm run data:build` twice with hash comparison: PASS — three byte-identical artifacts;
- `npm run data:check`: PASS;
- `npm run build`: PASS — MapLibre emits the known non-blocking large-chunk warning;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F10–F18 — Planned

Not started. F10 — Events and Battle Model is next after owner verification confirms the F9 territory/polity flow. See `FOUNDATION_IMPLEMENTATION_PLAN.md` for the approved sequence.

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
- The physical basemap is a local MapLibre style using only public-domain Natural Earth 1:110m land, coastline, lake, and river vectors.
- F5 uses no external tile provider, provider account, token, glyphs, sprites, modern political boundaries, or settlement/transport labels.
- The URL is the reproducible source of map-navigation state; the map keeps a local controlled camera for responsive interaction and commits only on `moveend`.
- URL defaults are year `-334`, the F5 viewport, `territories`/`places`/`events`, and no selected entity or collection.
- Finite out-of-range viewport values clamp; malformed and non-finite values fall back safely. Coordinates serialize to six decimals and zoom to two.
- Map movement and URL canonicalization replace history; explicit future navigation updates can push history.
- Timeline year is URL-owned; only draft magnitude, era, and step size are local component state.
- All timeline transitions reuse F2 zero-free movement, and every F7 year update uses F6 history replacement.
- The foundation slider spans 1000 BCE–1000 CE; valid F2 years outside it remain selected and visible.
- Browser UI consumes only validated, immutable generated runtime data; editable source files remain pipeline-only.
- Place activity/name/ownership/importance presentation is F2-derived, and normal visibility requires active existence plus active importance.
- Place importance 5–1 maps to minimum zoom 1.5, 2.5, 3.5, 4.5, and 5.5; explicit selection overrides zoom, inactivity, and layer-disabled state.
- Place selection uses typed F6 references and push history; map and timeline movement retain their replace policies.
- Polity existence is independent from territory geometry; active-but-unmapped and inactive selected polities retain an honest card without a fabricated polygon.
- Active territory periods generate separate deterministic Polygon/MultiPolygon features. Overlapping claims remain separate, while rendered feature order determines the practical click target; cycling overlaps is deferred.
- Normal territory rendering obeys the `territories` URL layer. An explicitly selected polity keeps only its active mapped geometry visible as an override when that layer is disabled.
- Places render above territory fills and receive explicit click priority. Territory control groups use fill opacity plus solid/dashed boundaries, and selection adds a wide light outline.
- Polity evidence prioritizes active territory, capital, and ruler references before entity references; inactive period evidence is excluded.
- All entity temporal fields reuse `src/domain/time`; no second time model exists.
- Zod and Vitest remain the only domain validation/testing dependencies.

---

## 4. Known Limitations and Risks

- F4 has only synthetic fixtures; real historical content still requires reviewed sources, licensing, and attribution.
- Runtime loading is currently bundled and aggregate; a validation failure disables all historical runtime presentation rather than partially loading records.
- Competing temporal interpretations cannot yet coexist in canonical fixture files because the current schema has no explicit variant/claim grouping.
- Published-source enforcement checks coverage presence, not whether the referenced source exists or is editorially adequate.
- Fixtures are synthetic structure examples, not publishable historical data.
- Only places and territories are rendered; no playback, people, events, journeys, collection UI, search, or full entity pages exist yet.
- Overlapping claims render separately, but F9 offers no click cycling when multiple polygons occupy the same point.
- Natural Earth 1:110m vectors are intentionally generalized and become coarse at close zoom; F5 caps zoom at 7.
- Actual WebGL load, pan/zoom, responsive rendering, visual forbidden-layer review, and browser console checks remain pending owner verification.
- Direct application URLs still require a static-host fallback; no hosting provider is configured.

---

## 5. Nearest Next Steps

1. Complete the F5–F9 owner external-browser checks for map/timeline rendering, place and territory visibility, selection, cards, URL restoration, and responsive layout.
2. Review and commit F9 when ready.
3. Begin F10 — Events and Battle Model only after browser verification confirms the territory/polity flow is stable.
4. Keep all current historical-layer fixtures unmistakably synthetic.

---

## 6. Maintenance Rule

Review this document at the end of every repository-relevant iteration. Keep current-state sections synchronized with reality, record ordinary work under Recent Changes, and preserve lasting decisions or completed milestones under Significant Changes.

Only report validation that actually ran.

---

## Recent Changes — Rolling Three-Month History

### 2026-07-17 — Implemented F9 polity and historical territory flow

- Connected generated polity metadata and territory geometry to selected-year selectors, native uncertainty-aware MapLibre fills/boundaries, typed URL selection, and a responsive sourced polity card.
- Expanded only synthetic fixtures to prove period change, overlap, Polygon/MultiPolygon geometry, and active-but-unmapped behavior; added 69 tests, with owner browser verification pending.

### 2026-07-17 — Implemented F8 place layer and compact place cards

- Connected validated generated runtime data to selected-year place selectors, native MapLibre layers, typed URL selection, and responsive detail/source presentation.
- Expanded the synthetic fixture minimally to three published places and added 94 loader, selector, visibility, GeoJSON, selection, source, layer, and formatting tests; owner browser verification remains pending.

### 2026-07-17 — Implemented F7 historical timeline controls

- Added visible selected-year display, BCE/CE direct input, one-year and stepped navigation, and a zero-free 1000 BCE–1000 CE slider over the map.
- Routed all commits through F2 and F6, added responsive/accessibility behavior and 57 pure tests; owner external-browser verification remains pending.

### 2026-07-17 — Implemented F6 URL-synchronized map state

- Added centralized, validated, canonical URL state and React Router synchronization for year, viewport, future layers, selected entity, and collection.
- Connected the F5 camera at `moveend`, preserved unrelated parameters and meaningful history, and added 50 pure tests; owner external-browser verification remains pending.

### 2026-07-17 — Implemented F5 physical MapLibre shell

- Replaced the map placeholder with a responsive MapLibre map, local Natural Earth physical vectors, standard navigation, visible attribution, and recoverable loading/error behavior.
- Added pure style/configuration audits and complete basemap licensing and operational documentation; owner external-browser verification remains pending.

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

### 2026-07-17 — First time-changing historical area layer established

- EraByEra now derives separate active territory interpretations from the URL year and renders them as native MapLibre geometry without collapsing overlapping claims.
- Polity existence remains independent of mapping, while control category, uncertainty, source evidence, selected override, and missing geometry stay explicit.
- Why it matters: future historical area layers have a tested, evidence-aware pattern that avoids false precision and modern-boundary substitution.

### 2026-07-17 — First complete historical-entity flow established

- EraByEra now carries a place from deterministic generated data through immutable browser validation, temporal presentation, native map rendering, URL selection, evidence display, and restoration.
- Selection overrides normal visibility without changing year or viewport, while inactive state, uncertainty, missing coordinates, and unresolved evidence remain explicit.
- Why it matters: later entity layers can follow a proven data-to-map-to-card boundary without hardcoding history into React or bypassing source evidence.

### 2026-07-17 — First visible historical-time navigation established

- EraByEra now exposes its central historical dimension through one URL-owned selected year and a zero-free BCE/CE control model.
- Direct input remains broader than the bounded slider, and all manual navigation replaces history while preserving the map state.
- Why it matters: future historical layers can react to one tested visible year contract without duplicating time, input, or navigation semantics.

### 2026-07-17 — Public map URL contract established

- Map navigation now has one typed, canonical query contract that reuses F2 year rules, F3 IDs, and F5 viewport limits.
- Canonical URLs preserve unrelated parameters, restore through React Router history, and separate future references from runtime-data resolution.
- Why it matters: timeline, layer, selection, collection, and sharing milestones can extend one reproducible state boundary instead of inventing incompatible navigation state.

### 2026-07-17 — Self-contained physical basemap selected

- EraByEra now owns a token-free MapLibre style backed by repository-hosted public-domain Natural Earth physical vectors rather than an external demo or commercial tile service.
- Modern political boundaries, settlement/transport labels, cultural sources, glyphs, and sprites are excluded by construction and audited structurally.
- Why it matters: later historical layers have a stable, legally documented, backend-free physical canvas without provider quotas or accidental modern political context.

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
