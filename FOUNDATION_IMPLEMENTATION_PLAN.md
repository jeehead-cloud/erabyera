# EraByEra — Foundation Implementation Plan

**Status:** Approved implementation baseline  
**Last updated:** 2026-07-12  
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`  
**Local repository path:** `C:\Projects\erabyera`

> This document turns the approved product structure into a sequenced implementation plan suitable for Cursor and other coding agents. The foundation phase ends with a complete, sourced Granicus vertical slice, not an empty application shell.

---

## 1. Foundation Goal

Foundation is complete when a user can:

1. open a physical historical map;
2. navigate to 334 BCE;
3. see Macedonia and the Achaemenid Empire;
4. see key places;
5. see Alexander III and Darius III;
6. see the Battle of the Granicus;
7. see the initial campaign route;
8. search for these objects;
9. open cards and full pages with sources and uncertainty;
10. share a URL that restores the same map state.

---

## 2. Guiding Rules

1. One Cursor iteration should produce one coherent result.
2. Every iteration ends in a buildable state.
3. Historical content and UI logic remain separate.
4. No backend, accounts, database, or API in foundation.
5. Data validation is part of normal development.
6. Domain time rules are centralized and tested.
7. Map objects use MapLibre sources and layers where practical.
8. Published content requires reviewed sources.
9. Future features are documented but not implemented early.
10. `CURRENT_STATUS.md` is reviewed and updated after every repository-relevant iteration.

---

## 3. Target Technical Direction

- TypeScript;
- React;
- Vite;
- React Router;
- MapLibre GL JS with React integration;
- Zustand for UI state;
- Zod for runtime schemas;
- Vitest for domain tests;
- repository-managed JSON and GeoJSON;
- generated runtime datasets;
- local search index;
- static deployment;
- no backend.

---

## 4. Foundation Batches

| Batch | Milestones | Outcome |
|---|---|---|
| 1 — Application and Domain Foundation | F1–F4 | Routes, time model, schemas, source/runtime pipeline |
| 2 — Map and Temporal Experience | F5–F8 | Map shell, URL state, timeline, places |
| 3 — Historical Layers | F9–F12 | Territories, events, people, routes |
| 4 — Discovery and Product Structure | F13–F16 | Year overview, search, pages/catalogs, collections |
| 5 — Content Slice and Stabilization | F17–F18 | Granicus slice and release-ready integration |

Cursor prompts should target one milestone or one internal iteration, never an entire batch.

---

## 5. Dependency Overview

```text
F1
├── F2
├── F3
└── F5

F2 + F3
└── F4

F5
└── F6
    └── F7
        └── F8
            ├── F9
            ├── F10
            ├── F11
            └── F12

F8–F12
├── F13
├── F14
└── F15

F13–F15
└── F16
    └── F17
        └── F18
