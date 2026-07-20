# EraByEra вЂ” Architecture

**Status:** F1–F16 application, domain, static-data, map, URL-state, historical entities, overview, search, pages, catalogs, collections, and coverage implemented; later architecture proposed
**Last updated:** 2026-07-20
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`

> This document defines the intended technical architecture for the first implementation.
> It must be updated when the real repository diverges from this proposal.

---

## 1. Architecture Goals

- remain simple enough for a solo hobby project;
- render map data efficiently without a backend;
- keep historical data separate from UI code;
- make temporal logic explicit and testable;
- support incremental migration from static files to a backend later;
- keep URLs reproducible and shareable;
- make data validation part of normal development.

---

## 2. Technical Stack

| Layer | Choice | Current status / rationale |
|---|---|---|
| Language | TypeScript | Implemented in F1 with strict project references |
| Build tool | Vite | Implemented in F1 for the client-side application |
| UI | React | Implemented in F1 for the shell and route screens |
| Routing | React Router | Implemented in F1 with a nested shared shell, root redirect, wildcard route, and route error fallback |
| Styling | Plain structured CSS | Implemented in F1 with local tokens and global component/layout classes |
| Package manager | npm | Implemented with a lockfile |
| Map | MapLibre GL JS 5.24 + `react-map-gl/maplibre` 8.1 | Implemented in F5 with a local Natural Earth physical style |
| State | URL + local React state | Implemented in F6 for reproducible map navigation; Zustand remains deferred |
| Validation | Zod | Implemented for time, entities, source wrappers, runtime data, and GeoJSON |
| Testing | Vitest | Implemented for domain and repository data-pipeline tests |
| Data | JSON + GeoJSON in repository | Canonical source and geometry plus committed deterministic runtime output implemented in F4 |
| Script runner | tsx | Node-only TypeScript data commands implemented in F4 |
| Backend | None for foundation | Static client application |

### F1 application boundary

The application entry point mounts `App`, which places the router inside an application-level render error boundary. The router owns the shared `AppShell`; child routes render through an `Outlet`. This gives later screens one stable layout boundary without introducing global state or domain abstractions early.

F1 has two complementary recovery layers:

- `AppErrorBoundary` catches unexpected React render failures and offers return-to-map and reload actions;
- the router `errorElement` catches navigation or loader failures and offers a safe return to `/map`.

Unknown URLs are normal product navigation states and render `NotFoundPage` inside the shared shell rather than using the exceptional error fallback.

### Why not a single image overlay with Leaflet

A static image overlay is acceptable for a prototype, but it becomes restrictive for historical territory polygons, feature queries, vector styling, clustering, and large datasets. MapLibre provides a better long-term map foundation while remaining usable in a static frontend.

---

## 3. Repository Structure

The implemented F1–F4 structure additionally includes:

```text
erabyera/
|-- index.html
|-- package.json
|-- package-lock.json
|-- eslint.config.js
|-- tsconfig.json
|-- tsconfig.app.json
|-- tsconfig.node.json
|-- tsconfig.scripts.json
|-- data/
|   |-- source/             # canonical strict JSON records and dataset descriptor
|   |-- geometry/           # canonical territory and journey GeoJSON
|   `-- generated/          # committed, deterministic runtime output; never hand-edit
|-- scripts/data/           # Node-only load, validation, build, check, and tests
|-- public/map-data/        # local Natural Earth physical GeoJSON
|-- docs/BASEMAP.md         # basemap provenance, license, audit, and operations
|-- vite.config.ts
|-- design/                 # read-only references
`-- src/
    |-- main.tsx
    |-- vite-env.d.ts
    |-- app/
    |   |-- App.tsx
    |   |-- AppErrorBoundary.tsx
    |   `-- router.tsx
    |-- components/
    |   |-- AppShell/AppShell.tsx
    |   |-- Timeline/       # F7 controls, input, step selector, model, styles, and tests
    |   |-- PlaceDetails/   # F8 compact card and historical-data status UI
    |   |-- YearOverview/   # F13 responsive contextual overview and section lists
    |   `-- GlobalSearch/   # F14 keyboard-accessible responsive search overlay
    |-- domain/time/
    |   |-- datePrecision.ts
    |   |-- historicalYear.ts
    |   |-- schemas.ts
    |   |-- temporalRange.ts
    |   |-- index.ts
    |   `-- time.test.ts
    |-- domain/entities/
    |   |-- common.ts
    |   |-- source.ts
    |   |-- uncertainty.ts
    |   |-- place.ts
    |   |-- polity.ts
    |   |-- person.ts
    |   |-- event.ts
    |   |-- journey.ts
    |   |-- collection.ts
    |   |-- validation.ts
    |   |-- fixtures.ts
    |   |-- index.ts
    |   `-- entities.test.ts
    |-- domain/geometry/    # browser-safe GeoJSON Zod contracts
    |-- domain/places/      # F8 selectors, presentation, GeoJSON, selection, and tests
    |-- domain/overview/    # F13 ranking, coverage/presentation model, selection, and tests
    |-- domain/search/      # F14 schemas, normalization, matching/ranking, navigation, and tests
    |-- domain/entityPages/ # F15 full-page models, stable routes, relations/evidence, and Map links
    |-- domain/explore/     # F15 catalog eligibility, URL state, search constraint, sorting, and counts
    |-- domain/collections/ # F16 membership, coverage, counts, inverse lookup, and navigation
    |-- data/               # runtime schema, bundled generated-data loader, hook, and tests
    |-- map/                # basemap/camera plus F8 native historical place layers
    |-- url/                # F6 URL schemas, pure state contract, router hook, and tests
    |-- pages/
    |   |-- MapPage.tsx
    |   |-- ExplorePage.tsx
    |   |-- SourcesPage.tsx
    |   |-- EntityPage/     # shared route component with explicit per-type sections
    |   |-- ExploreCatalogPage/
    |   `-- NotFoundPage.tsx
    `-- styles/
        |-- tokens.css
        `-- global.css
```

Historical-layer rendering and shared non-URL UI state remain future work. Canonical source data is never imported directly by application code; the app-facing boundary is `src/data` and generated runtime JSON.

### Later directional structure

The following remains a direction for later milestones, not a claim about current files:

