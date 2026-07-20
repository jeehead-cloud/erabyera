# EraByEra release checklist

**Status:** F18 operational release gate
**Last reviewed:** 2026-07-20

Use this checklist for a release candidate. Automated success does not replace the external-browser and deployed-host checks.

## 1. Automated gate

From Windows PowerShell in `C:\Projects\erabyera`, with a clean expected working tree:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run data:validate
npm.cmd run data:build
npm.cmd run data:check
npm.cmd run build
git diff --check
```

Run `npm.cmd run data:build` a second time and confirm `git diff -- data/generated` is empty, then run `npm.cmd run data:check` again. Inspect `git status --short`; do not publish `dist`, `node_modules`, coverage output, screenshots, secrets, or temporary files.

## 2. External-browser application gate

Start a disposable local session:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Open the printed URL in ordinary external Chrome or Edge. Complete all checks below, then stop Vite with `Ctrl+C`.

- Shell: Map, Explore, Collections, and Sources are labeled, keyboard reachable, visibly focused, and correctly marked active without horizontal overflow.
- Stable routes: open `/`, `/map`, `/explore`, all five `/explore/*` catalogs, all five entity-type routes, `/collections`, and `/collections/alexanders-world`; refresh every direct route.
- Recovery: check an unsupported route, a malformed entity ID, a missing valid entity ID, and a missing collection ID; confirm useful recovery links and an intact shell.
- Map URL: load a URL containing year, latitude, longitude, zoom, layers, entity, collection, and an unknown parameter; confirm restoration, canonicalization, no year zero, and unknown-parameter preservation.
- History: use selection, search, card close, Entity Page, View on map, collection Open/Reset/Leave, timeline, Explore, and Back/Forward; deliberate actions must be distinct while map movement and timeline updates must not flood history.
- Map: verify the physical basemap, attribution, navigation controls, pointer feedback, empty-map clearing, all five historical layers, territory → journey → event → people → place drawing, and place → person → event → journey → territory click priority.
- Timeline: verify direct BCE/CE input, Enter, Escape, previous/next, every step size, slider, the 1 BCE/1 CE boundary, and selected-year layer updates.
- Cards and overview: open Place, Polity, Battle/Event, Person, and Journey cards; verify close, full-page links, temporal actions, sources, mapped/unmapped/inactive/uncertain text, scrolling, and return to Year Overview.
- Search: verify minimum query, exact/prefix/token-prefix/substring examples, historical names, grouping, duplicate-name context, no results, Escape, arrows, Home/End, Enter, opener-focus restoration, point focus, unmapped selection, layer enabling, and one coherent history entry.
- Explore: verify current/all-period filters, signed catalog year entry, malformed-query normalization, historical-name search, valid sorts, alive-unmapped People, empty state, direct refresh, Entity Page, and View on map.
- Entity Pages: verify Pella, Sestos, Abydos, Granicus battlefield region, Kingdom of Macedon, Achaemenid Empire, Alexander III, Darius III, Battle of the Granicus, and Alexander's crossing into Asia; confirm one `h1`, breadcrumbs, specialized facts, sources, relations, uncertainty, wrapping, and unmapped behavior.
- Collections: verify public-only listing, Alexander's World counts/coverage, Open, Reset, Leave, recommended state, global Overview behavior, member page navigation, and member View on map retaining `collection=alexanders-world`.
- Editorial integrity: confirm Darius is not shown at Granicus, forces/losses remain omitted, conflicting battle evidence remains visible, route text says schematic, and territory text remains low-confidence/approximate.
- Keyboard: traverse every major control without a pointer; check visible focus, search Escape, dialogs/panels without traps, native form behavior, close controls, and source-link disclosure.
- Responsive: check at least 390, 720, and 1024 CSS pixels; verify navigation wrapping, usable touch targets, map visibility, timeline/card coexistence, panel scrolling, long names/URLs, and no page-level horizontal overflow.
- Console/Network: confirm no unexpected errors, failed generated/map assets, duplicate MapLibre initialization, remote search request, or secret-bearing request. Confirm all four `/map-data/*.geojson` assets and application chunks succeed.

## 3. Production-build preview gate

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1
```

Repeat the shell, direct-route navigation from in-app links, Map, search, generated-data, Console, and Network checks against the printed preview URL. Vite preview is not proof of host SPA fallback. Stop it with `Ctrl+C`.

## 4. Static-host deployment gate

1. Upload only the contents of `dist/` to the selected static host.
2. Configure every unresolved application route to rewrite to `/index.html` while preserving the URL.
3. Serve HTTPS; avoid long-lived caching for `index.html`; use immutable caching for content-hashed `/assets/*`; use reviewed caching for `/map-data/*`.
4. Test `/map`, every catalog/entity route, `/collections/alexanders-world`, and an unknown route by direct address and refresh.
5. Confirm generated runtime/search content is present in the built chunks, all Map assets load, attribution is visible, and no backend, runtime secret, or external search service is required.
6. Record the deployed URL and verification result in `CURRENT_STATUS.md` only after these checks pass.

## 5. Rollback

Retain the previous known-good static artifact or host deployment. If smoke tests fail, restore that artifact/deployment atomically, purge or invalidate `index.html` as the host requires, and recheck `/map` plus one direct entity route. Do not mix assets from different builds.

## 6. Accepted limitations

- Browser rendering, WebGL behavior, responsive layout, and host rewrites require owner verification.
- Natural Earth 1:110m geometry is intentionally coarse and Map zoom is capped at 7.
- MapLibre remains a roughly 1.03 MB minified isolated production chunk and triggers Vite's 500 kB advisory; hiding the warning is not permitted.
- Coverage is a narrow reviewed Granicus slice plus explicit internal synthetic regression fixtures, not comprehensive history.
- Polity/Journey automatic fitting, territory-overlap cycling, playback, guided stories, and a standalone Sources catalog remain deferred.
