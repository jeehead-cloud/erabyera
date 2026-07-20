# EraByEra — Current Status

**Status:** Foundation implementation — F17 implemented; owner browser verification pending
**Last updated:** 2026-07-20
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This file records what is actually implemented today. It must remain factual
> and must be reviewed after every repository-relevant agent iteration.

---

## 1. Current Development Phase

EraByEra is a Git repository on `main`. F1–F12 are committed through `2afcfb8`. F13–F17 are implemented in the current working tree; owner external-browser verification remains pending.

F15 adds stable full-page routes for all five implemented entity types and compact Explore catalogs. Pages retain entity-specific chronology and evidence while sharing layout, sources, relations, recovery, and map navigation. Catalog filters are URL-owned, reuse F14 search and relevant-year logic, include unmapped records honestly, and never import editable data.

F17 replaces the public collection's demonstration membership with a reviewed Granicus vertical slice: two polities, four places, Alexander III and Darius III, one disputed-location battle, one schematic Hellespont-to-Granicus journey, and two low-confidence contextual territories. Retained fixtures are explicitly classified and remain outside the public collection. Search indexes authored aliases and shows fixture classification; source conflict and geometry decisions are documented in `docs/research/GRANICUS_F17.md`.

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

### F10 — Events and Battle Model — Implemented; owner verification pending

Implemented:

- pure F2-based event activity, location-integrity, relation, evidence, nearest-year, generic presentation, and specialized battle selectors;
- three published synthetic events proving an exact mapped political event, an approximate mapped two-side battle, and an inactive-by-default unknown-location event selectable through URL;
- battle side polity/person/commander resolution, structured result/outcomes, disputed note, and related synthetic campaign presentation without invented force or loss values;
- deterministic compact point GeoJSON, one native MapLibre event source, ordinary/uncertain/battle layers, and a non-color-only selected highlight between territories and places;
- typed push-history event selection, disabled-layer and inactive mapped overrides, unknown-location card-only behavior, and centralized place → event → territory click priority;
- compact accessible responsive event card with specialized battle sections, location honesty, relations, sources, unresolved state, and inactive-year actions;
- 86 new event, layer, and pipeline tests, bringing the suite to 533 tests in 13 files.

Automated and static acceptance criteria pass. Actual WebGL marker rendering, click behavior, cards, responsive layout, refresh/Back behavior, and browser console checks remain pending owner verification in ordinary Chrome or Edge.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 13 files, 533 tests;
- `npm run data:validate`: PASS — 18 canonical synthetic records;
- `npm run data:build` twice with hash comparison: PASS — three byte-identical artifacts;
- `npm run data:check`: PASS;
- `npm run build`: PASS — MapLibre emits the known non-blocking large-chunk warning;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F11 — People and Active-Place Representation — Implemented; owner verification pending

Implemented:

- pure F2-based life, active PersonPlacePeriod, primary-location, visibility, relation, evidence, and nearest-year selectors;
- three synthetic people proving bounded birth, default-year aggregation, location change, alive-but-unmapped state, and outside-life selection;
- one primary marker location chosen by campaign → rule → activity → residence → visit → birth → death → unknown while retaining all active relationships;
- importance 5–1 zoom thresholds of 1.5, 2.5, 3.5, 4.5, and 5.5 without changing F8 place importance;
- deterministic Place-ID aggregation, compact GeoJSON, native individual/aggregate/selected MapLibre layers between events and places, and place → person → event → territory priority;
- typed push-history person selection, selected mapped overrides, no false marker for unmapped selection, and an accessible aggregate chooser using person URLs rather than a new aggregate entity type;
- responsive person card with life/mapped distinctions, active relationships, relations, evidence, and deterministic life/mapped-year actions;
- 75 new person and layer tests, bringing the suite to 608 tests in 15 files.

Automated and static acceptance criteria pass. Actual marker rendering, aggregate ring interaction, chooser/card layout, refresh/Back behavior, and browser console checks remain pending owner verification.