```text
erabyera/
в”њв”Ђв”Ђ index.html
в”њв”Ђв”Ђ package.json
в”њв”Ђв”Ђ tsconfig.json
в”њв”Ђв”Ђ vite.config.ts
в”њв”Ђв”Ђ README.md
в”њв”Ђв”Ђ PROJECT.md
в”њв”Ђв”Ђ AI_AGENTS.md
в”њв”Ђв”Ђ ARCHITECTURE.md
в”њв”Ђв”Ђ CURRENT_STATUS.md
в”њв”Ђв”Ђ PRODUCT_RULES.md
в”њв”Ђв”Ђ DEPLOYMENT.md
в”њв”Ђв”Ђ public/
в”‚   в”њв”Ђв”Ђ map-style/
в”‚   в”‚   в””в”Ђв”Ђ style.json
в”‚   в””в”Ђв”Ђ data/
в”‚       в”њв”Ђв”Ђ places.json
в”‚       в”њв”Ђв”Ђ polities.json
в”‚       в”њв”Ђв”Ђ territories.geojson
в”‚       в”њв”Ђв”Ђ people.json
в”‚       в”њв”Ђв”Ђ events.json
в”‚       в”њв”Ђв”Ђ journeys.geojson
в”‚       в””в”Ђв”Ђ sources.json
в”њв”Ђв”Ђ scripts/
в”‚   в”њв”Ђв”Ђ validate-data.ts
в”‚   в””в”Ђв”Ђ build-data.ts
в””в”Ђв”Ђ src/
    в”њв”Ђв”Ђ main.tsx
    в”њв”Ђв”Ђ App.tsx
    в”њв”Ђв”Ђ styles/
    в”‚   в””в”Ђв”Ђ index.css
    в”њв”Ђв”Ђ domain/
    в”‚   в”њв”Ђв”Ђ types.ts
    в”‚   в”њв”Ђв”Ђ schemas.ts
    в”‚   в”њв”Ђв”Ђ time.ts
    в”‚   в”њв”Ђв”Ђ selectors.ts
    в”‚   в””в”Ђв”Ђ importance.ts
    в”њв”Ђв”Ђ data/
    в”‚   в”њв”Ђв”Ђ loadData.ts
    в”‚   в””в”Ђв”Ђ dataStore.ts
    в”њв”Ђв”Ђ state/
    в”‚   в””в”Ђв”Ђ useAppStore.ts
    в”њв”Ђв”Ђ map/
    в”‚   в”њв”Ђв”Ђ MapView.tsx
    в”‚   в”њв”Ђв”Ђ layers/
    в”‚   в”‚   в”њв”Ђв”Ђ PlaceLayer.tsx
    в”‚   в”‚   в”њв”Ђв”Ђ TerritoryLayer.tsx
    в”‚   в”‚   в”њв”Ђв”Ђ EventLayer.tsx
    в”‚   в”‚   в””в”Ђв”Ђ JourneyLayer.tsx
    в”‚   в””в”Ђв”Ђ mapState.ts
    в”њв”Ђв”Ђ components/
    в”‚   в”њв”Ђв”Ђ Timeline.tsx
    в”‚   в”њв”Ђв”Ђ LayerControls.tsx
    в”‚   в”њв”Ђв”Ђ SearchPanel.tsx
    в”‚   в”њв”Ђв”Ђ DetailPanel.tsx
    в”‚   в””в”Ђв”Ђ AppHeader.tsx
    в””в”Ђв”Ђ url/
        в””в”Ђв”Ђ urlState.ts
```

The actual repository remains the source of truth. Later milestones should adapt this direction to the implementation rather than recreating it blindly.

---

## 4. Core Domain Model

### F3 canonical entity contracts

The canonical F3 API is exported by `src/domain/entities/index.ts`. Each source-data object uses an explicit strict Zod schema: unknown fields are rejected so misspellings cannot silently disappear. Shared metadata is intentionally limited to stable ID, default name, editorial status, and optional summary; specialized fields remain on their entity schemas.

Entity IDs use lowercase ASCII letters, digits, and single hyphens:

```text
sample-place
alexander-iii
```

IDs are language-neutral, URL-safe, contain no whitespace or path separators, and do not require type prefixes or UUIDs. Schema metadata uses literal `schemaVersion: 1`; dataset versions use a lowercase dataset name plus semantic version, such as `sample-0.1.0`. Migration execution and runtime manifests remain F4 work.

Canonical editorial statuses are `draft`, `reviewed`, `published`, and `deprecated`. A shared refinement requires every published entity record to contain at least one SourceReference. Sources themselves are bibliographic records and do not self-reference. Full reference-existence and source-quality checks require the complete F4 dataset.

Uncertainty is categorical:

- confidence: `high`, `medium`, `low`, `disputed`, `unknown`;
- location accuracy: `exact`, `approximate`, `settlement-area`, `regional`, `disputed`, `unknown`;
- territory control: `core`, `direct`, `claimed`, `tributary`, `dependent`, `sphere-of-influence`, `disputed`, `approximate`.

Coordinates are strict `[longitude, latitude]` tuples bounded to `[-180, 180]` and `[-90, 90]`. No map or GeoJSON dependency is required in F3.

Distinct contracts exist for:

- Source and SourceReference;
- Place plus name, ownership, and 1–5 importance periods;
- Polity plus capital/ruler periods and separate TerritoryPeriod metadata;
- Person plus bounded person-place relationships and 1–5 importance;
- ordinary Event and specialized Battle within the HistoricalEvent union;
- Journey/Campaign plus unique sequential route stages;
- ContentCollection with grouped links, bounded viewport, coverage metadata, dataset version, and in-range recommended start year.

All temporal fields import the F2 time schemas. F3 does not define a second year, range, or precision model.

Pure helpers support missing-reference discovery and inclusive temporal-overlap detection over caller-selected period arrays. Overlap is not rejected universally because competing historical interpretations may legitimately coexist. Synthetic fixtures exercise every major contract without creating canonical history.

### Earlier conceptual examples

The examples below describe the original direction. Where names or optional fields differ, the strict schemas exported from `src/domain/entities` are authoritative.

### Shared temporal range