```

Small content research and source preparation may run in parallel after F3, but published runtime data must follow the validation pipeline from F4.

---

# F1 — Application Shell and Routing

## Goal

Establish a stable multi-route application without implementing the map or historical domain.

## Why Now

All later product flows depend on predictable routes, shared layout, error handling, and clear screen boundaries.

## Scope

- verify or scaffold React + TypeScript + Vite;
- add React Router;
- add application shell;
- add `/map`, `/explore`, and `/sources`;
- add not-found page;
- add basic error boundary;
- add minimal design tokens and layout;
- root redirects to `/map`.

## Deliverables

- router configuration;
- shared header/navigation shell;
- placeholder Map, Explore, and Sources screens;
- route-level loading/error support where appropriate;
- responsive base layout.

## Acceptance Criteria

- direct URL access works;
- browser refresh keeps the current route;
- navigation does not reload the page;
- unknown routes show a useful not-found state;
- no MapLibre or historical schemas are introduced;
- production build passes.

## Validation

- typecheck;
- lint;
- test if configured;
- build;
- `git diff --check`;
- manual route and refresh test.

## Out of Scope

- map;
- historical entities;
- timeline;
- URL map state;
- real content.

## Documentation Updates

- `ARCHITECTURE.md`;
- `CURRENT_STATUS.md`.

## Recommended Commit

```text
feat: add EraByEra application shell and routing
```

---

# F2 — Historical Time Domain

## Goal

Implement the shared historical date and temporal-range model.

## Why Now

Every entity, filter, layer, URL, and search result depends on consistent BCE/CE behavior.

## Scope

- historical year type and formatting;
- no displayed year zero;
- previous/next year utilities;
- inclusive temporal ranges;
- date precision metadata;
- active-at-year selectors;
- range intersections;
- nearest active period;
- tests.

## Deliverables

- centralized time domain module;
- Zod schemas for year/range/precision;
- unit tests for boundaries and BCE/CE transitions.

## Acceptance Criteria

- 1 BCE transitions directly to 1 CE;
- inclusive end years remain active;
- approximate and unknown precision is retained;
- components do not implement independent year logic;
- tests cover negative and positive years.

## Validation

- typecheck;
- lint;
- test;
- build;
- `git diff --check`.

## Out of Scope

- timeline UI;
- day/month selector;
- playback;
- date conversion from external calendars.

## Documentation Updates

- `ARCHITECTURE.md`;
- `PRODUCT_RULES.md` only if semantics differ;
- `CURRENT_STATUS.md`.

## Recommended Commit

```text
feat: add historical time domain utilities
```

---

# F3 — Domain Schemas and Validation Foundation

## Goal

Create typed, validated core entity models without overgeneralizing them.

## Why Now

The data pipeline and map layers require stable contracts.

## Scope

Foundation schemas:

- Source;
- SourceReference;
- common entity metadata;
- Place;
- Polity;
- TerritoryPeriod;
- Person and PersonPlacePeriod;
- HistoricalEvent;
- Battle extension;
- Journey/Campaign;
- ContentCollection;
- editorial status;
- uncertainty metadata.

## Deliverables

- TypeScript types;
- Zod schemas;
- example fixtures;
- validation helpers;
- reference-ID conventions;
- schema version contract.

## Acceptance Criteria

- each entity has a distinct typed model;
- common fields are reused without one universal optional-field object;
- invalid coordinates, dates, statuses, and references are rejected;
- published fixtures require sources;
- schema version is explicit;
- tests cover representative valid and invalid fixtures.

## Validation

- typecheck;
- lint;
- test;
- build;
- `git diff --check`.

## Out of Scope

- real Granicus dataset;
- map rendering;
- optimized runtime generation;
- universal claim graph.

## Documentation Updates

- `ARCHITECTURE.md`;
- `PRODUCT_RULES.md` if new invariants are formalized;
- `CURRENT_STATUS.md`.

## Suggested Internal Iterations

1. common metadata, Source, and SourceReference;
2. Place and Polity;
3. Person, Event/Battle, Journey;
4. Collection, uncertainty, and editorial status;
5. validation tests.

---

# F4 — Source Data and Runtime Build Pipeline

## Goal

Separate editable historical data from validated runtime datasets.

## Why Now

The application must not depend on unvalidated raw files or hardcoded React content.

## Scope

Recommended structure:

```text
data/
├── source/
├── geometry/
└── generated/
```

Pipeline:

```text
source data
→ validation
→ reference integrity checks
→ runtime transformation
→ generated manifest and indexes
```

## Deliverables

- data folders;
- validation command;
- generation command;
- runtime manifest;
- schema and dataset versions;
- loader-facing generated files;
- clear errors and warnings.

## Acceptance Criteria

- invalid data fails validation;
- missing references fail validation;
- published records without sources fail validation;
- valid fixtures generate deterministic runtime files;
- generated data is not manually edited;
- application code does not import scattered source files.

## Validation

- typecheck;
- lint;
- test;
- `data:validate`;
- data build/generation command;
- production build;
- `git diff --check`.

## Out of Scope

- Google Sheets automation;
- backend ingestion;
- admin interface;
- large-scale chunking.

## Documentation Updates

- `ARCHITECTURE.md`;
- `DEPLOYMENT.md` for real commands;
- `CURRENT_STATUS.md`.

## Recommended Commit

```text
feat: add historical data validation and runtime generation
```

---

# F5 — Physical MapLibre Shell

## Goal

Add the real physical map foundation with legally documented attribution.

## Why Now

Historical layers should not be built on a temporary basemap that will later be replaced.

## Scope

- MapLibre integration;
- physical basemap;
- no modern political borders or labels;
- pan and zoom;
- visible attribution;
- loading and error states;
- responsive map container.

## Deliverables

- MapView component;
- selected basemap configuration;
- license and attribution notes;
- fallback error state;
- manual browser verification notes.

## Acceptance Criteria

- map opens locally;
- pan and zoom work;
- no modern political boundaries or city labels appear in the default style;
- attribution is visible;
- production build works;
- map errors do not crash the whole shell.

## Validation

- typecheck;
- lint;
- test;
- build;
- `git diff --check`;
- manual browser check.

## Out of Scope

- historical layers;
- year state;
- entity selection;
- custom vector tiles.

## Documentation Updates

- `ARCHITECTURE.md`;
- `DEPLOYMENT.md`;
- `CURRENT_STATUS.md`.

---

# F6 — URL-Synchronized Map State

## Goal

Make map exploration reproducible and shareable.

## Why Now

Timeline, selection, search, and entity pages need a stable URL contract.

## Scope

URL fields:

- year;
- latitude;
- longitude;
- zoom;
- active layers;
- selected entity;
- active collection.

Implement parsing, validation, serialization, and debounced updates.

## Deliverables

- URL state module;
- safe defaults;
- map-to-URL synchronization;
- URL-to-map restoration;
- tests;
- Share action that copies current URL.

## Acceptance Criteria

- refresh restores viewport and year;
- invalid URL values fall back safely;
- selected entity can be restored;
- URL changes are not emitted continuously during every map movement;
- browser Back/Forward remains usable.

## Validation

- typecheck;
- lint;
- test;
- build;
- manual refresh, share, Back/Forward tests.

## Out of Scope

- short links;
- social cards;
- comparison URL;
- server routing.

## Documentation Updates

- `ARCHITECTURE.md`;
- `CURRENT_STATUS.md`.

---

# F7 — Timeline Controls

## Goal

Add year navigation linked to the URL and historical selectors.

## Why Now

Time is the primary product dimension and must work before historical layers multiply.

## Scope

- selected year display;
- direct input;
- previous/next controls;
- step selector;
- slider;
- BCE/CE formatting;
- responsive compact mode.

## Deliverables

- Timeline component;
- shared year input validation;
- URL integration;
- keyboard-safe controls.

## Acceptance Criteria

- no year zero appears;
- step controls work in both BCE and CE;
- direct input and slider share validation;
- URL changes with selected year;
- refresh restores selected year;
- map remains interactive.

## Validation

- typecheck;
- lint;
- test;
- build;
- manual boundary and refresh test.

## Out of Scope

- playback;
- range mode;
- month/day controls;
- event markers.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `ARCHITECTURE.md` if state boundaries changed.

---

# F8 — Place Layer and Place Cards

## Goal

Complete the first end-to-end historical entity flow.

## Why Now

Places are the simplest layer that exercises loading, time, zoom, selection, URL, sources, and cards.

## Scope

- place runtime data;
- active-year selectors;
- period-appropriate names;
- zoom/importance visibility;
- MapLibre place layer;
- selection;
- compact card;
- source display;
- inactive-period behavior.

## Deliverables

- place selectors;
- active-year GeoJSON generation;
- place layer;
- place highlight;
- compact universal detail panel shell;
- 3–5 initial reviewed place records.

## Acceptance Criteria

- only active places are normally shown;
- historical names change by year;
- smaller places appear at closer zoom;
- click opens the correct card;
- URL restores selected place;
- selected place remains visible;
- sources are visible;
- inactive-period card behavior is correct.

## Validation

- typecheck;
- lint;
- test;
- data validation;
- build;
- manual click, zoom, year, refresh tests.

## Out of Scope

- catalog;
- full place page;
- clustering for large datasets;
- hundreds of places.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `ARCHITECTURE.md`.

---

# F9 — Polities and Territory Layers

## Goal

Add political context and time-bounded territory geometry.

## Why Now

The first content slice requires Macedonia and the Achaemenid Empire to frame places and events.

## Scope

- polity models and selectors;
- capitals and rulers by period where available;
- territory GeoJSON;
- fill and boundary layers;
- uncertainty/control styling;
- selection and polity card;
- overlapping claims support.

## Deliverables

- active polity selector;
- territory-period selector;
- territory layers;
- selected highlight;
- compact polity card;
- initial Macedonia and Achaemenid records and geometry.

## Acceptance Criteria

- territories update with year;
- uncertainty styling is visible;
- missing geometry does not hide a polity from the app;
- selection shows correct polity data;
- overlapping territory features do not break interaction;
- source references are visible.

## Validation

- typecheck;
- lint;
- test;
- GeoJSON validation;
- data validation;
- build;
- manual year and selection tests.

## Out of Scope

- animated territory interpolation;
- full historical global borders;
- automated topology repair.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `PRODUCT_RULES.md` only if control categories change;
- `ARCHITECTURE.md`.

## Suggested Internal Iterations

1. schema/selectors;
2. initial polity data;
3. territory geometry;
4. rendering and interaction;
5. card and temporal verification.

---

# F10 — Events and Battle Model

## Goal

Add historical events and the specialized Battle of the Granicus flow.

## Why Now

Events demonstrate date-specific historical change and connect polities, people, and places.

## Scope

- generic event layer;
- event types;
- exact, approximate, regional, and unknown locations;
- battle extension;
- event and battle cards;
- initial Granicus event fixture and later reviewed content.

## Deliverables

- event selectors;
- event MapLibre layer;
- uncertainty markers;
- event card;
- battle-specific section;
- related-entity links.

## Acceptance Criteria

- events appear only in active periods;
- unknown-location events remain searchable/catalogable without fake coordinates;
- battle card shows sides, commanders, result, campaign, and sources;
- selection restores from URL;
- approximate locations are visually distinct.

## Validation

- typecheck;
- lint;
- test;
- data validation;
- build;
- manual event and uncertainty tests.

## Out of Scope

- detailed tactical battle maps;
- force simulation;
- automatic cause/consequence generation.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `ARCHITECTURE.md`.

---

# F11 — People and Active-Place Representation

## Goal

Show people at historically valid places and periods.

## Why Now

The Granicus slice requires Alexander III, Darius III, and commanders without misrepresenting birthplace as permanent location.

## Scope

- person-place periods;
- person visibility selector;
- importance and zoom behavior;
- aggregation at shared places;
- person card;
- related places, events, and polities.

## Deliverables

- person selectors;
- person layer or active-place aggregation;
- compact person card;
- initial reviewed person records.

## Acceptance Criteria

- a person appears only through an active map relationship;
- changing the year changes location or visibility;
- multiple people at one place are aggregated;
- person search and selection use historical periods correctly;
- sources and date precision are visible.

## Validation

- typecheck;
- lint;
- test;
- data validation;
- build;
- manual year and aggregation tests.

## Out of Scope

- full biography articles;
- family trees;
- relationship graphs.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `ARCHITECTURE.md`.

---

# F12 — Journeys and Campaign Routes

## Goal

Render the initial campaign movement and connect stages to events and places.

## Why Now

Routes complete the key visual promise of the Alexander content slice.

## Scope

- Journey/Campaign runtime model;
- active-period selector;
- LineString/MultiLineString geometry;
- direction;
- certainty styling;
- key route stages;
- route card;
- related event/place links.

## Deliverables

- journey layer;
- selected-route highlight;
- approximate/documented styles;
- compact journey card;
- initial campaign route data.

## Acceptance Criteria

- route appears only in relevant periods;
- direction is shown only when supported;
- approximate route is visually distinct;
- key stages can be selected;
- card explains uncertainty;
- sources are visible.

## Validation

- typecheck;
- lint;
- test;
- GeoJSON validation;
- data validation;
- build;
- manual route selection test.

## Out of Scope

- day-by-day playback;
- route editing UI;
- trade-route networks.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `ARCHITECTURE.md`.

---

# F13 — Year Overview Panel

## Goal

Make the selected year understandable when no object is selected.

## Why Now

A map without explanation can feel empty even when data is present.

## Scope

- default right panel;
- selected year;
- key events;
- major active polities;
- important places;
- current campaigns;
- data coverage summary;
- deterministic importance rules.

## Deliverables

- year-overview selector;
- overview card/list components;
- links that select and focus entities;
- empty-coverage messaging.

## Acceptance Criteria

- overview updates when year changes;
- all listed items are active or explicitly contextual;
- ranking is deterministic;
- clicking an item selects it on the map;
- no-data messaging does not imply no history.

## Validation

- typecheck;
- lint;
- test;
- build;
- manual year overview test.

## Out of Scope

- AI summaries;
- full timeline page;
- annual difference engine.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `PRODUCT_RULES.md` if importance rules are finalized.

---

# F14 — Local Search

## Goal

Allow fast navigation across type, time, and geography without a backend.

## Why Now

Search is essential once several entity types exist.

## Scope

- generated local index;
- names and historical names;
- aliases and transliterations;
- type grouping;
- period-aware ranking;
- keyboard-accessible search UI;
- result-to-map flow.

## Deliverables

- search index generation;
- search service;
- global search component;
- grouped results;
- `/` shortcut later if safe.

## Acceptance Criteria

- historical names find the correct entity;
- result selection opens a relevant year;
- map moves and selects the object;
- required layer is enabled;
- search supports implemented entity types;
- no network service is required.

## Validation

- typecheck;
- lint;
- test;
- data validation;
- build;
- manual historical-name search tests.

## Out of Scope

- server full-text search;
- semantic search;
- AI ranking;
- multilingual fuzzy ranking beyond prepared variants.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `ARCHITECTURE.md`.

---

# F15 — Entity Pages and Explore Catalogs

## Goal

Add non-map discovery and stable full entity pages.

## Why Now

Some objects are not visible at the current year, zoom, or location, and sources need deeper presentation.

## Scope

- universal EntityPageShell;
- specialized sections;
- routes for implemented entity types;
- Explore landing screen;
- catalogs for Places, Polities, People, Events, and Journeys;
- current-year/all-period filters;
- `View on map`.

## Deliverables

- full-page routing;
- entity page components;
- reusable list/catalog components;
- not-found states;
- relation links;
- source sections.

## Acceptance Criteria

- every implemented entity has a stable page URL;
- View on map opens a relevant state;
- catalogs reuse shared selectors and search data;
- current-year and all-period filters work;
- objects without geometry still have useful pages;
- browser Back returns sensibly.

## Validation

- typecheck;
- lint;
- test;
- build;
- manual route and View-on-map tests.

## Out of Scope

- large card-view system;
- relationship graph;
- long-form encyclopedia editor.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `ARCHITECTURE.md`.

---

# F16 — Content Collections and Coverage

## Goal

Add `Alexander’s World` as a structured entry point and communicate dataset limits.

## Why Now

The user needs to understand the current era, region, coverage, and recommended start state.

## Scope

- minimal ContentCollection model in the app;
- collection viewport and year;
- linked entities;
- coverage metadata;
- collection badge/panel;
- optional collection route;
- move to recommended collection state.

## Deliverables

- `Alexander’s World` collection;
- coverage UI;
- collection-to-map navigation;
- missing-coverage messaging.

## Acceptance Criteria

- collection opens 334 BCE and the intended viewport;
- collection links to its included entities;
- coverage scope is understandable;
- leaving detailed geography does not misrepresent empty areas;
- collection state can be represented in URL.

## Validation

- typecheck;
- lint;
- test;
- data validation;
- build;
- manual collection navigation test.

## Out of Scope

- guided stories;
- collection authoring UI;
- public user collections.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `PRODUCT_STRUCTURE.md` if collection behavior changes.

---

# F17 — Granicus Vertical Content Slice

## Goal

Create the first coherent, reviewed, published historical dataset.

## Why Now

Foundation is not complete until the technical systems support meaningful real content.

## Scope

Target usable slice:

- 8–15 polities over the wider collection;
- 20–40 territory states;
- 30–60 places;
- 15–30 people;
- 15–30 events and battles;
- 2–6 journeys or campaigns;
- 10–25 sources.

The minimum release-critical core remains:

- Macedonia;
- Achaemenid Empire;
- Alexander III;
- Darius III;
- key places;
- Battle of the Granicus;
- initial route;
- linked reviewed sources.

## Deliverables

- reviewed source registry;
- published entity records;
- territory geometry;
- route geometry;
- relation integrity;
- collection membership;
- editorial notes and uncertainty.

## Acceptance Criteria

- the core story is fully navigable through map, search, catalogs, cards, and pages;
- every published record has sources;
- uncertainty is visible;
- all references resolve;
- historical names work;
- active-year behavior is consistent;
- data validation passes without blocking errors;
- the collection does not imply complete coverage.

## Validation

- typecheck;
- lint;
- test;
- data validation;
- build;
- `git diff --check`;
- manual editorial and product walkthrough.

## Out of Scope

- unsourced bulk expansion;
- automatic scraping;
- AI-generated publication;
- full global Alexander-era coverage.

## Documentation Updates

- `CURRENT_STATUS.md`;
- `PROJECT.md` roadmap status;
- `PRODUCT_RULES.md` only for approved new invariants.

## Suggested Content Iterations

1. source registry;
2. Macedonia and Achaemenid polity records;
3. first places;
4. Alexander, Darius, and commanders;
5. Granicus battle;
6. route stages and geometry;
7. territory states;
8. related events and places;
9. editorial review and publication status;
10. integrated walkthrough.

---

# F18 — Foundation Integration, Accessibility, and Release Readiness

## Goal

Stabilize the full foundation and prepare the first usable release.

## Why Now

The integrated product must be reliable, understandable, and honest before expanding scope.

## Scope

- integration fixes;
- loading and partial-error behavior;
- accessibility review;
- mobile usability;
- performance profiling;
- URL restoration audit;
- license and attribution audit;
- data-version compatibility;
- CI after scripts are real;
- documentation reconciliation.

## Deliverables

- stable foundation release candidate;
- CI checks;
- accessibility improvements;
- performance notes;
- documented basemap/data licenses;
- updated project documentation.

## Acceptance Criteria

- no critical browser errors;
- all core routes work;
- map and timeline remain usable on desktop and mobile;
- keyboard access works for major controls;
- selected year, viewport, layers, collection, and entity restore from URL;
- data validation passes;
- production build passes;
- attribution is visible;
- unsupported data versions fail clearly;
- no foundation-deferred feature was added accidentally.

## Validation

```text
npm run typecheck
npm run lint
npm run test
npm run data:validate
npm run build
git diff --check
```

Plus:

- manual desktop walkthrough;
- manual mobile-width walkthrough;
- browser console check;
- URL share/refresh/Back test;
- keyboard navigation check.

## Out of Scope

- backend;
- account system;
- guided stories;
- playback;
- year comparison;
- new historical era.

## Documentation Updates

- `PROJECT.md`;
- `CURRENT_STATUS.md`;
- `ARCHITECTURE.md`;
- `DEPLOYMENT.md`;
- `PRODUCT_STRUCTURE.md` only if the actual product changed.

## Recommended Commit

```text
chore: stabilize EraByEra foundation release
```

---

## 6. Recommended Immediate Sequence

### Batch 1

1. F1 — Application Shell and Routing
2. F2 — Historical Time Domain
3. F3 — Domain Schemas and Validation Foundation
4. F4 — Source Data and Runtime Build Pipeline

### Batch 2

5. F5 — Physical MapLibre Shell
6. F6 — URL-Synchronized Map State
7. F7 — Timeline Controls
8. F8 — Place Layer and Place Cards

### Batch 3

9. F9 — Polities and Territory Layers
10. F10 — Events and Battle Model
11. F11 — People and Active-Place Representation
12. F12 — Journeys and Campaign Routes

### Batch 4

13. F13 — Year Overview Panel
14. F14 — Local Search
15. F15 — Entity Pages and Explore Catalogs
16. F16 — Content Collections and Coverage

### Batch 5

17. F17 — Granicus Vertical Content Slice
18. F18 — Foundation Integration, Accessibility, and Release Readiness

---

## 7. Store and State Strategy

Do not create a single store containing all product data and map logic.

Recommended boundaries:

```text
URL state
├── year
├── viewport
├── active layers
├── selected entity
└── collection

