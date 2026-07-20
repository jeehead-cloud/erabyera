# EraByEra — Product Structure

**Status:** Approved product baseline  
**Last updated:** 2026-07-20
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`  
**Local repository path:** `C:\Projects\erabyera`

> This document defines the target product structure of EraByEra: product areas, screens, navigation, historical entities, user flows, data-trust behavior, and the boundary between foundation, next-stage, and later functionality.

---

## 1. Product Definition

**EraByEra is an interactive historical world atlas — “Google Maps through time.”**

The user selects a year and explores the world as it existed then:

- political entities and territories;
- cities and other places;
- historical people;
- events and battles;
- journeys and military campaigns;
- later: cultures, religions, dynasties, monuments, migrations, and trade routes.

The map and the selected time are the primary navigation model. EraByEra is not initially a general encyclopedia or a historical simulation. It is an interactive atlas with encyclopedia-like supporting pages.

---

## 2. Product Principles

1. The map remains the dominant visual element.
2. Time is a first-class product dimension.
3. A narrow, coherent, sourced historical slice is better than shallow global coverage.
4. Historical uncertainty must be shown explicitly.
5. Absence of data must not be presented as absence of history.
6. Sources are visible product content, not hidden implementation metadata.
7. Reusable domain rules must remain deterministic and explainable.
8. No AI-generated historical text or facts are published without human review.
9. Static, repository-managed data remains the default until a real backend need exists.
10. Future functionality must not be exposed as inactive clutter in the current UI.

---

## 3. Product Scope

### 3.1 Foundation Scope

Foundation establishes one complete historical exploration flow:

- physical map without modern political borders or labels;
- a selected historical year;
- URL-synchronized map state;
- timeline controls;
- places;
- polities and territories;
- people;
- events and battles;
- journeys and campaigns;
- compact detail cards;
- full entity pages;
- local search;
- Explore catalogs;
- sources;
- data coverage communication;
- the first content collection, `Alexander’s World`;
- the first vertical content slice centered on the crossing into Asia and the Battle of the Granicus in 334 BCE.

### 3.2 Next Product Level

- collection catalog;
- guided historical stories;
- general timeline screen;
- richer entity pages;
- local bookmarks and recently viewed items;
- comparison of two years;
- playback;
- deeper mobile optimization;
- additional content collections and eras.

### 3.3 Later Product Level

- cultures and peoples;
- religions;
- dynasties;
- monuments;
- migrations;
- trade routes;
- detailed local maps;
- alternative historical reconstructions;
- relationship graphs;
- collaborative editing;
- accounts and synchronized collections;
- internal historical-data editor;
- offline packages and PWA.

---

## 4. First Historical Content Scope

### 4.1 Collection

```text
Alexander’s World
360–300 BCE
Recommended start year: 334 BCE
```

### 4.2 Primary Detailed Geography

- Macedonia;
- Greece and the Aegean;
- western and central Anatolia;
- the Levant;
- Egypt;
- Mesopotamia;
- Persia.

### 4.3 Lower-Detail Route Geography

- Central Asia;
- the Indus Valley;
- other territories connected to Alexander’s campaign.

### 4.4 First Vertical Slice

```text
334 BCE — Crossing into Asia and the Battle of the Granicus
├── Kingdom of Macedon
├── Achaemenid Empire
├── Alexander III
├── Darius III
├── key places in Macedonia and western Anatolia
├── Battle of the Granicus
├── initial campaign route
└── reviewed sources
```

The technical slice begins with only a few interconnected entities, then grows into a usable collection.

---

## 5. Primary Navigation

Target top-level navigation:

```text
Map
Explore
Collections
Sources
About
```

Foundation navigation:

```text
Map
Explore
Sources
```

`Explore` contains:

```text
Places
Polities
People
Events
Journeys
```

Future categories appear only when functional.

---

## 6. Routes

```text
/
 /map
 /explore
 /explore/places
 /explore/polities
 /explore/people
 /explore/events
 /explore/journeys
 /sources
 /collections
 /collections/:collectionId
 /place/:placeId
 /polity/:polityId
 /person/:personId
 /event/:eventId
 /journey/:journeyId
 /source/:sourceId
