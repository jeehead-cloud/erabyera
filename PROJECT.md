# EraByEra вЂ” Project Overview

**Status:** Planning / pre-development hobby project
**Last updated:** 2026-07-10
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`
**Local repository path:** `C:\Projects\erabyera`
**Expected main branch:** `main`

> This is the primary entry point for understanding EraByEra.
> It explains the product vision, scope, roadmap, and how the project documents fit together.

---

## 1. Vision

**EraByEra is an interactive historical world map вЂ” вЂњGoogle Maps through time.вЂќ**

A user selects a year or period on a timeline and explores the world as it existed then: political entities, cities, historical figures, battles, journeys, trade routes, and other events.

The product should make history easier to understand spatially and chronologically. Its main value is not only showing borders, but helping the user see which people, places, states, and events existed at the same time and how they were connected.

---

## 2. Project Context

- Personal hobby project.
- Developed primarily by the owner with Cursor and other AI coding agents.
- No commercial requirements, accounts, subscriptions, or multiplayer are planned for the MVP.
- The first goal is a small but complete historical-map experience, not a comprehensive global historical database.
- Scope must remain realistic for one person to maintain.

---

## 3. Core Product Experience

1. Open a physical map without modern political borders or labels.
2. Select a year using the timeline.
3. See entities relevant to that year:
   - polities and territories;
   - cities;
   - people;
   - battles and events;
   - journeys and campaigns;
   - later: trade routes.
4. Zoom and pan the map.
5. Click an entity to open a detail card with dates, description, and sources.
6. Enable or disable categories through map-layer filters.
7. Search for a city, person, polity, or event and jump to the relevant time and location.

---

## 4. Product Principles

1. **Historical exploration before database completeness.** A polished small region or era is more valuable than a shallow world map covering all history.
2. **Sources are part of the product.** Historical facts must be traceable to a source.
3. **Uncertainty must be represented honestly.** Approximate dates and disputed geography must not be shown as exact facts.
4. **Time is a first-class dimension.** Ownership, names, importance, routes, and visibility may change over time.
5. **The map must stay readable.** Layer filters, zoom thresholds, clustering, and importance rules should prevent visual overload.
6. **No unnecessary infrastructure.** Start with static data and client-side rendering; add a backend only when a proven need appears.

---

## 5. MVP Scope

The MVP should prove the core interaction with one deliberately limited historical dataset.

Recommended first content scope:

- one region and one bounded period, for example the Mediterranean from 500 BCE to 100 CE;
- 3вЂ“8 polities;
- 20вЂ“50 places;
- 10вЂ“30 people;
- 10вЂ“20 battles/events;
- 3вЂ“10 journeys or campaigns.

### MVP features

- physical basemap without modern political labels;
- pan and zoom;
- year selector / timeline;
- polity territory layer;
- city markers with zoom-dependent visibility;
- people associated with places and periods;
- battle/event markers;
- journey/campaign paths;
- detail panel;
- source links;
- layer filters;
- permalink containing year, center, and zoom;
- static repository-managed data.

### Explicitly out of MVP

- user accounts;
- editing historical data in the application;
- collaborative moderation;
- automatic ingestion from Wikipedia or Wikidata;
- AI-generated historical facts;
- full global coverage;
- 3D globe;
- native mobile applications;
- offline-first support;
- personalized bookmarks synchronized across devices.

---

## 6. Main Product Areas

### 6.1. Map and navigation

A neutral physical basemap forms the visual foundation. The map supports pan, zoom, fitting entities, URL state, and adaptive visibility.

### 6.2. Timeline

The selected year controls every time-dependent layer. The initial implementation may use a year slider plus direct year input. Playback and era presets are later improvements.

### 6.3. Historical entities

Core entities:

- Place
- Polity
- TerritoryPeriod
- PlaceNamePeriod
- PlaceOwnershipPeriod
- Person
- PersonPlacePeriod
- Event
- Battle
- Journey
- Source

### 6.4. Historical data pipeline

Data starts as reviewed JSON or CSV committed to the repository. Google Sheets may be used as an authoring tool, but the application reads versioned generated files, not the live spreadsheet.

### 6.5. Trust and uncertainty

Every displayed record should support sources and optional confidence / date-precision metadata.

---

## 7. Roadmap

| # | Milestone | Scope | Status |
|---|---|---|---|
| M0 | Project foundation | Repository, Vite app, documents, lint/build baseline | Planned |
| M1 | Map shell | Physical basemap, pan/zoom, responsive layout | Planned |
| M2 | Timeline and temporal filtering | Selected year, URL state, date utilities | Planned |
| M3 | Places and detail cards | Cities, importance, zoom visibility, sources | Planned |
| M4 | Polities and territories | Historical ownership and territory polygons | Planned |
| M5 | Events, battles, and journeys | Markers, paths, filters, cards | Planned |
| M6 | Search and navigation | Search entities, jump to time/location, permalinks | Planned |
| M7 | Data-quality tooling | Validation scripts, schema checks, source coverage | Planned |
| M8 | Content expansion and polish | More eras/regions, playback, localization, mobile polish | Planned |

---

## 8. Success Criteria for the First Usable Version

The first version is successful when the owner can:

- open the app locally;
- move through a defined historical period;
- understand how political control and important places change;
- open trustworthy detail cards;
- share a URL that restores the selected year and map position;
- add or correct content by editing structured data without changing application code.

---

## 9. High-Level Technical Direction

- TypeScript
- React
- Vite
- MapLibre GL JS with React integration
- Zustand for small client-side UI state
- Zod for data validation
- static GeoJSON / JSON data committed to the repository
- no backend or database for the MVP
- static hosting when deployment begins

See `ARCHITECTURE.md` for rationale and details.

---

## 10. Documentation System

- `PROJECT.md` вЂ” vision, scope, milestones, product direction.
- `AI_AGENTS.md` вЂ” mandatory working rules for Cursor and other agents.
- `CURRENT_STATUS.md` вЂ” current implementation snapshot and nearest work.
- `PRODUCT_RULES.md` вЂ” behavior and historical-data invariants.
- `ARCHITECTURE.md` вЂ” stack, modules, data model, and technical decisions.
- `DEPLOYMENT.md` вЂ” local running, build, and future hosting.

## 11. Recommended Reading Order

1. `PROJECT.md`
2. `AI_AGENTS.md`
3. `CURRENT_STATUS.md`
4. `PRODUCT_RULES.md`
5. `ARCHITECTURE.md`
6. `DEPLOYMENT.md`

## 12. Source-of-Truth Hierarchy

When information conflicts, use this order:

1. current repository code and validated data;
2. `PRODUCT_RULES.md`;
3. `ARCHITECTURE.md`;
4. `CURRENT_STATUS.md`;
5. `PROJECT.md`;
6. chat history.

---

## Guiding Rule

**Build one historically coherent, enjoyable slice before attempting the whole world and all of history.**