Validation on 2026-07-17:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 15 files, 608 tests;
- `npm run data:validate`: PASS — 19 canonical synthetic records;
- `npm run data:build` twice with hash comparison: PASS;
- `npm run data:check`: PASS;
- `npm run build`: PASS — known MapLibre chunk warning only;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F12 — Journeys and Campaign Routes — Implemented; owner verification pending

Implemented:

- pure F2-based journey activity, nearest-year, geometry-availability, stage, relation, participant, evidence, and presentation selectors;
- three published synthetic journeys proving campaign, expedition, single-year unmapped movement, LineString/MultiLineString, documented/unknown direction, probable/schematic/uncertain certainty, Place/Event stages, and Person/Polity participants;
- deterministic compact route GeoJSON sourced only from generated F4 geometry, with selected inactive and disabled-layer overrides but no fabricated line for unmapped journeys;
- one native MapLibre route source with solid documented/probable, dashed schematic/uncertain, active selected, and inactive selected line layers between territories and point features;
- typed push-history journey selection, URL restoration, centralized place → person → event → journey → territory click priority, and empty-map clearing for all implemented selections;
- responsive Journey card with activity/mapping distinction, explicit direction status, ordered stages, participants, relations, uncertainty, journey/stage evidence, and deterministic journey-year actions;
- 60 new selector, pipeline, GeoJSON, style, order, interaction, selection, relation, and evidence tests, bringing the suite to 668 tests in 17 files.

Automated and static acceptance criteria pass. Actual route rendering, certainty styling, line hit-testing, card layout, refresh/Back behavior, and browser console checks remain pending owner verification.

Validation on 2026-07-18:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 17 files, 668 tests;
- `npm run data:validate`: PASS — 21 canonical synthetic records;
- `npm run data:build` twice with hash comparison: PASS;
- `npm run data:check`: PASS;
- `npm run build`: PASS — known MapLibre chunk warning only;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F13 — Year Overview Panel — Implemented; owner verification pending

Implemented:

- pure overview selectors and a compact immutable presentation model derived from the F2 selected year and existing F8–F12 presentations;
- centralized deterministic ranking with explicit per-section limits, stable name/ID ties, Place/Person importance, relationship priority, and mapped status used only as a map-context signal;
- active events, active polities, important active Places, alive mapped People, and active Journeys, while retaining honest unmapped and disabled-layer metadata;
- published, active, mapped, unmapped, territory, dataset, synthetic-fixture, collection, sparse-coverage, outside-collection, no-active-record, and active-but-unmapped summaries;
- a responsive, keyboard-operable contextual panel using semantic sections, lists, buttons, visible focus, and textual state labels;
- push-history typed selection that preserves year, viewport, layers, collection, and unrelated parameters, with no automatic focus or layer mutation;
- 55 new overview eligibility, ranking, limit, tie-break, coverage, empty-state, selection, URL, immutability, layer-order, and entity-flow regression tests, bringing the suite to 723 tests in 18 files.

Automated and static acceptance criteria pass. Actual panel rendering, mobile scrolling, keyboard traversal, URL Back/Forward behavior, and browser console checks remain pending owner verification.

Validation on 2026-07-19:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 18 files, 723 tests;
- `npm run data:validate`: PASS — 21 canonical synthetic records;
- `npm run data:check`: PASS;
- `npm run build`: PASS — known MapLibre chunk warning only;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F14 — Local Search — Implemented; owner verification pending

Implemented:

- deterministic committed `data/generated/search-index.json` with schema version `1`, search-index version `1`, dataset compatibility, compact entries, authored name variants, temporal/map metadata, and manifest fingerprint coverage;
- all implemented Place, Polity, Person, Event/Battle, and Journey/Campaign records, with Battle grouped under Event and Campaign under Journey;
- Unicode NFKC, locale-neutral lowercase, punctuation-to-space, whitespace-collapse normalization without automatic transliteration;
- exact primary, exact authored variant, primary/variant prefix, token-prefix, and substring matching with explicit comparator categories, current-year tie-breaking, stable type/name/ID ties, grouping, and a 20-result cap;
- historical-name-first target years, F2-based entity target years, required-layer enabling in F6 canonical order, typed selection, one push update, point-only focus at minimum zoom 5.5, and no viewport movement for unmapped/polygon/route results;
- a responsive Map search overlay with a labeled bounded search input, clear/close controls, Escape, Arrow/Home/End/Enter interaction, semantic listbox options, live result status, honest no-result/unmapped text, and recoverable incompatible-index state;
- 55 focused pipeline, normalization, matching, ranking, year, grouping, navigation, focus, URL, and immutability tests, bringing the suite to 778 tests in 19 files.

Automated and static acceptance criteria pass. Search opening, input/results, keyboard interaction, selection/card behavior, point focus, unmapped behavior, Back/Forward, responsive layout, and browser console/network behavior remain pending owner verification in ordinary Chrome or Edge.

Validation on 2026-07-19:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 19 files, 778 tests;
- `npm run data:validate`: PASS — 21 canonical synthetic records;
- `npm run data:build` twice with hash comparison: PASS — four byte-identical artifacts;
- `npm run data:check`: PASS;
- `npm run build`: PASS — known MapLibre chunk warning only;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F15 — Entity Pages and Explore Catalogs — Implemented; owner verification pending

Implemented:

- stable `/place/:id`, `/polity/:id`, `/person/:id`, `/event/:id`, and `/journey/:id` routes with invalid, missing, loading, and runtime-error recovery;
- a shared responsive Entity Page shell plus explicit Place, Polity, Person, Event/Battle, and Journey sections;
- full entity-specific evidence aggregation, exact-reference deduplication, locator preservation, unresolved-source isolation, and explicit non-proximity relations;
- functional Explore landing counts and compact `/explore/places`, `/explore/polities`, `/explore/people`, `/explore/events`, and `/explore/journeys` catalogs;
- URL-backed current/all-period, signed year, query, and valid per-type sort state with safe canonicalization and unrelated-parameter preservation;
- F14 generated-index search reuse, including historical Place-name match context and safe unavailable-index behavior;
- centralized F14/F6-based `View on map` links with typed selection, relevant year, required layer, validated point focus, and unchanged default viewport for polygons, routes, and unmapped records;
- 55 focused F15 tests, bringing the suite to 833 tests in 21 files.

Automated and static acceptance criteria pass. Direct refresh, Back/Forward, rendered layouts, keyboard traversal, links, and actual map transitions remain pending owner verification in ordinary Chrome or Edge.

Validation on 2026-07-19:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 21 files, 833 tests;
- `npm run data:validate`: PASS — 21 canonical synthetic records;
- `npm run data:check`: PASS;
- `npm run build`: PASS — known non-blocking large-chunk warning only;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F16 — Content Collections and Coverage — Implemented; owner verification pending

Implemented:

- public `/collections` and `/collections/alexanders-world` routes plus safe invalid, missing, loading, and runtime-error states;
- a finalized strict collection contract for visibility, completeness, membership kind, canonical recommended layers, conservative product focus bounds, structured coverage gaps, and duplicate rejection;
- a published 360–300 BCE `Alexander's World` foundation-preview shell recommending 334 BCE and the existing Eastern Mediterranean viewport;
- 11 explicitly linked synthetic foundation demonstrations with grouped, active, mapped/unmapped, and inverse membership selectors;
- internal retention of `synthetic-alpha-collection`, excluded from public lists by authored visibility rather than ID logic;
- one coherent explicit Map URL for activation, a compact valid/unresolved collection panel, conservative year/focus warnings, Reset, and Leave-only-collection behavior;
- global non-filtering Year Overview context and explicit synthetic-demonstration relations on entity pages;
- matching collection/coverage periods, detailed-focus metadata on the public landing, and explicit no-active/unmapped/non-filtering coverage messages;
- no historical coverage polygon, automatic filter, real historical entity, fabricated citation, new dependency, backend, or global state.