```ts
interface TemporalRange {
  yearFrom: number
  yearTo: number | null
  datePrecision?:
    | 'exact'
    | 'year'
    | 'approximate'
    | 'decade'
    | 'century'
    | 'range'
    | 'before'
    | 'after'
    | 'unknown'
}
```

Negative years represent BCE, positive years represent CE, and zero is invalid. F2 implements and validates this contract in `src/domain/time`.

### Source reference

```ts
interface SourceRef {
  sourceId: string
  locator?: string
  note?: string
}
```

### Place

```ts
interface Place {
  id: string
  defaultName: string
  coordinates: [number, number] // [longitude, latitude]
  existence: TemporalRange
  names: PlaceNamePeriod[]
  ownership: PlaceOwnershipPeriod[]
  importance: PlaceImportancePeriod[]
  sourceRefs: SourceRef[]
}
```

### Polity

```ts
interface Polity {
  id: string
  defaultName: string
  existence: TemporalRange
  color: string
  flagAsset?: string
  sourceRefs: SourceRef[]
}
```

Territory geometry is stored separately as GeoJSON features so large polygons do not bloat the polity metadata records.

### Person

```ts
interface Person {
  id: string
  defaultName: string
  life: TemporalRange
  locations: PersonPlacePeriod[]
  importance: number
  summary?: string
  sourceRefs: SourceRef[]
}
```

### Event / Battle

A battle is initially represented as an event subtype instead of a completely separate rendering architecture.

```ts
type EventType = 'battle' | 'political' | 'cultural' | 'disaster' | 'epidemic' | 'other'

interface HistoricalEvent {
  id: string
  type: EventType
  name: string
  period: TemporalRange
  coordinates?: [number, number]
  participantPolityIds?: string[]
  participantPersonIds?: string[]
  summary?: string
  sourceRefs: SourceRef[]
}
```

### Journey

Journeys use GeoJSON LineString or MultiLineString geometry plus metadata.

```ts
interface JourneyProperties {
  id: string
  name: string
  period: TemporalRange
  personIds?: string[]
  polityIds?: string[]
  sourceRefs: SourceRef[]
}
```

---

## 5. Temporal Semantics

All temporal filtering must go through the public API exported by `src/domain/time/index.ts`.

```ts
historicalYearSchema
datePrecisionSchema
temporalRangeSchema
formatHistoricalYear(year)
nextHistoricalYear(year)
previousHistoricalYear(year)
shiftHistoricalYear(year, steps)
isActiveAtYear(range, year)
intersectsHistoricalYearRange(range, from, to)
nearestYearInTemporalRange(range, year)
```

### Historical years

- historical years must be JavaScript safe integers;
- BCE years are negative and CE years are positive;
- zero is rejected at runtime;
- `-1` and `1` are adjacent historical years;
- shifting converts through a zero-free ordinal so no movement utility can return zero;
- no product-specific minimum or maximum year is imposed beyond the technical safe-integer requirement.

### Temporal ranges

Closed ranges use inclusive boundaries:

```text
yearFrom <= selectedYear <= yearTo
```

`yearTo: null` means unknown or unsupplied. By default such a range is not considered active and does not intersect a query. A caller may pass `treatUnknownEndAsOpenEnded: true` only when its own domain contract explicitly permits that interpretation.

For nearest-year selection, a closed range clamps to its inclusive start or end. An unknown-ended range returns its known start for requests at or before that start, returns the requested later year only under explicit open-ended semantics, and otherwise returns `null` rather than inventing an end.

Overlapping time-dependent records for the same field should be rejected by validation unless the schema explicitly permits competing interpretations.

### Testing

Vitest runs as a Node-based unit-test environment with no browser or DOM dependency. `npm run test` executes once and exits; `npm run test:watch` is the optional local watch mode. F2 covers historical-time behavior, F3/F4 cover entity and complete-dataset contracts, F5 adds pure configuration/style audits, F6 tests URL state, and F7 tests timeline input, movement, slider, URL-preservation, and history policy without mocking WebGL or rendering React in Node.

---

## 6. Map Rendering Architecture

Use MapLibre sources and layers for scalable rendering:

- territories: fill + boundary line layers;
- journeys: line layers;
- events: symbol/circle layers;
- places: circle/symbol layer with feature-state or data-driven styling;
- selected feature: separate highlight layer or feature state.

React controls the map and panels, but high-volume features should not be rendered as individual React marker components.

### Basemap

F5 implements a repository-managed MapLibre Style Specification in `src/map/basemap.ts`. It references four same-origin Natural Earth 1:110m physical GeoJSON files: land, coastline, lakes, and rivers/lake centerlines. No cultural dataset, symbol layer, glyphs, sprites, administrative boundary, populated-place source, remote tile URL, provider account, or token is used.

The style provides ocean background, land/lake fills, river lines, and coastline lines. Its automated structural audit rejects known political, settlement, transport, and label categories. `docs/BASEMAP.md` records primary-source provenance, exact asset hashes, public-domain terms, visible attribution, production considerations, and the remaining owner visual audit.

The initial viewport is centralized at longitude `28`, latitude `37`, zoom `3.5`, bearing `0`, and pitch `0`. Zoom is bounded from `1.5` to `7` because the generalized 1:110m vectors are not close-detail data. F6 reuses these values as URL defaults and controls longitude, latitude, and zoom without duplicating the map limits.

`MapView` uses the official React wrapper lifecycle, allowing mount cleanup under React Strict Mode. It owns local loading/error/retry state and a responsive local camera value. `onMove` updates only that local camera; `onMoveEnd` commits longitude, latitude, and zoom to the URL with history replacement. Router-originated state changes update the controlled camera only when values differ at serialized precision, so Back/Forward can restore the view without map/URL feedback loops. A retry still unmounts and recreates only the map. Map resource errors remain inside the map route; the application error boundary remains the fallback for unexpected React failures.

MapLibre’s official CSS is imported exactly once from `src/main.tsx`. The shell uses a bounded viewport grid, a scroll-capable main region, and an explicit full-height map chain so the canvas cannot collapse at desktop or mobile widths.

---

## 7. State Boundaries

### Global client UI state

- selected year;
- active layers;
- selected entity;
- search query / result state;
- map center and zoom when needed outside the map component;
- playback state later.

### Dataset state

Loaded validated datasets should be treated as immutable during normal app usage.