```

The root route redirects to `/map`.

---

## 7. Main Map Screen

### 7.1 Layout

```text
Top navigation and search
├── logo
├── global search
├── selected year
├── layer controls
├── Explore navigation
└── Share

Main area
├── full map
└── collapsible right contextual panel

Bottom area
└── timeline controls
```

The map remains visually dominant. On mobile, the right panel becomes a bottom sheet and secondary controls open as overlays.

### 7.2 First-Open State

- year: 334 BCE;
- viewport: Eastern Mediterranean;
- no collection is activated silently; Alexander’s World is available through Collections and its recommended Map action;
- core historical layers enabled;
- a short data-coverage explanation available without blocking exploration.

Later visits restore URL state or the last local state when no explicit URL state is present.

---

## 8. Timeline

### 8.1 Foundation Controls

- selected year;
- direct year input;
- previous and next controls;
- configurable step: 1, 5, 10, 25, 50, or 100 years;
- slider;
- BCE/CE formatting without a displayed year zero.

### 8.2 Target Extensions

- range selection;
- event markers;
- data-coverage segments;
- playback;
- day and month precision;
- era presets.

The map should update continuously while moving the slider when performance allows. The implementation must support deferred updates if the dataset becomes too heavy.

---

## 9. URL State and Sharing

The map URL should restore:

- selected year;
- center latitude and longitude;
- zoom;
- active primary layers;
- selected entity;
- active collection;
- later: comparison or playback state.

Example:

```text
/map?year=-334&lat=39.1&lng=27.3&zoom=6.2&layers=places,territories,events&entity=battle-granicus
```

The Share action copies the current reproducible URL. URL updates should be debounced or committed after interaction so dragging the map does not create excessive history entries.

---

## 10. Historical Layers

### 10.1 Foundation Layers

- political territories;
- places;
- people;
- events and battles;
- journeys and campaigns.

Physical geography is the basemap rather than a normal historical layer.

### 10.2 Target Grouping

```text
Politics
├── Territories
├── Capitals
└── Borders

Places
├── Cities
├── Settlements
└── Monuments

Events
├── Battles
├── Political events
├── Disasters
└── Cultural events