Automated and static acceptance criteria pass. Collection route rendering, direct refresh, actual Map panel interaction, responsive coexistence, keyboard traversal, and browser console/network behavior remain pending owner verification in ordinary Chrome or Edge.

Validation on 2026-07-20:

- `npm run typecheck`: PASS;
- `npm run lint`: PASS;
- `npm run test`: PASS — 24 files, 864 tests;
- `npm run data:validate`: PASS — 22 canonical records;
- `npm run data:build` twice with hash comparison: PASS — four byte-identical artifacts;
- `npm run data:check`: PASS;
- `npm run build`: PASS — known non-blocking large-chunk warning only;
- `git diff --check`: PASS;
- browser checks: NOT RUN — owner external-browser verification required.

### F17–F18 — Planned

F17 — Granicus Vertical Content Slice is next after owner verification and review of F16. Reviewed historical entities, evidence, territory geometry, route geometry, and genuine collection membership remain out of F16.

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
- Public/internal visibility, coverage status, completeness, and membership kind are independent collection fields. Membership and inverse membership use only authored linked IDs.
- The F16 focus bounds are conservative product-navigation metadata, not historical geometry; only inside/outside focus is classified.
- Collection activation and Reset use push history and explicit year/viewport/layer parameters. Leave removes only the collection ID and preserves all other Map state.
- Top-level entity IDs are globally unique across types so reference-index and future untyped-selection keys are unambiguous.
- Canonical source and geometry are editable; committed generated files are derived and never hand-edited.
- Validation covers every editorial state, while public runtime output includes only `published` records and referenced geometry.
- Generated output is deterministic, has no timestamps, and is fingerprinted with SHA-256.
- Place name, ownership, importance, and polity-capital overlaps are rejected until competing interpretations receive an explicit schema representation.
- The physical basemap is a local MapLibre style using only public-domain Natural Earth 1:110m land, coastline, lake, and river vectors.
- F5 uses no external tile provider, provider account, token, glyphs, sprites, modern political boundaries, or settlement/transport labels.
- The URL is the reproducible source of map-navigation state; the map keeps a local controlled camera for responsive interaction and commits only on `moveend`.
- URL defaults are year `-334`, the F5 viewport, `territories`/`places`/`people`/`events`/`journeys`, and no selected entity or collection.
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
- Event activity and selected-year visibility reuse F2. Normal mapped markers require an active event and enabled `events` layer; explicit mapped selection overrides inactivity and the layer toggle with distinct styling.
- Unknown-location events never produce a point, remain URL-selectable, and retain a card without moving the viewport. Invalid accuracy/coordinate combinations fail presentation derivation safely.
- Battle remains the F3 HistoricalEvent specialization; its side order is authored, participant lists are deduplicated deterministically, and unresolved relation names remain explicit null fallbacks.
- Event evidence consists only of references directly attached to the event/battle record. Participant entities' general evidence is not promoted into event claims.
- Person life and mapped state are independent. Coordinates come only from the primary active resolved Place relationship; birthplace is never extended beyond its own period.
- People aggregate by Place ID after zoom visibility is applied. Aggregate membership is importance-descending then name/ID; a semantic chooser writes an ordinary `person:<id>` selection.
- Journey activity is determined only from its F2 period; geometry availability is independent and never makes an inactive journey active or an unmapped journey disappear from presentation.
- Normal routes require an active published Journey, enabled `journeys` layer, and resolved generated geometry. A selected mapped Journey overrides inactivity or a disabled layer with explicit styling; a selected unmapped Journey retains only its card.
- Route direction is stated only when `directionKnown` is explicit. F12 uses card copy rather than inferred arrows or remote sprite assets; geometry coordinate order alone is not evidence of direction.
- Journey evidence prioritizes journey-level references then stage references in authored order, deduplicates exact references, and excludes participants' general sources.
- Historical render order is territory → journey → event → people → place and interaction priority is place → person → event → journey → territory.
- The year overview is derived from generated runtime presentations rather than visible map features, so disabled layers do not erase active historical context. Rankings use explicit comparator chains and stable ties, never AI, randomness, polygon area, route length, or an opaque score.
- Overview item selection uses existing typed entity references with push history and preserves the current year, viewport, layers, collection, and unrelated parameters. F13 deliberately performs no automatic focus and leaves selected-feature overrides to F8–F12.
- Search data is a separate compact generated artifact, validated and deep-frozen against the runtime dataset version. Only authored default, historical, alias, or transliteration fields may become variants.
- Search uses explicit exact/prefix/token-prefix/substring categories and stable comparator ties. Selection adds exactly the required layer, keeps canonical ordering, writes one push-history URL update, and focuses only deterministic Place/Event/Person points.
- Stable entity routes resolve only against the immutable generated runtime. Full pages may reuse compact presentations for shared meaning but retain explicit entity-specific chronology, relations, and complete relevant evidence.
- Explore catalog identity is path-owned; period, selected year, search query, and sorting are query-owned. Current-year eligibility reuses F8–F12 semantics, including alive-unmapped People, while all-period mode includes every published record.
- Entity relation links open stable pages. `View on map` alone changes to `/map`, reusing F14 target-year and point-focus policy plus F6 serialization; polygon, route, and unknown geometry never receive fabricated focus.
- All entity temporal fields reuse `src/domain/time`; no second time model exists.
- Zod and Vitest remain the only domain validation/testing dependencies.

