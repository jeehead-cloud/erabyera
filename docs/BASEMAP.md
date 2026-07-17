# EraByEra physical basemap

**Status:** F5 implementation; owner external-browser verification pending  
**Last reviewed:** 2026-07-17

## Decision

EraByEra uses a repository-managed MapLibre style backed by local Natural Earth 1:110m physical GeoJSON. It does not call a tile provider at runtime, require an account, use a token, or depend on a public demo endpoint.

The style is owned in `src/map/basemap.ts`. Its four same-origin sources are stored under `public/map-data/`:

| File | Theme | Features | SHA-256 |
|---|---|---:|---|
| `ne_110m_land.geojson` | Land polygons | 127 | `9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9` |
| `ne_110m_coastline.geojson` | Coastline lines | 134 | `851f581ff5ffb844deed8ae1a9ce22e3c4bb3d74fa342cadb5d8e39b41ae7c3c` |
| `ne_110m_lakes.geojson` | Lake polygons | 24 | `eb02ecc86c82004fccbf979058bfabbbd6c2d07968c7844d38eb1c9152d2ffc9` |
| `ne_110m_rivers_lake_centerlines.geojson` | Rivers and lake centerlines | 13 | `55aa4497405afc07cdc931b7fbe062c4d6693ba2a550c0d24899953f5d507c8d` |

The files were retrieved on 2026-07-17 from Natural Earth’s maintained `nvkelso/natural-earth-vector` repository. Natural Earth’s official [1:110m physical vectors page](https://www.naturalearthdata.com/downloads/110m-physical-vectors/) identifies these themes and their current theme versions: coastline 4.1.0, land 4.0.0, lakes 5.0.0, and rivers/lake centerlines 5.0.0. The combined physical collection is listed as version 5.1.0.

## Layer audit

Included style layers:

- ocean background;
- land fill;
- lake fill;
- river and lake-centerline strokes;
- coastline strokes.

Explicitly absent:

- country, state, province, and other administrative boundary sources or layers;
- disputed or political boundary sources or layers;
- populated-place sources;
- city, town, village, or other settlement labels;
- road, rail, route-shield, or transport labels;
- glyphs and sprites.

The style contains only `background`, `fill`, and `line` layers. A Node-only Vitest audit rejects forbidden political, settlement, transport, and label terms in layer IDs, non-physical layer types, remote source URLs, raster tiles, glyphs, and sprites. This is a structural audit, not a substitute for owner visual review in a real browser.

Some Natural Earth physical feature properties contain descriptive names or administrative metadata inherited from the source dataset. No symbol layer, glyph source, text expression, or property-driven label renders those values.

## License and attribution

- Natural Earth states that all raster and vector data on its site are in the public domain and may be modified and used for personal, educational, and commercial purposes. Permission and credit are not required. See the official [Natural Earth Terms of Use](https://www.naturalearthdata.com/about/terms-of-use/).
- EraByEra nevertheless displays Natural Earth’s suggested short citation, “Made with Natural Earth,” linked to the official site.
- `maplibre-gl` 5.24.0 is BSD-3-Clause licensed.
- `react-map-gl` 8.1.1 is MIT licensed.
- The visible attribution control includes MapLibre and Natural Earth links and is configured as non-compact, including at narrow widths.

## Production and operational terms

The current basemap is suitable for static public hosting from a licensing and provider-terms perspective:

- no external tile-service terms apply;
- no API token or environment variable is required;
- no provider request quota or rate limit applies at runtime;
- the four static files are requested from the same deployment origin;
- hosting bandwidth and cache behavior are governed only by the future static host;
- Natural Earth provides no warranty of accuracy or fitness for a particular purpose.

The 1:110m data is deliberately generalized. It is suitable for the F5 global/regional shell and the Eastern Mediterranean starting view, but coastlines and inland water become visibly coarse at close zoom. F5 caps zoom at 7. A later resolution upgrade must repeat the source, size, performance, license, and forbidden-layer audit.

## Implementation references

- [MapLibre GL JS documentation](https://maplibre.org/maplibre-gl-js/docs/) — npm setup, CSS requirement, style-driven rendering, and controls.
- [MapLibre style source specification](https://maplibre.org/maplibre-style-spec/sources/) — same-origin GeoJSON URLs and source attribution.
- [react-map-gl documentation](https://visgl.github.io/react-map-gl/docs/) — supported MapLibre React integration.

## Owner external-browser verification

Automated browser tooling is intentionally not used for F5. Before calling the visual milestone fully verified, the owner must confirm map load, pan, zoom, attribution visibility, absence of modern borders and settlement labels, responsive sizing, route remount behavior, and a clean browser console in ordinary Chrome or Edge.