### URL state

F6 implements the authoritative map-navigation contract in `src/url`:

```text
?year=-323&lat=32.5&lng=30.2&zoom=4.7&layers=territories,places,events&entity=event:sample-event&collection=sample-collection
```

`MapUrlState` contains the F2 `HistoricalYear`, latitude, longitude, zoom, stable historical layer IDs, an optional typed selected-entity reference, and an optional collection ID. Supported historical layer IDs have canonical order `territories`, `places`, `people`, `events`, `journeys`; the physical basemap is never a toggle layer. Supported selected types are `place`, `polity`, `person`, `event`, and `journey`, encoded as `type:id`. Entity and collection IDs reuse the F3 entity-ID schema but are not resolved against runtime data in F6.

The default state is year `-334`, the F5 viewport, active layers `territories`, `places`, and `events`, with no selection or collection. Default-valued known parameters are omitted. An absent `layers` parameter selects the default set, while `layers=` explicitly selects none. Known parameters serialize in the order `year`, `lat`, `lng`, `zoom`, `layers`, `entity`, `collection`; unrelated parameters are preserved and sorted after known parameters.

Parsing is strict: numeric tails, non-finite values, year zero, fractional or unsafe years, malformed IDs, and unknown selection types never reach MapLibre. Malformed numbers fall back to defaults. Finite out-of-range latitude, longitude, and zoom values clamp consistently. Latitude uses the Web Mercator practical limit `±85.051129`, longitude uses `±180`, and zoom reuses F5 limits. Coordinates serialize to at most six decimal places and zoom to at most two, with negative zero normalized.

`useMapUrlState` parses React Router location state and replaces valid-but-noncanonical URLs once. Map movement commits use replace so dragging does not flood history; future explicit navigation actions default to push. React Router location changes, including browser Back/Forward, are the popstate adapter. Equivalent canonical state suppresses redundant navigation. Pure parse, normalize, serialize, canonicalize, comparison, and canonical-share URL helpers remain usable without React or browser globals.

### Timeline state and controls

F7 implements `src/components/Timeline` as a bottom map overlay. `MapUrlState.year` remains the only committed selected-year source of truth; `MapPage` passes it into the timeline and sends year-only updates through the F6 updater. Timeline changes use history replacement, preserving viewport, layers, entity, collection, and unrelated query parameters without remounting MapLibre.

Local component state is limited to the direct-input draft and the selected step size. Direct input uses a positive integer magnitude plus an explicit `BCE`/`CE` selector. Enter or Apply validates through F2 before committing; Escape restores the URL-backed value. Empty, zero, negative, fractional, malformed, and unsafe magnitudes remain local errors and never modify URL state. Router Back/Forward changes replace the draft from the newly selected year.

Step sizes are exactly `1`, `5`, `10`, `25`, `50`, and `100`, defaulting to `1` and remaining local without persistence or URL expansion. Previous/next-year and previous/next-step actions call F2 `shiftHistoricalYear`; no control uses raw signed-year arithmetic, so `1 BCE` and `1 CE` remain adjacent.

The native range input covers `1000 BCE` through `1000 CE`. It uses a zero-free ordinal: BCE values retain their negative number, while CE year `n` maps to `n - 1`; ordinal `-1` is `1 BCE` and ordinal `0` is `1 CE`. Direct input still accepts every F2 safe nonzero integer. When selection lies outside the slider range, the selected URL year remains unchanged, the slider rests at the nearest endpoint, and explanatory text is shown.

The overlay uses existing parchment, ink, and brass tokens, leaves a bottom attribution clearance, wraps controls below 900px, increases touch targets below 600px, and keeps the slider and all navigation available. Native inputs, selects, and buttons provide keyboard operation; labels, action names, live selected-year output, range value text, visible focus, and announced validation errors provide the accessibility contract. Rendered layout and interaction remain owner-browser checks.

### F8 place data and presentation flow

F8 imports the committed `data/generated/runtime.json` and generated manifest through `src/data/loadRuntimeData.ts`. The existing F4 Zod loader validates schema version and complete aggregate shape, verifies the runtime dataset version against the manifest, and deep-freezes the result. `useRuntimeData` loads once for the map route and exposes loading, ready, atomic error, and explicit retry states. Because the generated artifact is aggregate and bundled, F8 does not invent partial-record recovery; a validation failure disables historical layers while leaving the physical basemap usable.

`src/domain/places` is a pure boundary from immutable canonical runtime records to compact presentation models. Activity, names, ownership, and importance all use F2 `isActiveAtYear` with inclusive closed ranges and the approved non-open-ended default for unknown ends. Exactly one active period is accepted; overlaps fail safely instead of choosing arbitrarily. Missing active importance produces `null` and therefore no normal marker. Owner names resolve only from runtime polities.

Place importance maps to minimum zoom centrally: importance 5 → 1.5, 4 → 2.5, 3 → 3.5, 2 → 4.5, and 1 → 5.5. Generated point features retain `[longitude, latitude]`, stable IDs, display name, importance, activity, selection, and location accuracy only. Full records and source objects never enter GeoJSON. Features are deterministically ordered; missing coordinates produce no marker.

`PlaceLayer` uses one local MapLibre GeoJSON source, five native circle layers with matching minimum zooms, and one selected circle layer above them. Normal layers include only active places with active importance when the `places` URL layer is enabled. An explicit selected place overrides activity, zoom, and layer-toggle visibility, so refresh restoration remains visible without automatic map fitting. Selection is distinguished by size and outline; location uncertainty also changes outline width. Text labels are deferred because the physical style intentionally has no glyph service.

Map clicks on rendered place layers push the F6 `entity=place:<id>` selection; empty-map clicks clear only a place selection and also push. Map movement remains replace-based. Non-place typed selections remain untouched. Selected-year changes rebuild presentation and GeoJSON without remounting MapLibre, while viewport changes preserve year and selection.

The compact `PlaceDetailsCard` shows the selected-year name, default name when different, type, activity, existence range, owner, importance, coordinates/location accuracy, summary, uncertainty, and up to two primary references plus total count. Source aggregation prioritizes active name, ownership, and importance references before entity-level references, deduplicates identical references, preserves distinct locators, and excludes inactive-period evidence. Unresolved IDs and sources are reported without fabricated labels.

