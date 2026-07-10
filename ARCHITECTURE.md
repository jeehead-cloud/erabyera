# EraByEra вЂ” Architecture

**Status:** Proposed baseline for initial implementation
**Last updated:** 2026-07-10
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

## 2. Proposed Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Shared types across UI, selectors, validation, and scripts |
| Build tool | Vite | Simple client-side project and fast local iteration |
| UI | React | Panels, timeline, search, cards, filters |
| Map | MapLibre GL JS + `react-map-gl/maplibre` | Vector/raster layers, GeoJSON, smooth zoom, efficient rendering, no mandatory proprietary API |
| State | Zustand | Small global UI state without Redux overhead |
| Validation | Zod | Runtime validation of JSON/GeoJSON data |
| Testing | Vitest | Date selectors, validation, URL parsing, transformation logic |
| Styling | CSS Modules or plain structured CSS | Avoid adopting a heavy design system prematurely |
| Data | JSON + GeoJSON in repository | Versioned, reviewable, no backend for MVP |
| Package manager | npm | Standard and simple |
| Backend | None for MVP | Static client application |

### Why not a single image overlay with Leaflet

A static image overlay is acceptable for a prototype, but it becomes restrictive for historical territory polygons, feature queries, vector styling, clustering, and large datasets. MapLibre provides a better long-term map foundation while remaining usable in a static frontend.

---

## 3. Proposed Repository Structure

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

The actual repository is the source of truth once implementation begins.

---

## 4. Core Domain Model

### Shared temporal range

```ts
interface TemporalRange {
  yearFrom: number
  yearTo: number | null
  datePrecision?: 'exact' | 'year' | 'decade' | 'century' | 'approximate' | 'unknown'
}
```

Negative years represent BCE. There is no year zero in conventional BCE/CE display, but internal numeric handling must be defined consistently in `time.ts`.

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

All temporal filtering must go through shared utilities.

```ts
isActiveAtYear(range, year)
intersectsYearRange(range, from, to)
formatHistoricalYear(year)
```

Default rule:

```text
yearFrom <= selectedYear <= yearTo
```

`yearTo: null` means unknown or continuing only when the relevant schema explicitly allows it. It must not automatically mean the present day for all entities.

Overlapping time-dependent records for the same field should be rejected by validation unless the schema explicitly permits competing interpretations.

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

The basemap must avoid modern borders and labels. Initial options:

1. a custom MapLibre style using only physical layers;
2. self-hosted or properly licensed physical raster/vector tiles;
3. Natural Earth-derived static vector layers.

The final choice must be recorded with license and attribution requirements before public deployment.

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

At minimum:

```text
?year=-323&lat=32.5&lng=30.2&zoom=4.7&layers=places,territories,battles
```

URL parsing and serialization belong in one module and require tests.

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

1. Edit source data in reviewed CSV/Google Sheets or JSON.
2. Export into repository source files.
3. Run `npm run data:validate`.
4. Transform source data into optimized runtime JSON/GeoJSON if needed.
5. Commit both schema changes and data changes together.

The application must not depend on a live Google Sheet in production.

---

## 10. Validation Rules

The validation script should eventually check:

- unique IDs;
- valid referenced IDs;
- valid coordinate ranges;
- `yearFrom <= yearTo`;
- required sources;
- non-empty names;
- valid GeoJSON geometry;
- no forbidden overlapping ownership/name/importance periods;
- territory features reference existing polities;
- journey metadata matches GeoJSON features;
- source records contain required attribution fields.

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