---

## 4. Known Limitations and Risks

- F4 has only synthetic fixtures; real historical content still requires reviewed sources, licensing, and attribution.
- Runtime loading is currently bundled and aggregate; a validation failure disables all historical runtime presentation rather than partially loading records.
- Competing temporal interpretations cannot yet coexist in canonical fixture files because the current schema has no explicit variant/claim grouping.
- Published-source enforcement checks coverage presence, not whether the referenced source exists or is editorially adequate.
- Fixtures are synthetic structure examples, not publishable historical data.
- Places, territories, journeys, events, active-place people, the selected-year overview, Map-local search, Explore catalogs, full entity pages, and collection coverage UI are implemented; no playback or route animation exists yet.
- F10 uses representative point markers only. It does not add regional polygons, clustering, overlap cycling, or automatic map fitting.
- Overlapping claims render separately, but F9 offers no click cycling when multiple polygons occupy the same point.
- Natural Earth 1:110m vectors are intentionally generalized and become coarse at close zoom; F5 caps zoom at 7.
- Actual WebGL load, pan/zoom, responsive rendering, visual forbidden-layer review, and browser console checks remain pending owner verification.
- Direct application URLs still require a static-host fallback; no hosting provider is configured.

---

## 5. Nearest Next Steps

1. Complete the F5–F16 owner external-browser checks for map/timeline rendering, overview/search/collection behavior, all Explore, Collection, and entity routes, URL restoration, links, and responsive/keyboard layout.
2. Review and commit the current discovery work when ready.
3. Begin F17 — Granicus Vertical Content Slice only after F16 review and owner browser verification.
4. Keep all current historical-layer fixtures unmistakably synthetic.

---

## 6. Maintenance Rule

Review this document at the end of every repository-relevant iteration. Keep current-state sections synchronized with reality, record ordinary work under Recent Changes, and preserve lasting decisions or completed milestones under Significant Changes.

Only report validation that actually ran.

---

## Recent Changes — Rolling Three-Month History

### 2026-07-20 — First reviewed Granicus vertical slice implemented