Inactive selected places retain their card and marker and offer first-known and, when distinct and knowable, nearest-active-year actions. Missing-coordinate records retain a card without moving the map. Desktop cards sit below map controls and above the timeline; mobile uses a scrollable compact lower panel above the timeline. Historical-data status sits below the basemap loading notice, and all overlays leave attribution clearance. Pure Node tests cover loader compatibility, selectors, visibility, GeoJSON, URL selection, inactive navigation, sources, and layer configuration; rendered interaction remains an owner-browser check.

### F9 polity and territory data and presentation flow

F9 reuses the same immutable `useRuntimeData` result and generated `runtime.json`; browser code never imports editable territory metadata or GeoJSON. The F4 aggregate runtime schema/version check and deep freeze remain the single browser boundary, including `geometry.territories`. Geometry carries only its TerritoryPeriod link; TerritoryPeriod metadata is the authoritative evidence path.

`src/domain/polities` derives polity activity, active capital and ruler records, active TerritoryPeriods, geometry availability, nearest active/mapped years, and compact evidence from the F7/F6 selected year. All temporal decisions reuse inclusive F2 helpers with the explicit non-open-ended unknown-end default. Period-aware place naming supplies capital names, people supply stable ruler names, and unresolved relations fail to null labels without inventing data. Polity existence never depends on mapped territory.

Territory GeoJSON retains Polygon/MultiPolygon coordinates unchanged as `[longitude, latitude]`, uses stable geometry IDs, deterministic ordering, polity color, control category, confidence, and selection only, and omits full records and source objects. Normal active features appear only when `territories` is active. A selected polity retains only active resolved geometry as a layer-disabled override; inactive or unmapped selection never revives an old polygon.

`TerritoryLayer` owns one local MapLibre GeoJSON source. Normal translucent fills are followed by solid certain boundaries, dashed approximate/claim/disputed boundaries, selected fill, and a wide light selected boundary. The entire territory component renders before `PlaceLayer`, keeping all place circles above fills. Map interaction scans rendered results for places before polities, then uses rendered territory order as the overlap click policy. Overlap cycling is deliberately deferred, but every active claim remains a separate feature.

Territory clicks push `entity=polity:<id>` through F6 while preserving year, viewport, layers, collection, and unrelated parameters. Empty-map clearing owns only place and polity selections; person, event, and journey references remain untouched. Timeline and map movement retain replace history. The compact polity card presents activity, existence, capital/ruler relations, current control/confidence, summary, geometry availability, and selected-year sources; inactive and active-but-unmapped records remain inspectable with deterministic year actions.

Polity evidence priority is active territories, active capitals, active rulers, then polity-level references. Exact duplicate references are removed, locator-distinct references remain, and inactive period evidence is excluded. Pure Node tests cover activity, relations, presentation, evidence, Polygon/MultiPolygon output, overlap preservation, layer activation/ordering/style groups, URL selection, and missing geometry; MapLibre rendering itself remains an owner-browser check.

### F10 event and battle data and presentation flow

F10 consumes `events`, related records, and sources from the existing immutable `useRuntimeData` result. No event component imports canonical source files, pipeline modules, or Node APIs. The F4 generated runtime union remains authoritative: Battle is parsed and retained as a specialized HistoricalEvent rather than loaded through a second path.

`src/domain/events` derives inclusive F2 activity, explicit location availability, generic or battle presentation, related polity/person/place/journey labels, nearest active years, compact evidence, and deterministic point GeoJSON. Missing coordinates remain `null`, never `[0,0]`; non-unknown accuracy without coordinates and unknown accuracy with coordinates fail presentation derivation safely. Related place names use the nearest event-period year so an inactive selection does not present a name from an unrelated map year.

Battle presentation extends the common event model with authored side order, deduplicated side polity/person/commander relations, outcomes, required result, optional related journey, optional forces/losses only when modeled, and disputed notes. Unresolved references retain IDs with null display names rather than fabricated copy. Event-level references are the authoritative evidence path because the current battle detail/side schemas have no separate source fields; participant entities' general sources are deliberately excluded.

`EventLayer` owns one local GeoJSON source and native circle layers for exact ordinary events, uncertain ordinary points, battles, and selected events. Uncertain points use increased radius, reduced opacity, and thicker outline; approximate battles also receive a thicker ring. Selected events use a larger five-pixel outline and lower opacity when inactive. No icons, text, glyphs, sprites, remote event assets, DOM markers, or importance system are introduced.

Historical component order is now physical basemap → territories → journeys → events → people → places. Interactive IDs and click handling use place → person → event → journey → territory priority, so point features win over routes and routes win over polygons. Normal event features require the URL-owned F7 year, enabled `events` layer, active period, and coordinates. Explicit mapped selection overrides inactivity and the layer toggle; unknown-location selection retains only its card. No selection changes year or viewport automatically.

Event clicks push `entity=event:<id>` through F6 while preserving viewport, year, layers, collection, and unrelated parameters. Empty-map clearing owns place, polity, and event selections only. The compact event card shares the established contextual position but remains entity-specific; Battle adds structured sections rather than using a schema-driven universal renderer. Pure Node tests cover activity, all event types, location integrity, battle specialization, relations, evidence, GeoJSON, layer/order configuration, selection, and temporal actions; rendered behavior remains an owner-browser check.

### F11 people and active-place presentation flow

F11 consumes people and relations from the same immutable generated runtime. `src/domain/people` separates F2 life activity from active PersonPlacePeriod activity. Every map coordinate is taken from the resolved runtime Place; Person gains no coordinate field. Active relationships are ordered campaign, rule, activity, residence, visit, birth, death, unknown. The first is the primary marker location while all active relationships remain card-visible.

Person presentations resolve associated polities and only explicitly modeled relationship event/journey IDs. Evidence prioritizes active relationship references then person-level references; Place, polity, event, and journey general sources are excluded. Mapped-year actions consider only relationships whose Place has coordinates. Alive-unmapped and outside-life states remain distinct and never revive an inactive location.

Visibility mirrors the centralized F8 thresholds: importance 5 through 1 begins at zoom 1.5 through 5.5. Aggregation occurs after year, layer, zoom, and selection policy, keyed by Place ID rather than coordinates. Members sort by importance descending, then name and ID. Selected active mapped people override zoom and disabled `people`; selected unmapped people keep only their card.

