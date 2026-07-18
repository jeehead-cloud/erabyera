# EraByEra вЂ” Product and Historical Data Rules

**Status:** Active baseline
**Last updated:** 2026-07-19
**Repository:** `https://github.com/jeehead-cloud/erabyera.git`

> This document defines product behavior and historical-data invariants.
> These rules must remain consistent unless the owner explicitly changes them.

---

## 1. General Principles

1. Prefer clarity over visual density.
2. Prefer sourced data over broad coverage.
3. Prefer explicit uncertainty over false precision.
4. Keep rules deterministic and explainable.
5. Do not silently infer missing historical facts.
6. A polished narrow slice is better than incomplete global coverage.

---

## 2. Time Rules

### 2.1. Internal years

- CE years are positive integers.
- BCE years are negative integers.
- The display layer must not show a year zero.
- A shared utility controls conversion and formatting.

### 2.2. Range boundaries

Unless a specific entity says otherwise, date ranges are inclusive:

```text
yearFrom <= selectedYear <= yearTo
```

### 2.3. Uncertain dates

Use precision metadata such as:

- exact;
- year;
- decade;
- century;
- approximate;
- unknown.

Do not convert вЂњcirca 500 BCEвЂќ into an apparently exact date without retaining the uncertainty.

### 2.4. Unknown end date

`null` must mean вЂњunknown / not suppliedвЂќ unless a schema explicitly defines it as ongoing. It must not silently become the current year.

---

## 3. Source Rules

- Every production historical entity requires at least one source reference.
- Sources must identify the work or dataset and, where possible, a specific locator.
- Never fabricate citations.
- Wikipedia may be used as an initial navigation source, but important or disputed facts should eventually reference stronger sources.
- Imported datasets must have documented licenses and attribution requirements.
- Unsourced records may exist only as explicitly marked drafts and should not appear in the public production dataset by default.

---

## 4. Uncertainty and Disagreement

- Historical territory boundaries are approximations, especially for ancient periods.
- The UI should be able to label approximate or disputed geometry.
- Competing interpretations may coexist as separate records or variants.
- Do not present a disputed border, date, capital, ethnicity, title, or causal claim as universally settled.
- вЂњUnknownвЂќ and вЂњnot applicableвЂќ are different states and should not be collapsed.

---

## 5. Basemap Rules

- No modern political borders in the default physical basemap.
- No modern city labels in the default basemap.
- Physical geography may include coastlines, terrain, rivers, lakes, and relief.
- Historical overlays must be visually distinct from the basemap.
- Required map attribution must remain visible.

---

## 6. Polity and Territory Rules

- A polity has an existence period independent from any single territory feature.
- Territory may change across multiple periods.
- A polity may have no confidently known territory geometry for some periods.
- Absence of territory geometry must not automatically hide the polity from search or related entity cards.
- Territory polygons are interpretive approximations, not cadastral truth.
- Overlapping territorial claims may be represented when historically justified.
- Modern successor-state borders must not be used as substitutes for historical control without explicit justification.
- Normal territory features require an active TerritoryPeriod and resolved generated geometry for the selected year.
- Disabling `territories` hides normal polygons and boundaries; an explicitly selected polity may retain only its active mapped geometry as a visible selection override.
- An active or inactive selected polity remains inspectable without geometry, and inactive geometry must not be displayed as current.
- Overlapping active claims remain separate features. Rendered feature order selects the practical click target; overlap cycling is deferred.
- Territory control and uncertainty must use non-color-only presentation as well as explicit card text.
- Compact polity evidence prioritizes active territory, capital, and ruler references before entity-level references; inactive period evidence is excluded.

---

## 7. Place Rules

- A place has stable identity even when its name, owner, importance, or status changes.
- Names are time-dependent.
- Ownership is time-dependent.
- Importance is time-dependent.
- A place may exist before or after it is politically important.
- A place may have uncertain coordinates or represent an archaeological area rather than a precise point; the data model must retain that distinction.
- The displayed name should match the selected year when a period-specific name exists; otherwise use the default name.
- Place activity, displayed name, owner, and importance use the same selected year and centralized inclusive F2 semantics.
- Compact place evidence prioritizes active name, ownership, and importance references, then entity-level references; identical references are deduplicated while locator distinctions remain.
- Sources from inactive unrelated periods must not be presented as evidence for the selected-year state.

---

## 8. Person Rules

- A person may be associated with multiple places over different periods.
- Birthplace is not automatically the place where the person should appear for every year of their life.
- Person visibility should depend on an active person-place period or another explicitly defined map relationship.
- A person may contribute to a place's importance only during the relevant active period.
- Biographical summaries must not be AI-generated and stored as verified facts without review and sources.
- Life activity and map-location activity are separate; being alive does not imply a reviewed active location.
- A person is mapped only through an active resolved PersonPlacePeriod, using the Place coordinate without geographic offset.
- Primary relationship priority is campaign, rule, activity, residence, visit, birth, death, unknown; additional active relationships remain visible in the card.
- Birth and death relationships are bounded and never become permanent marker locations.
- Visible people aggregate by resolved Place ID after zoom filtering; aggregate selection uses an explicit chooser and ordinary person URLs.
- Selected active mapped people override zoom and the `people` layer toggle; selected unmapped or outside-life people receive no former or invented marker.
- Person evidence prioritizes active relationship references then person-level references and excludes related entities' general sources.