- Added a compact reviewed corpus for 334 BCE: two polities, four places, Alexander III, Darius III, the Battle of the Granicus, a schematic Hellespont crossing/campaign journey, and two conservative contextual territories.
- Added explicit reviewed-versus-synthetic classification, authored searchable aliases, source-reference confidence, non-self-intersecting polygon validation, and a dedicated F17 contract suite.
- Converted `alexanders-world` to reviewed-only membership while retaining the internal synthetic compatibility collection.
- Documented conflicting ancient narratives, omitted unsupported force/loss figures, excluded Darius from battle participation, and recorded representative-location and schematic-geometry limitations.
- Validation: `data:validate`, `data:check`, `typecheck`, `lint`, `test` (25 files, 870 tests), and `build` pass; consecutive generated-artifact SHA-256 hashes match. Browser/WebGL verification was not run and remains an owner task.

### 2026-07-20 — Recovered and completed interrupted F16 work

- Audited and preserved the restart-interrupted F16 schema, canonical/generated data, domain, routing, UI, integration, tests, and documentation work without resetting or regenerating it blindly.
- Closed the remaining contract gaps for matching coverage periods, landing-page detailed regions, deterministic coverage warnings, global Year Overview behavior, and valid/unresolved badge rendering; all automated checks pass and owner external-browser verification remains pending.

### 2026-07-19 — Implemented F16 content collections and coverage

- Added the public `Alexander's World` foundation-preview shell, internal fixture visibility, explicit synthetic membership/counts, collection routes, and deterministic coverage/navigation models.
- Added recommended Map activation, a compact active-collection panel, distinct Reset/Leave behavior, Year Overview and entity-page context, and focused tests; owner browser verification remains pending.

### 2026-07-19 — Implemented F15 entity pages and Explore catalogs

- Added stable full pages for all five entity types with specialized chronology, explicit relations, full relevant evidence, safe recovery, and centralized `View on map` links.
- Replaced the Explore placeholder with five compact URL-filtered catalogs using current/all-period eligibility, deterministic sorting, and F14 search reuse; owner browser verification remains pending.

### 2026-07-19 — Implemented F14 local historical search

- Added a deterministic generated cross-entity index, transparent Unicode-safe matching/ranking, period-aware navigation, canonical layer enabling, and point-only focus without adding content or dependencies.
- Added a responsive keyboard-accessible Map overlay and 55 focused tests; owner external-browser verification remains pending.

### 2026-07-19 — Implemented F13 selected-year overview

- Added a deterministic, coverage-aware contextual panel for active events, polities, important Places, mapped People, and Journeys using only generated synthetic runtime presentations.
- Kept selection within existing typed URL/card contracts, added 55 pure tests, and deferred automatic focus, layer mutation, search, catalogs, and collection activation.

### 2026-07-18 — Recovered and completed F12 journeys and campaign routes

- Preserved and audited the interrupted F12 working tree, then connected generated Journey records and canonical route geometry to selected-year selectors, native certainty-aware MapLibre lines, typed URL selection, ordered stage/relationship resolution, and a compact sourced Journey card.
- Expanded only synthetic fixtures to prove LineString/MultiLineString, known/unknown direction, mapped/unmapped, active/inactive, and certainty behavior; added 60 tests, including resolved per-stage evidence, with owner browser verification pending.

### 2026-07-17 — Implemented F11 active-place people and aggregation

- Connected generated people to selected-year Place relationships, zoom visibility, native aggregate markers, typed URL selection, a semantic chooser, and sourced person cards.
- Expanded only synthetic fixtures to prove bounded birth, location change, aggregation, alive-unmapped, and outside-life behavior; added 75 tests, with owner browser verification pending.

### 2026-07-17 — Implemented F10 event and battle presentation

- Connected generated generic events and specialized battles to selected-year selectors, native exact/uncertain MapLibre markers, typed URL selection, relation resolution, and compact sourced cards.
- Expanded only synthetic fixtures to prove exact, approximate, unknown-location, inactive, two-side battle, commander, disputed-note, and related-campaign behavior; added 86 tests, with owner browser verification pending.

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