One compact GeoJSON source feeds native individual, aggregate, and selected circle layers. Aggregate size/stroke differs without glyphs or numeric labels. Current render order is territories → journeys → events → people → places; query/click priority is places → people → events → journeys → territories. A place wins the exact center, while the larger aggregate ring remains practically queryable. Aggregate clicks open a local semantic-button chooser and member choice writes `entity=person:<id>` with push history.

The person card presents life, roles, active relationship types/places, distinct relationship and Place uncertainty, associated polities, modeled events/journeys, sources, and explicit life/mapped-year actions. Pure Node tests cover life, relationships, priority, place naming, visibility, aggregation, GeoJSON, layers, selection, relations, evidence, and temporal actions; rendered behavior remains an owner-browser check.

### F12 journey and campaign route flow

F12 consumes Journey records and route features from the same immutable generated runtime. `src/domain/journeys` uses F2 for inclusive activity and nearest-year actions while resolving geometry by the canonical `geometryFeatureId`/`journeyId` pair. Activity and mapping are independent: an active Journey may lack geometry, and an inactive selected Journey remains inspectable without becoming historically active.

Stage resolution preserves the F3 authored sequential order. Each stage resolves only its explicit Place and Event links plus its own evidence; period-appropriate Place naming uses the stage year or nearest year in its stage period. Coordinate-only stages remain explicit, unresolved relations and sources fail visibly, and the browser neither inserts intermediate stages nor reconstructs routes.

Journey presentations resolve explicit Person and Polity participants, stage-derived related Places and Events, certainty, direction, uncertainty, start/end stage, and temporal actions. Evidence priority is Journey references followed by stage references in authored order. Exact duplicate references are removed, locator-distinct references remain, unresolved sources fail safely, and participant entities' general references are excluded.

`buildJourneyFeatureCollection` copies only validated generated LineString/MultiLineString geometry into compact deterministic features. Normal features require an active Journey, enabled `journeys` URL layer, and resolved geometry. A selected mapped Journey remains as an override when inactive or when the layer is disabled; selected active-but-unmapped journeys have a card but never receive an invented path.

`JourneyLayer` owns one local GeoJSON source. Documented/probable routes use a solid translucent line, schematic/uncertain routes use lower-opacity dashed treatment, and selected active/inactive routes use distinct wide highlight styles. Direction is shown in the card only when the canonical `directionKnown` flag supports it. F12 deliberately defers arrowheads and start/end markers rather than infer direction from coordinate order or add sprite/glyph dependencies.

Routes render between territory geometry and point layers. Centralized hit testing enforces place → person → event → journey → territory regardless of queried feature order. Journey clicks push `entity=journey:<id>` through F6 while preserving year, viewport, active layers, collection, and unrelated parameters; empty-map clearing covers only the five implemented entity types.

The compact responsive Journey card presents type, activity, route availability, explicit direction status, certainty, participants, stages, related entities, uncertainty, one or two primary evidence references, source count, and deterministic journey-year actions. Pure Node tests cover activity, mapping, LineString/MultiLineString transfer, stages, relations, evidence, certainty/direction policy, visibility overrides, layer/click order, selection, and temporal behavior. Native MapLibre rendering itself remains an owner-browser check.

### F13 selected-year overview flow

`src/domain/overview` composes the existing F8–F12 presentation builders over the immutable generated runtime and the F6/F7 selected year. It emits a compact model containing formatted year, ranked cross-entity items, published/active/mapped/unmapped counts, active territory count, dataset identity, collection resolution, layer-filter context, synthetic-fixture warning, and an explicit empty-state classification. It contains no JSX, MapLibre objects, mutable canonical records, AI prose, or duplicate time logic.

Eligibility is historical rather than map-visibility based. Events, polities, Places, and Journeys must be active; Places also require active F8 importance; People must be alive and have an active mapped relationship. Unknown-location events and active-but-unmapped polities or Journeys remain eligible. Disabled layers do not remove overview items and are retained as textual presentation state.

Ranking lives in `yearOverviewRanking.ts`. Events use a documented type display order, polities and Journeys use mapped status only as a map-context signal, Places use active importance descending, and People use importance then the existing relationship priority. Every comparator finishes with display name and stable ID. Limits are events 5, polities 5, Places 5, People 5, and Journeys 4. No polygon area, route length, randomness, combined score, or array-authoring order acts as historical importance.

Coverage distinguishes normal active content, no active published records, and active-but-unmapped records. Sparse foundation coverage and synthetic fixture status remain explicit. A URL collection is resolved read-only when available; its coverage note, regions, status, and selected-year inclusion are displayed without activating it or changing year/viewport. Unresolved collection IDs fail safely and remain in the URL.

`YearOverviewPanel` occupies the existing contextual-card position only when no typed entity is selected and no person aggregate chooser is open. Semantic sections and lists use ordinary buttons with visible focus and textual mapped/unmapped/layer-off/confidence states. Mobile uses the same scrollable panel above the timeline. Valid and unresolved entity selections continue to suppress the overview and use their established cards.

Overview selection delegates to existing typed selection constructors, pushes one history entry, and preserves year, viewport, layers, collection, and unknown parameters. F13 intentionally does not enable layers or move/focus the map; existing F8–F12 selected-feature overrides provide mapped context where available. Pure Node tests cover eligibility, ranking, limits, ties, coverage, collections, empty states, URL preservation, immutability, and prior entity-presentation regressions; rendered behavior remains an owner-browser check.

### F14 generated local search and browser flow

F14 adds `data/generated/search-index.json` as a fourth committed F4 artifact. It carries runtime schema version `1`, search-index format version `1`, the matching dataset version, and compact entries only: typed identity, primary name, authored variants, entity period, subtype/context, required layer, mapped periods, and point coordinates where deterministic. It excludes summaries, sources, participant arrays, full records, polygons, and route geometry. The manifest lists the file and entry count, and its SHA-256 fingerprint input includes the artifact. `data:check` therefore detects a missing, extra, or stale search index.