Movement
├── Journeys
├── Campaigns
├── Migrations
└── Trade routes
```

### 10.3 Visibility

A layer is enabled by the user, while object visibility is also determined by:

- selected year;
- map zoom;
- editorial importance;
- selected collection;
- relation to the selected object.

Selected and searched entities remain visible regardless of normal thresholds.

---

## 11. Political Territories

Territories use:

- translucent fill;
- explicit boundary line;
- polity color;
- stronger hover state;
- selected highlight above neighboring layers;
- separate styling for approximate, disputed, claimed, dependent, or influence-based control.

A missing territory geometry must not hide the polity from search, catalogs, related cards, or the year overview.

Territory changes switch immediately when manually changing the year. Interpolation is reserved for playback and must not imply unsupported precision.

---

## 12. Places, Events, People, and Routes

### Places

- rendered as MapLibre symbol/circle layers;
- name and importance may change by period;
- smaller places appear at closer zoom;
- historical names are searchable.

### Events and Battles

- exact location: normal marker;
- approximate location: uncertainty marker or area;
- regional event: polygon or regional representation;
- unknown location: catalog and timeline only.

A battle is an event subtype with specialized fields.

### People

People appear through active person-place periods, not permanently at their birthplace. Multiple people at one place are aggregated.

### Journeys and Campaigns

Routes use directional lines when direction is known. Styling distinguishes documented, probable, schematic, and uncertain routes.

---

## 13. Selection and Context Panel

### 13.1 Default Year Overview

When no entity is selected, the panel shows:

- selected year;
- 3–5 key events;
- active major polities;
- important places;
- active campaign or journey;
- collection and data-coverage summary.

Key objects are selected using deterministic editorial importance, not opaque AI ranking.

### 13.2 Entity Card Shell

Common fields:

- entity type;
- period-appropriate name;
- temporal range;
- image or symbol when available;
- summary;
- uncertainty or dispute badge;
- important relations;
- 1–2 primary sources and source count;
- `View full page`.

### 13.3 Entity Outside the Selected Period

The card explains that the entity is not active in the selected year and offers:

- go to first known year;
- go to nearest active period;
- view full history.

The year is not changed automatically without user action.

---

## 14. Entity Types

### 14.1 Place

Target information:

- period-appropriate name;
- aliases and historical names;
- place type;
- existence;
- ownership;
- status, such as capital, port, fortress, or settlement;
- coordinate accuracy;
- summary;
- related people and events;
- source references;
- chronology of names, ownership, status, importance, and location changes.

### 14.2 Polity

Target information:

- period-appropriate name;
- polity type;
- existence;
- capitals by period;
- rulers by period;
- territory for selected year;
- predecessors and successors;
- related people and events;
- uncertainty notes;
- sources.

### 14.3 Person

Target information:

- name;
- life range and date precision;
- role;
- summary;
- active location or relation in the selected year;
- polity associations;
- journeys;
- events;
- places;
- life chronology;
- sources.

### 14.4 Historical Event

Target information:

- name;
- event type;
- date or period;
- location and geographic precision;
- participants;
- related polities and people;
- sourced causes and consequences;
- related events;
- sources.

### 14.5 Battle Extension

- sides;
- commanders;
- approximate forces;
- result;
- losses when known;
- related campaign or war;
- disputed interpretations;
- sources.

Foundation requires sides, commanders, result, related campaign, and sources.

### 14.6 Journey or Campaign

- name;
- type;
- period;
- participants;
- start and end;
- ordered key places;
- route geometry;
- direction;
- summary;
- related events;
- uncertainty status;
- sources.

### 14.7 Source

- title;
- author or organization;
- source type;
- publication year;
- publisher;
- URL where applicable;
- license;
- bibliographic record;
- notes.

A source reference may also include a page, section, locator, editorial note, excerpt, and review date.

### 14.8 Content Collection

- name;
- description;
- time range;
- geographic coverage;
- recommended start year;
- recommended viewport;
- linked entities;
- coverage status;
- dataset version;
- editorial notes;
- collection-level sources.

---

## 15. Search

Global search covers all implemented entity types.

Each result shows:

- name;
- type;
- period;
- short context;
- geographic context when available.

Search includes:

- default names;
- period-specific names;
- aliases;
- transliterations;
- localized variants later.

Selecting a result:

1. chooses a relevant year;
2. moves to the object;
3. enables the necessary layer;
4. selects the object;
5. opens its card.

If the query uses a historical name, the relevant historical period takes priority.

---

## 16. Explore Catalogs

Foundation catalogs:

- Places;
- Polities;
- People;
- Events;
- Journeys;
- Sources.

Common functions:

- search;
- current-year filter;
- all-periods filter;
- custom period later;
- type and region filters;
- sorting;
- result count;
- compact list first;
- card view later;
- `View on map`.

Catalogs reuse the same domain selectors and search index as the map.

---

## 17. Full Entity Pages

Universal structure:

```text
Header
├── name
├── type
├── period
└── uncertainty status

