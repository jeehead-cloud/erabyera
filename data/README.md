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

`data:check` performs a read-only in-memory rebuild and fails when committed generated output is missing, extra, or stale. Schema changes require a coordinated source-data update or explicit migration; do not silently coerce old data.