`scripts/data/search/buildSearchIndex.ts` derives entries only from validated published runtime data. Place name periods become historical variants when distinct from the stable default; authored Place transliterations retain their period. No alternate spelling, alias, or transliteration is inferred. Variants and entries are deduplicated and sorted deterministically, and output contains neither timestamps nor local paths.

`src/domain/search` is browser-safe and shared where appropriate with generation. `loadSearchIndex` validates schema, format, and dataset compatibility and deep-freezes the artifact before use. A failure disables only search; the physical map, timeline, layers, overview, and existing cards remain usable. The artifact is bundled like runtime data, so no independent fetch, fake progress, server, or network search boundary exists.

Normalization truncates to 200 input characters, applies Unicode NFKC, JavaScript locale-neutral lowercase, replaces Unicode punctuation/symbol runs with spaces, collapses whitespace, and trims. It preserves non-Latin characters and digits and performs no ASCII folding or automatic transliteration. Queries require two normalized characters.

Matching categories are exact primary, exact authored variant, primary prefix, variant prefix, ordered token-prefix, and substring. The comparator uses that category order, then current-year activity only as a tie-break, canonical type order, matched normalized name, and stable ID. It uses no fuzzy distance, opaque score, AI, randomness, geometry area, route length, source count, or description length. Results cap at 20 and group as Places, Polities, People, Events, and Journeys; Battle and Campaign remain subtypes.

Relevant-year derivation reuses F2 inclusive activity and nearest-range helpers. A matched historical/alias/transliteration period wins first. Active Places, polities, events, and Journeys retain the selected year; inactive records use the nearest valid entity year. People prefer an active reviewed point at the selected year, then the nearest reviewed mapped relationship, then their life range. The model cannot return year zero.

Selection creates one F6 push update containing the target year, typed entity, and the required layer added in canonical order while preserving every active layer, collection, and unrelated parameter. Place and mapped Event/Person results may set a validated point viewport; zoom is at least 5.5, preserves a closer zoom, and remains within F5 bounds. Polity polygon and Journey route fitting are deferred. Unknown-location and target-year-unmapped results do not change the viewport.

`GlobalSearch` is Map-local in F14 but reusable for a later global shell. Query and active-option state remain local React state and never enter the URL. The overlay provides a visible label, bounded `type=search` input, semantic grouped listbox/options, live status, clear/close actions, Escape, Arrow Up/Down, Home/End, Enter, touch selection, active-option ARIA, visible focus, opener focus restoration, bounded independent scrolling, and a mobile full-width presentation above the timeline. Opening search never changes the selected entity; successful selection closes it and existing F8–F12 cards respond to the single URL update.

### F15 entity pages and Explore flow

F15 extends the existing nested React Router with `/explore` plus five catalog routes and stable `/place/:entityId`, `/polity/:entityId`, `/person/:entityId`, `/event/:entityId`, and `/journey/:entityId` routes. All remain inside `AppShell`; there is no second router or duplicate shell. Route IDs reuse the F3 entity-ID validator, resolve against the immutable F4 runtime, and distinguish invalid parameters, valid missing IDs, runtime failure, and ordinary wildcard routes.

`src/domain/entityPages` builds a discriminated full-page model for each entity type. The shared base contains identity, full period, uncertainty, resolved complete evidence, deterministic explicit relations, and map availability. Specialized models retain Place name/importance chronology, Polity territory periods and control categories, bounded PersonPlace chronology, Event/Battle structured details, and ordered Journey stages. Existing F8–F12 presentations are composed for established meaning; raw runtime records remain immutable and no JSX or router object enters the domain model.

Full evidence follows entity-specific provenance: Place includes entity/name/ownership/importance references; Polity includes entity/capital/ruler/territory references; Person includes entity and bounded PersonPlace references; Event uses event-level references; Journey uses entity then stage references. Exact duplicate references are removed, locator-distinct references remain, resolved output is deterministically ordered, and unresolved IDs are isolated. Relations are derived only from authored IDs and inverse authored references, never geographic proximity.

`EntityPageShell` owns breadcrumbs, one page `h1`, status badges, summary, action position, relations, sources, and data notes. Explicit specialized sections remain in the route page rather than a schema-driven universal renderer. The same semantic document layout collapses to one column on narrow screens; native links, controls, headings, lists, external-link disclosure, focus styles, and recovery actions provide the static accessibility boundary.

`src/domain/explore` defines the five catalog paths, URL query model, eligibility, search constraint, sorting, counts, and compact row models. Query parameters are `period=current|all`, signed zero-free `year`, `q`, and valid per-type `sort`; unrelated parameters are preserved. Current-year mode reuses F8–F12 presentations, including Place importance and alive-unmapped Person eligibility. All-period mode includes every published runtime record. Empty queries use runtime records, non-empty queries reuse F14 matching and historical-name context, and an unavailable search artifact leaves unfiltered browsing usable.

`createEntityMapHref` is the single F15 map-link boundary used by pages and catalogs. It resolves the matching generated search entry, reuses the exported F14 relevant-year and point-focus functions, enables the required layer in F6 canonical order, writes a typed selection, and serializes an ordinary `/map` URL. Only validated Place/Event/Person points focus at the restrained F14 zoom; polity polygons, Journey routes, and unmapped records preserve the default viewport.

F15 tests remain pure Vitest/Node tests. They cover every entity type and route path, invalid/missing model resolution, specialization, full evidence, duplicate/unresolved references, deterministic explicit relations, immutability, catalog counts and eligibility, alive-unmapped People, historical Place-name search, entity-type constraint, safe search failure, valid sorts, query canonicalization/preservation, landing counts, and all five map-navigation contracts. Rendered direct refresh, history, responsive, keyboard, and link behavior remain owner external-browser checks.

### F16 content collection and coverage flow

F16 finalizes ContentCollection as canonical generated data rather than a React-only model. In addition to its period, recommended year/viewport, authored regional lists, grouped entity IDs, and provenance, each collection carries canonical recommended layers, an explicitly non-historical product focus bounding box, public/internal visibility, completeness, membership kind, and structured missing-content categories. Validation rejects duplicate membership, regions, layers, and missing categories; layer order is canonical, coverage and collection periods must match, and recommended years remain inside closed zero-free periods.