UI state
├── panel state
├── search query
├── density
└── local preferences

Dataset state
└── loaded immutable validated runtime data

Domain selectors
└── derive active-year and presentation models
```

Repositories or backend abstractions are not needed in foundation because runtime data is static.

---

## 8. Data Migration and Versioning

Every runtime dataset must include:

```json
{
  "schemaVersion": 1,
  "datasetVersion": "alexander-0.1.0"
}
```

Rules:

- incompatible versions produce a clear failure;
- UI components do not migrate data;
- migrations happen in source/build scripts;
- source and schema changes are committed together;
- generated output is reproducible.

---

## 9. Mandatory Automated Test Coverage

Foundation must test:

1. BCE/CE transitions;
2. no displayed year zero;
3. inclusive temporal ranges;
4. date precision;
5. period-specific names;
6. active territory selection;
7. coordinates as `[longitude, latitude]`;
8. Zod schema validation;
9. source/reference integrity;
10. URL parse/serialize;
11. historical-name search;
12. zoom/importance visibility;
13. invalid period overlap;
14. inactive entity behavior;
15. collection defaults;
16. dataset-version handling.

---

## 10. Documentation Maintenance

After each repository-relevant iteration:

1. re-read `CURRENT_STATUS.md`;
2. update the factual snapshot;
3. add a Recent history entry when relevant;
4. independently determine whether a Significant entry is warranted;
5. record failed or not-run validation honestly;
6. update specialized documents when their source-of-truth area changed.

The next documentation iteration after adding these files should:

- add them to `PROJECT.md`;
- reconcile roadmap terminology;
- update `CURRENT_STATUS.md`;
- remove open decisions already resolved;
- update `ARCHITECTURE.md` only where this approved plan clarifies real technical boundaries.

---

## 11. Recommended Commit Boundaries

```text
feat: add EraByEra application shell and routing
feat: add historical time domain utilities
feat: add validated historical entity schemas
feat: add historical data build pipeline
feat: add physical MapLibre map shell
feat: synchronize map state with URL
feat: add historical timeline controls
feat: render places and place detail cards
feat: render polities and historical territories
feat: add events and battle presentation
feat: add people at active historical locations
feat: render journeys and campaign routes
feat: add selected-year overview
feat: add local historical search
feat: add entity pages and Explore catalogs
feat: add Alexander’s World content collection
content: add reviewed Granicus vertical slice
chore: stabilize EraByEra foundation release
```

---

## 12. First Cursor Task

```text
Repository context