---

## 9. Events and Battles

- Events may be points, areas, or records without a precise mappable location.
- A battle is an event subtype for the MVP.
- A battle's participants may include polities and people.
- Long events use a period; single-year events may use the same start and end year.
- Events with unknown or disputed locations must be marked accordingly rather than assigned a plausible coordinate.
- Normal mapped events require an active period, reviewed coordinates, and the enabled `events` layer.
- An explicitly selected mapped event remains visible when inactive or when `events` is disabled, using visibly inactive/selected styling without changing the year.
- An unknown-location event remains URL-selectable and inspectable but never receives a marker, inferred coordinate, or automatic viewport change.
- Approximate, regional, disputed, and otherwise uncertain representative points must use non-color-only uncertainty styling and explicit card language.
- Event evidence uses references attached directly to the event/battle record; general participant sources are not event evidence.
- Battles extend the common event contract with structured sides and required result rather than forming a parallel entity architecture.

---

## 10. Journeys and Routes

- Journeys and campaigns are finite historical movements tied to a period.
- Trade routes are persistent networks and should remain a separate category when implemented.
- Route geometry is an approximation unless based on a documented reconstruction.
- A rendered line must not imply exact day-by-day movement unless the data supports it.
- Route direction should be visually represented only when known.
- Journey activity comes from the Journey period; route-geometry availability is a separate state and must not hide an active or selected Journey record.
- Normal routes require an active published Journey, enabled `journeys` layer, and resolved generated geometry.
- A selected mapped Journey may remain visible when inactive or when `journeys` is disabled, but inactive styling must prevent it from appearing current. A selected unmapped Journey keeps its card and receives no invented path.
- Coordinate order alone does not establish direction. Directional copy or treatment requires the canonical `directionKnown` flag; F12 does not add inferred arrows.
- Documented/probable and schematic/uncertain routes must differ through opacity, width, dash, casing, or explicit text as well as color.
- Journey evidence prioritizes Journey-level references, then stage references in authored order. Exact duplicates are removed, locator-distinct references remain, and participants' general sources are not Journey evidence.

---

## 11. Visibility and Importance

The map must avoid showing every object at every zoom level.

Initial rules:

- place importance 5, 4, 3, 2, and 1 becomes visible from zoom 1.5, 2.5, 3.5, 4.5, and 5.5 respectively;
- a place without active importance is not normally visible;
- active important people may increase a place's score;
- an explicitly selected place remains visible regardless of activity, zoom threshold, or the `places` layer toggle;
- hidden by zoom does not mean historically inactive;
- layer toggles control categories independently.
- historical render order is territory, journey, event, people, then place; click priority is place, person, event, journey, then territory;

The exact thresholds must be centralized and testable, not scattered across components.

---

## 12. Selected-Year Overview

- The overview appears only when no entity selection is active; valid and unresolved typed selections retain their established detail or unresolved state.
- Overview eligibility is derived from the selected year and generated runtime presentations, not from currently rendered map features.
- Events, polities, and Journeys must be active; Places must be active with active importance; listed People must be alive with an active mapped relationship.
- Active-but-unmapped entities remain eligible where the entity contract permits them, and mapped/unmapped state must be stated in text.
- Disabled map layers do not remove historically eligible overview items. Selecting an item preserves layer filters and relies on existing selected-feature overrides.
- Rankings use centralized comparator chains: explicit importance where available, documented display/context signals, display name, then stable ID. AI, randomness, polygon area, route length, and opaque combined scores are forbidden.
- Overview selection uses existing typed entity references and push history while preserving year, viewport, layers, collection, and unrelated URL parameters.
- F13 selection does not automatically move the map, enable a layer, activate a collection, or change the selected year.
- Coverage messaging must distinguish active content, no active published records, active-but-unmapped records, disabled layers, sparse data, and collection-year mismatch without implying an absence of historical activity.
- The foundation synthetic-fixture warning remains visible in the overview.

---

## 13. Timeline Interaction

- Changing the selected year updates every active historical layer consistently.
- The year shown in the UI and URL is the year used by selectors.
- Direct year input and slider movement must share the same validation.
- Direct entry uses a positive magnitude plus an explicit BCE or CE era; invalid drafts never replace the selected URL year.
- Previous, next, and step navigation must use the zero-free historical-time domain so 1 BCE and 1 CE are adjacent.
- Foundation step sizes are exactly 1, 5, 10, 25, 50, and 100 years; the preference is local and is not part of the public URL.
- The foundation slider covers 1000 BCE through 1000 CE with zero-free ordinal mapping. Valid direct years outside that range remain selected while the slider rests at its nearest endpoint.
- Timeline interaction replaces the current URL entry to avoid creating a history item for every year or slider movement.
- Timeline playback is deferred until manual navigation is stable.
- Large jumps in time must not animate through every intermediate year unless playback is explicitly active.