### 2026-07-20 — First reviewed historical content slice established

- EraByEra now carries a sourced Granicus core through canonical records, deterministic runtime/search generation, Map and overview selectors, Explore, entity pages, and reviewed public collection membership.
- Ancient-source disagreement, representative coordinates, schematic movement, conservative territory reconstruction, and omitted unsupported quantities remain explicit data decisions.
- Why it matters: the foundation systems now demonstrate a complete trustworthy historical-content flow without removing synthetic regression fixtures or overstating geographic coverage.

### 2026-07-19 — First public collection and coverage boundary established

- Collections are now canonical authored runtime scopes with explicit public/internal visibility, membership, completeness, recommended state, and coverage metadata rather than inferred filters or bookmarks.
- `Alexander's World` is deliberately a real product shell around unmistakably synthetic demonstrations until F17; conservative focus bounds communicate content navigation only and are never historical borders.
- Why it matters: future reviewed slices can replace or extend explicit membership without changing the URL/navigation contract or misleading users that sparse map areas lack history.

### 2026-07-19 — Stable public entity and non-map discovery boundary established

- Every published Place, Polity, Person, Event/Battle, and Journey/Campaign now has a stable runtime-backed page, while explicit relation links stay on entity pages and map movement requires a distinct `View on map` action.
- Explore now owns reproducible catalog filters independently from Map URL state and reuses the generated F14 index and F8–F12 activity semantics, preserving unmapped records and full evidence without a backend or duplicate content store.
- Why it matters: future collections and external links can rely on stable non-spatial discovery while the Map remains the primary spatial surface and no geometry, relationship, or historical fact is inferred.

### 2026-07-19 — First generated cross-entity local search boundary established

- EraByEra now publishes a compact, version-compatible search artifact derived from validated runtime content and queries it entirely in the browser through explicit match categories and stable comparator ties.
- Historical Place names carry their authored periods into navigation; result selection coherently updates year, required layer, typed entity, and only deterministic point focus while unmapped records remain selectable without invented geography.
- Why it matters: future Explore catalogs and entity pages can reuse one deterministic discovery contract without remote services, AI ranking, duplicated canonical records, or a second navigation state.

### 2026-07-19 — First deterministic cross-entity year synthesis established

- EraByEra can now explain a selected year through one compact model that composes existing entity presentations without generating prose or inventing a cross-domain importance score.
- Eligibility remains historical rather than visibility-based: disabled layers and active-but-unmapped entities stay explicit, while selection preserves the complete URL context.
- Why it matters: future search, catalogs, collections, and richer overview surfaces have a tested cross-entity pattern that remains explainable and coverage-honest.

### 2026-07-18 — First finite historical movement layer established

- EraByEra now renders selected-year journeys from canonical generated LineString/MultiLineString geometry while keeping historical activity independent from route availability.
- Direction is never inferred, certainty changes non-color line treatment, and selected inactive or unmapped journeys remain honest and inspectable.
- Why it matters: future campaigns, expeditions, and migrations have a tested evidence-aware movement pattern without implying exact day-by-day routing or conflating persistent trade networks with finite journeys.

### 2026-07-17 — First historically active person representation established

- People now appear through bounded active relationships to resolved Places rather than permanent birth coordinates or invented person coordinates.
- Life state remains separate from mapped state, while aggregation and explicit person selection preserve uncertainty and evidence.
- Why it matters: future historical people can move over time without turning biography fields into misleading permanent map locations.

### 2026-07-17 — Specialized historical-event presentation established

- EraByEra now carries one HistoricalEvent union through shared activity, location, selection, evidence, and card behavior while allowing Battle to add structured sides, commanders, outcomes, result, dispute, and campaign context.
- Unknown locations remain inspectable without fabricated coordinates, and uncertain representative points remain visually and textually distinct.
- Why it matters: future event subtypes can specialize trusted structured data without fragmenting the common event architecture or manufacturing map precision.

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