Project: EraByEra
Repository: erabyera
Repository path: C:\Projects\erabyera
Remote: https://github.com/jeehead-cloud/erabyera.git
Expected branch: main

Task

Establish the EraByEra application shell and routing without implementing the map or historical domain logic.

Before making changes, verify:
- current working directory
- repository root
- git remote -v
- current branch
- git status --short
- changed files match the stated current state

Scope:
- inspect the actual repository first;
- create or normalize the React + TypeScript + Vite foundation;
- add React Router;
- add a shared application shell;
- add routes for /map, /explore, and /sources;
- redirect / to /map;
- add minimal not-found and error states;
- add only lightweight base design tokens and layout;
- preserve any working repository behavior;
- keep the project buildable.

Do not:
- add MapLibre;
- add historical schemas;
- add timeline logic;
- add real historical data;
- add backend, database, authentication, or deployment-provider configuration;
- perform unrelated cleanup.

Validation:
- run only scripts that actually exist;
- run typecheck, lint, test, build, and git diff --check where available;
- report PASS only for commands that completed successfully;
- manually verify route navigation and browser refresh.

Documentation:
- review and update CURRENT_STATUS.md;
- update ARCHITECTURE.md if the implemented routing or folder structure differs from the documented proposal.
```

---

## 13. Completion Definition

Foundation is complete when:

- the application has stable routes;
- historical time semantics are centralized and tested;
- source and runtime data are separated;
- data validation is mandatory;
- the physical basemap is legal and correctly attributed;
- URL state is reproducible;
- timeline navigation works;
- places, territories, events, people, and routes respond to time;
- compact cards and full pages work;
- local search works with historical names;
- Explore catalogs work;
- `Alexander’s World` communicates its coverage;
- the Granicus slice is reviewed, sourced, linked, and published;
- the product remains usable on desktop and mobile;
- production build and validation pass;
- deferred features remain deferred.

---

## Guiding Principle

**Build the smallest complete, trustworthy historical experience first. Expand only after the map, time model, data pipeline, sources, and one coherent story all work together.**