`alexanders-world` is the single public collection. It is a published `foundation-preview` shell for 360–300 BCE with a 334 BCE Eastern Mediterranean recommendation. Its 11 linked records are explicitly `synthetic-demonstration` members supported only as fixtures, never represented as genuine historical members. `synthetic-alpha-collection` remains published in the runtime solely as an internal compatibility fixture and is excluded by the visibility selector, not by an ID check. Reviewed historical membership and evidence remain F17 work.

`src/domain/collections` resolves public/detail records, explicit membership, deterministic type groups, inverse membership, active/mapped counts, inclusive period state, and conservative viewport state. The single broad focus bounds classify only whether the viewport center remains within the authored content-focus extent. They are not rendered, do not classify detailed versus partial subregions, and are never described as a historical border. Coverage output is pure presentation data with deterministic authored messaging and no JSX or MapLibre objects.

The nested router adds `/collections` and `/collections/:collectionId`. Activation from either page serializes one explicit `/map` URL containing year, viewport, canonical layers, and `collection`, while clearing unrelated entity selection. A valid Map collection opens a compact accessible details panel; an unresolved valid ID remains visible in the URL with an explicit Clear action. Reset reapplies the collection recommendation in one push update. Leave removes only `collection` and preserves year, viewport, layers, selection, hash, and unrelated query parameters.

Collection state remains context, not filtering. F13 Year Overview still derives global selected-year content and now adds linked demonstration counts, period state, and completeness. Entity pages derive inverse membership only from explicit linked IDs and label synthetic demonstration membership. Individual collection-member Map links reuse F15 navigation with the collection recommendation as their base, retaining the collection ID. Local expanded/collapsed panel state is the only new component state; no global store, backend, geospatial dependency, polygon, or browser-side canonical content was added.

Pure Vitest coverage exercises the public/internal boundary, schema rejection, explicit membership and inverse membership, grouped and active/mapped counts, inclusive period edges, product-focus classification, unresolved IDs, explicit recommended URLs, selection clearing, Leave preservation, global Year Overview behavior, and server-rendered valid/unresolved badge states. Direct refresh, responsive layout, actual Map panel coexistence, interaction, and keyboard behavior remain owner external-browser checks.

### F17 reviewed-content and classification boundary

F17 keeps the same canonical-to-generated architecture and changes the dataset policy from synthetic-only to mixed reviewed content plus explicit compatibility fixtures. `contentClassification` is required on sources, entity-core records, and territory periods; aliases are canonical authored arrays and are indexed without inference. Source references may carry categorical confidence. The application continues to consume only the immutable published generated runtime and never imports authoring files.

The public `alexanders-world` collection now has `reviewed` membership and `partial` completeness. Its ten linked records are the Granicus core; the internal synthetic collection preserves regression fixtures. Search entries carry classification so synthetic results can remain visibly synthetic, while entity pages expose the same distinction as record metadata rather than ID-name heuristics.

Geometry contracts remain GeoJSON Polygon/MultiPolygon and LineString/MultiLineString, but polygon validation now rejects self-intersecting rings. The reviewed journey is explicitly schematic and territory features are evidence-linked low-confidence contextual generalizations. No browser-side routing, interpolation, border generation, remote content fetch, or parallel content model was introduced.

---

## 8. Importance and Visibility

Place visibility is computed, not manually scattered across components.

Initial model:

```text
importanceAtYear = base importance for active period
                 + active-person bonuses
                 + optional capital/status bonus
```

Zoom thresholds should be deterministic and centralized. The exact formula belongs in `PRODUCT_RULES.md` once finalized.

---

## 9. Data Pipeline

1. Edit versioned canonical wrappers in `data/source/` and GeoJSON in `data/geometry/`.
2. Run `npm run data:validate` to parse strict F3 schemas and validate the complete graph.
3. Run `npm run data:build` to create byte-stable `data/generated/runtime.json`, `index.json`, `search-index.json`, and `manifest.json`.
4. Run `npm run data:check` to compare an in-memory rebuild with committed output without writing files.
5. Commit canonical and generated data together after review.

All wrappers carry schema version `1` and one matching dataset version. Entity IDs are unique across all top-level types. Public runtime output contains published records only; validation still covers every editorial state. Generation sorts set-like values and records while preserving temporal arrays and journey-stage sequence, emits no timestamp, and fingerprints runtime/index bytes with SHA-256. The browser-safe loader validates the aggregate runtime shape and deep-freezes it. Node filesystem and crypto imports remain confined to `scripts/data`.

Schema evolution requires an explicit coordinated data update or migration. The pipeline rejects version mismatches and unknown fields rather than silently coercing old files. The application must not depend on a live spreadsheet in production.

---

## 10. Validation Rules

The F4 validation pipeline checks:

- globally unique entity IDs;
- source, place, polity, person, event, battle, journey, collection, territory, and geometry references;
- valid coordinate ranges;
- `yearFrom <= yearTo`;
- required sources;
- non-empty names;
- valid GeoJSON geometry;
- no forbidden overlapping ownership/name/importance periods;
- polygon/multipolygon ring closure and minimum size;
- line/multiline minimum size;
- unique geometry feature IDs and bidirectional metadata/feature links;
- matching schema and dataset versions across every file.

Place name, ownership, importance, and polity-capital overlaps are rejected. Competing interpretations require a future explicit schema variant rather than ambiguous overlapping records.

---

## 11. Performance Direction

- filter and transform data outside React render paths;
- memoize selected-year datasets;
- use MapLibre layer filtering or precomputed active feature collections;
- avoid loading global high-resolution polygons in the first content slice;
- simplify geometries for web display;
- add clustering only when real data volume requires it.

Do not optimize for millions of records before the MVP dataset exists.

---

## 12. Future Migration Path

A backend may become useful for:

- collaborative editing;
- content moderation;
- full-text search across a large corpus;
- dynamic user collections;
- incremental data publishing;
- analytics or accounts.

Until one of these needs is real, static data remains the architectural default.

---

## 13. Key Risks

1. Historical data volume and quality, not map rendering.
2. Licensing and attribution for basemap and imported datasets.
3. False precision in ancient dates and territories.
4. Visual overload when too many layers are active.
5. Premature global scope.
6. Temporal logic duplicated across components.

---

## Guiding Rule

**Keep historical data structured, sourced, temporal, and independent from the presentation layer.**
