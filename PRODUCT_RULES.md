# EraByEra вЂ” Product and Historical Data Rules

**Status:** Active baseline
**Last updated:** 2026-07-10
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

---

## 9. Events and Battles

- Events may be points, areas, or records without a precise mappable location.
- A battle is an event subtype for the MVP.
- A battle's participants may include polities and people.
- Long events use a period; single-year events may use the same start and end year.
- Events with unknown or disputed locations must be marked accordingly rather than assigned a plausible coordinate.

---

## 10. Journeys and Routes

- Journeys and campaigns are finite historical movements tied to a period.
- Trade routes are persistent networks and should remain a separate category when implemented.
- Route geometry is an approximation unless based on a documented reconstruction.
- A rendered line must not imply exact day-by-day movement unless the data supports it.
- Route direction should be visually represented only when known.

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

The exact thresholds must be centralized and testable, not scattered across components.

---

## 12. Timeline Interaction

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

## 13. Search and Permalinks

- Search may return entities outside the currently selected year.
- Choosing a search result moves to a relevant year and location.
- When several relevant years exist, use a clearly documented default such as the first active year or ask the user through the UI later.
- The URL is the reproducible source of selected year, map center, zoom, active layers, selected entity, and active collection.
- Map dragging and zooming replace the current history entry only when interaction ends; explicit committed navigation may push a new entry so Back and Forward remain meaningful.
- Unknown query parameters are preserved when map state is canonicalized or updated.
- Shared URLs restore typed state without implying that an entity or collection has been loaded or verified to exist.

---

## 14. Content Editing Rules

- Runtime app code must not contain canonical historical content.
- Data changes should be reviewable separately from UI changes.
- IDs are stable and must not be changed merely to improve display names.
- Top-level entity IDs are globally unique across entity types so untyped selections and reference indexes remain unambiguous.
- Deleting a referenced entity requires validation and explicit cleanup.
- Schema migrations for repository data must include a transformation plan or a coordinated data update.

---

## 15. Localization

Localization is not required for the first MVP, but the architecture should avoid embedding irreversible English- or Russian-only assumptions into IDs and schemas.

- IDs are language-neutral.
- display names may later become localized fields.
- source titles should remain in their original bibliographic form where appropriate.

---

## 16. Explicitly Deferred

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

## 17. Rule Priority

When rules conflict:

1. reviewed source data and explicit owner decision;
2. this document;
3. `ARCHITECTURE.md`;
4. `CURRENT_STATUS.md`;
5. inferred realism or external-product conventions.

---

## Guiding Rule

**Never trade historical honesty for the appearance of completeness.**
