# EraByEra data pipeline

`data/source/` and `data/geometry/` are the canonical, editable repository data. Every file declares schema version `1` and the same dataset version. The current records and coordinates are deliberately synthetic fixtures; they are not historical claims and must not be expanded into real content without reviewed sources and licensing.

`data/generated/` is committed runtime output. Never edit it by hand. Run:

```powershell
npm run data:validate
npm run data:build
npm run data:check
```

Validation parses every strict F3 entity schema, verifies version agreement, globally unique entity IDs, source and cross-entity references, non-overlapping place names/ownership/importance and polity capitals, and matching bounded GeoJSON. Overlaps are rejected until a future schema explicitly represents competing interpretations.

The public runtime includes only `published` records and geometry referenced by them. Generation sorts entity records, stable set-like ID arrays, source references, index entries, and object keys while preserving temporal record arrays and journey-stage order. It emits no timestamps. The manifest includes deterministic counts and a SHA-256 fingerprint, so two builds from identical source produce byte-identical files.

The F8 place-flow fixture contains exactly three published `synthetic-*` places. They deliberately cover a default-year active place with a changing name, a low-importance zoom-threshold place, and a place that is inactive at the default year. Their names, summaries, coordinates, periods, ownership, importance, and source are test-only inventions and are not reviewed historical content.

The F9 territory fixture contains two published `synthetic-*` polities and three published territory periods. Synthetic Alpha changes from an early direct Polygon to a later approximate Polygon; Synthetic Beta contributes a disputed MultiPolygon overlapping the later Alpha feature at the default year, then remains an active polity without active geometry after its claim ends. These shapes and claims are architecture-only inventions. TerritoryPeriod metadata is the authoritative evidence record; geometry contains only the matching `territoryPeriodId` link.

The F10 event fixture contains three published `synthetic-*` events. At 334 BCE, Synthetic Alpha Event is an exact point deliberately colocated with a place marker, while Synthetic Alpha Battle is an approximate point with two structured sides, two synthetic commanders, a result, a disputed note, and a related synthetic campaign. Synthetic Unknown-Location Event is active only at 250 BCE and intentionally contains no coordinates. The people, journey stages, collection range, and journey geometry were minimally aligned with those synthetic periods and relations. Event/battle-level source references are authoritative; participant entity sources are not copied into event evidence.

The F11 people fixture contains three published `synthetic-*` people. At 334 BCE Alpha and Beta have active campaign relationships to Synthetic Alpha Place and can aggregate at close-enough zoom. Alpha later changes to a rule relationship at Synthetic Beta Outpost. Alpha's birth relationship is bounded to one year. Gamma is alive but unmapped at 334 BCE, maps only during a later residence period, and can also demonstrate outside-life selection. Person coordinates are never stored; runtime presentation resolves Place coordinates. Active relationship references are authoritative for current location evidence, followed by person-level references.

`data:check` performs a read-only in-memory rebuild and fails when committed generated output is missing, extra, or stale. Schema changes require a coordinated source-data update or explicit migration; do not silently coerce old data.

The browser consumes the committed generated runtime artifact, including published territory geometry, through `src/data`; application components never import editable `data/source` or `data/geometry` records.