Summary
Map preview
Timeline
Key facts
Specialized sections
Related entities
Sources
Data notes and disputed interpretations
View on map
```

Every entity page has a stable route. `View on map` opens a relevant year and location and selects the entity.

---

## 18. Historical Time Model

- CE years are positive.
- BCE years are negative.
- The UI never displays year zero.
- Temporal ranges are inclusive unless explicitly stated otherwise.
- Approximate, decade, century, range, before, after, and unknown dates retain their precision.
- Foundation filtering operates by year.
- Day and month precision is supported by the target model but not required for foundation.

All temporal behavior must use centralized domain utilities.

---

## 19. Uncertainty

### Date Precision

- exact;
- year;
- approximate;
- decade;
- century;
- range;
- before;
- after;
- unknown.

### Location Accuracy

- exact;
- approximate;
- settlement area;
- regional;
- disputed;
- unknown.

### Confidence

Use categories rather than pseudo-precise percentages:

- high;
- medium;
- low;
- disputed;
- unknown.

### Territory Control

Possible categories:

- core territory;
- direct control;
- claimed;
- tributary or dependent;
- sphere of influence;
- disputed;
- approximate extent.

---

## 20. Editorial Status

Supported statuses:

```text
Draft
Reviewed
Published
Deprecated
```

Rules:

- ordinary users see Published content;
- Draft may be visible only in development mode;
- Published records require sources;
- target architecture allows status at entity and temporal-record level;
- foundation may begin with entity-level and geometry-level status.

---

## 21. Data Coverage

The product must explain that the historical database is incomplete.

Coverage UI may include:

- active collection;
- time range;
- detailed geography;
- partial geography;
- number of published entities;
- warnings when moving outside detailed coverage;
- reminder that no displayed data does not mean no historical activity.

The physical map remains visible outside the current content focus.

---

## 22. Content Creation Workflow

Initial workflow:

```text
edit repository source data
→ validate
→ generate runtime data
→ inspect in development mode
→ review
→ commit
→ publish
```

Preferred source formats:

- JSON for nested entities;
- CSV or Sheets export for bulk simple data;
- GeoJSON for geometry;
- Markdown later for long-form editorial text.

Foundation may start JSON-first.

---

## 23. User Preferences

Foundation preferences:

- layer state;
- density: Less / Standard / More;
- basic map style;
- stored locally where appropriate.

Later preferences:

- fill intensity;
- marker sizes;
- label density;
- date display;
- relief;
- theme;
- accessibility enhancements.

---

## 24. Responsive and Accessible Behavior

### Mobile

- map fills the screen;
- top navigation is simplified;
- search opens as an overlay;
- timeline becomes compact;
- detail panel becomes a bottom sheet;
- catalogs use dedicated screens;
- layers open over the map.

Foundation is desktop-first but must remain usable on mobile.

### Accessibility

- keyboard focus;
- accessible controls;
- adequate contrast;
- no meaning conveyed by color alone;
- list alternatives for important map content;
- no hover-only behavior;
- keyboard-accessible panels and dialogs.

---

## 25. Explicitly Deferred from Foundation

- backend and accounts;
- cloud bookmarks;
- internal content admin;
- collaborative editing;
- automated Wikidata import;
- automatic publication of AI-generated content;
- year comparison;
- playback;
- guided stories;
- local detail maps;
- cultures, religions, dynasties, monuments;
- migrations and trade networks;
- relationship graph;
- full mobile optimization;
- PWA and offline-first;
- analytics;
- multiple simultaneous reconstructions;
- day/month navigation.

---

## 26. Product Flows

```text
Open app
→ Map at 334 BCE
→ change year
→ active layers update
→ select object
→ compact card
→ full entity page
→ View on map
```

```text
Open search
→ search historical or modern name
→ choose result
→ map moves to relevant year and location
→ required layer enabled
→ entity selected
```

```text
Explore
→ choose catalog
→ filter by current year or all periods
→ open entity
→ View on map
```

```text
Open Alexander’s World collection
→ map moves to recommended viewport and year
→ relevant layers enabled
→ collection coverage shown
```

---

## 27. Documentation Responsibilities

- `PROJECT.md` — vision, scope, and high-level roadmap.
- `PRODUCT_STRUCTURE.md` — screens, flows, entities, and target product.
- `FOUNDATION_IMPLEMENTATION_PLAN.md` — implementation sequence for foundation.
- `PRODUCT_RULES.md` — product and historical-data invariants.
- `ARCHITECTURE.md` — technical structure and stack.
- `CURRENT_STATUS.md` — factual current repository state.
- `AI_AGENTS.md` — coding-agent workflow.
- `DEPLOYMENT.md` — local running, build, and deployment.

---

## Guiding Principle

**Make historical change understandable through a map and a year, while keeping sources, uncertainty, and incomplete coverage visible and honest.**