---

## 14. Search and Permalinks

- Search may return entities outside the currently selected year.
- Search indexes only authored default names, historical names, aliases, and transliterations; it must never invent alternate spellings or transliterate automatically.
- Normalization is Unicode NFKC, locale-neutral lowercase, punctuation-to-space, whitespace collapse, and trim. Non-Latin text and digits remain meaningful.
- Matching order is exact primary name, exact authored variant, primary prefix, variant prefix, token prefix, then substring. Current-year activity is only a same-category tie-break; stable type, matched name, and entity ID complete the comparator.
- Search has no AI, semantic embedding, randomness, opaque importance score, geometry-area score, route-length score, or remote service.
- A historical-name match uses that authored name period before the entity's general period. Other relevant years reuse F2 activity and nearest-range rules; Person results prefer a reviewed mapped relationship before falling back to life years.
- Choosing a search result adds only its required layer in canonical order, preserves other layers and unrelated URL state, sets the typed entity, and commits one push-history update.
- Deterministic Place, Event, and Person points may focus at a minimum zoom of 5.5 while preserving a closer valid zoom. Polity and Journey fitting is deferred.
- A target-year-unmapped or unknown-location result remains searchable and selectable, enables its layer, opens its card, and never receives a fabricated coordinate or viewport movement.
- The URL is the reproducible source of selected year, map center, zoom, active layers, selected entity, and active collection.
- Map dragging and zooming replace the current history entry only when interaction ends; explicit committed navigation may push a new entry so Back and Forward remain meaningful.
- Unknown query parameters are preserved when map state is canonicalized or updated.
- Shared URLs restore typed state without implying that an entity or collection has been loaded or verified to exist.

---

## 15. Entity Pages and Explore Catalogs

- Every published Place, Polity, Person, Event/Battle, and Journey/Campaign has one stable explicit entity-page route backed by the immutable generated runtime.
- Relation-name links open stable entity pages. Moving to the Map requires an explicit `View on map` action; relations do not silently change year or geography.
- Full pages show every relevant entity-specific resolved reference. Exact duplicates are removed, locator-distinct references remain, and related entities' general sources are never promoted into another entity's claims.
- Relations come only from authored references and their deterministic inverse lookup. Geographic proximity, polygon overlap, and coordinate coincidence do not create relationships.
- Current-year catalogs use the same activity semantics as their map/domain presentations. Places require active existence and importance; People require life activity but not a mapped relationship; polities, events, and Journeys use their active periods.
- All-period catalogs include every published record of the requested type, including unmapped records.
- Catalog identity belongs to the route; period mode, selected catalog year, search query, and valid type-specific sort belong to reproducible query parameters. Year zero and unsupported sorts canonicalize safely.
- Catalog search reuses the generated F14 index and ranking, remains constrained to one entity type, and retains historical Place-name match context. Search failure must not disable unfiltered catalog browsing.
- `View on map` reuses F14 relevant-year logic, enables the required F6 layer, and selects the typed entity. Only validated point entities receive focus; polygons, routes, and unknown locations never receive fabricated focus.
- A missing geometry state keeps the page and catalog row useful and must not be described as proof that the entity never existed.

---

## 16. Content Editing Rules

- Runtime app code must not contain canonical historical content.
- Data changes should be reviewable separately from UI changes.
- IDs are stable and must not be changed merely to improve display names.
- Top-level entity IDs are globally unique across entity types so untyped selections and reference indexes remain unambiguous.
- Deleting a referenced entity requires validation and explicit cleanup.
- Schema migrations for repository data must include a transformation plan or a coordinated data update.

---

## 17. Localization

Localization is not required for the first MVP, but the architecture should avoid embedding irreversible English- or Russian-only assumptions into IDs and schemas.

- IDs are language-neutral.
- display names may later become localized fields.
- source titles should remain in their original bibliographic form where appropriate.

---

## 18. Explicitly Deferred

- accounts and cloud bookmarks;
- collaborative editing;
- user-submitted corrections;
- automatic Wikidata import;
- AI-generated content publication;
- 3D globe;
- native mobile apps;
- synchronized audio narration;
- educational courses and quizzes;
- live multiplayer exploration;
- full-world coverage from prehistory to the present.

---

## 19. Rule Priority

When rules conflict:

1. reviewed source data and explicit owner decision;
2. this document;
3. `ARCHITECTURE.md`;
4. `CURRENT_STATUS.md`;
5. inferred realism or external-product conventions.

---

## Guiding Rule

**Never trade historical honesty for the appearance of completeness.**
