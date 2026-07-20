# EraByEra data pipeline

`data/source/` and `data/geometry/` are the canonical, editable repository data. Every file declares schema version `1` and the same dataset version. The current records and coordinates are deliberately synthetic fixtures; they are not historical claims and must not be expanded into real content without reviewed sources and licensing.

`data/generated/` is committed runtime output. Never edit it by hand. It includes `runtime.json`, the general reference `index.json`, the compact browser `search-index.json`, and `manifest.json`. Run:

```powershell
npm run data:validate
npm run data:build
npm run data:check
```

Validation parses every strict F3 entity schema, verifies version agreement, globally unique entity IDs, source and cross-entity references, non-overlapping place names/ownership/importance and polity capitals, and matching bounded GeoJSON. Overlaps are rejected until a future schema explicitly represents competing interpretations.

The public runtime includes only `published` records and geometry referenced by them. Generation sorts entity records, stable set-like ID arrays, source references, index entries, search entries/name variants, and object keys while preserving temporal record arrays and journey-stage order. It emits no timestamps. The manifest includes deterministic counts, search-index format/count metadata, and a SHA-256 fingerprint covering the generated runtime, reference index, and search index, so two builds from identical source produce byte-identical files.

`search-index.json` uses schema version `1` and search-index format version `1`. It contains compact typed entries for Places, polities, people, events/battles, and journeys/campaigns: stable/default names, distinct authored historical Place names, authored Place transliterations where present, periods, concise context, required layers, and only the mapping metadata required for deterministic target-year and point-focus behavior. It never copies summaries, sources, battle sides, participants, relation arrays, territory polygons, or route geometry. Do not edit it or its normalized strings manually; change canonical authored fields or the generator and run `data:build`.

The F8 place-flow fixture contains exactly three published `synthetic-*` places. They deliberately cover a default-year active place with a changing name, a low-importance zoom-threshold place, and a place that is inactive at the default year. Their names, summaries, coordinates, periods, ownership, importance, and source are test-only inventions and are not reviewed historical content.

The F9 territory fixture contains two published `synthetic-*` polities and three published territory periods. Synthetic Alpha changes from an early direct Polygon to a later approximate Polygon; Synthetic Beta contributes a disputed MultiPolygon overlapping the later Alpha feature at the default year, then remains an active polity without active geometry after its claim ends. These shapes and claims are architecture-only inventions. TerritoryPeriod metadata is the authoritative evidence record; geometry contains only the matching `territoryPeriodId` link.

The F10 event fixture contains three published `synthetic-*` events. At 334 BCE, Synthetic Alpha Event is an exact point deliberately colocated with a place marker, while Synthetic Alpha Battle is an approximate point with two structured sides, two synthetic commanders, a result, a disputed note, and a related synthetic campaign. Synthetic Unknown-Location Event is active only at 250 BCE and intentionally contains no coordinates. The people, journey stages, collection range, and journey geometry were minimally aligned with those synthetic periods and relations. Event/battle-level source references are authoritative; participant entity sources are not copied into event evidence.

The F11 people fixture contains three published `synthetic-*` people. At 334 BCE Alpha and Beta have active campaign relationships to Synthetic Alpha Place and can aggregate at close-enough zoom. Alpha later changes to a rule relationship at Synthetic Beta Outpost. Alpha's birth relationship is bounded to one year. Gamma is alive but unmapped at 334 BCE, maps only during a later residence period, and can also demonstrate outside-life selection. Person coordinates are never stored; runtime presentation resolves Place coordinates. Active relationship references are authoritative for current location evidence, followed by person-level references.

The F12 journey fixture contains three published `synthetic-*` finite movements. Synthetic Alpha is a default-year campaign with a schematic LineString and explicit known direction. Synthetic Beta is a later probable expedition with MultiLineString geometry and unknown direction. Synthetic Gamma is a single-year active Journey with no geometry, proving that activity and mapping are independent. Stages explicitly link synthetic Places and Events or provide an authored coordinate-only stage; no intermediate route or coordinate is generated in browser code. Journey-level references are authoritative first, followed by stage references in authored order. Participant entity sources are not copied into Journey evidence.

F13 does not add or rewrite fixtures. Its selected-year overview derives published, active, mapped, and unmapped counts from the generated runtime and resolves the existing optional collection coverage metadata read-only. The UI must continue to identify this dataset as intentionally sparse synthetic foundation data; an empty overview year or geography is not evidence that no historical activity existed.

F14 also adds no fixture. The search generator indexes only fields already authored in the F13 synthetic dataset. There are currently no authored aliases or transliterations, so none appears in generated output; tests use in-memory entries for those edge contracts rather than inventing canonical content.

F16 adds the public `alexanders-world` collection shell with the approved 360–300 BCE framing, 334 BCE start, Eastern Mediterranean viewport, descriptive detailed/partial regions, conservative product focus bounds, and explicit missing-content metadata. The collection and coverage periods must match. It links 11 existing synthetic records only as `synthetic-demonstration` members; the UI must never present them as real historical members. Reviewed historical entities and source claims remain F17 work. `synthetic-alpha-collection` is retained as an `internal` compatibility fixture and public collection selectors exclude it through authored visibility metadata. Membership is always explicit and generated ID arrays remain deterministically sorted; coverage geography never infers membership or historical borders.

`data:check` performs a read-only in-memory rebuild and fails when committed generated output is missing, extra, or stale. Schema changes require a coordinated source-data update or explicit migration; do not silently coerce old data.

The browser consumes the committed generated runtime artifact, including published territory geometry, through `src/data`; application components never import editable `data/source` or `data/geometry` records.
