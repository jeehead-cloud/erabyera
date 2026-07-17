import { describe, expect, it } from 'vitest'
import {
  INITIAL_MAP_VIEW,
  MAPLIBRE_ATTRIBUTION,
  MAP_ZOOM_LIMITS,
  NATURAL_EARTH_ATTRIBUTION,
  PHYSICAL_BASEMAP_STYLE,
} from './basemap'

const forbiddenLayerTerms =
  /admin|boundary|border|country|state|province|city|town|village|settlement|road|transport|shield|label/i

describe('physical basemap configuration', () => {
  it('uses a valid Eastern Mediterranean initial viewport', () => {
    expect(INITIAL_MAP_VIEW.longitude).toBeGreaterThanOrEqual(-180)
    expect(INITIAL_MAP_VIEW.longitude).toBeLessThanOrEqual(180)
    expect(INITIAL_MAP_VIEW.latitude).toBeGreaterThanOrEqual(-90)
    expect(INITIAL_MAP_VIEW.latitude).toBeLessThanOrEqual(90)
    expect(INITIAL_MAP_VIEW.zoom).toBeGreaterThanOrEqual(MAP_ZOOM_LIMITS.minZoom)
    expect(INITIAL_MAP_VIEW.zoom).toBeLessThanOrEqual(MAP_ZOOM_LIMITS.maxZoom)
  })

  it('declares accurate MapLibre and Natural Earth attribution', () => {
    expect(MAPLIBRE_ATTRIBUTION).toContain('https://maplibre.org/')
    expect(NATURAL_EARTH_ATTRIBUTION).toContain('naturalearthdata.com')
    expect(NATURAL_EARTH_ATTRIBUTION).toContain('Made with Natural Earth')
  })

  it('loads only same-origin Natural Earth physical GeoJSON sources', () => {
    const sources = Object.values(PHYSICAL_BASEMAP_STYLE.sources)
    expect(sources).toHaveLength(4)
    for (const source of sources) {
      expect(source.type).toBe('geojson')
      if (source.type !== 'geojson') continue
      expect(source.data).toMatch(/^\/map-data\/ne_110m_[a-z_]+\.geojson$/)
      expect(source.attribution).toBe(NATURAL_EARTH_ATTRIBUTION)
    }
  })

  it('contains only physical background, fill, and line layers', () => {
    expect(PHYSICAL_BASEMAP_STYLE.layers.map((layer) => layer.type)).toEqual([
      'background',
      'fill',
      'fill',
      'line',
      'line',
    ])
  })

  it('contains no forbidden political, settlement, transport, or label layer IDs', () => {
    for (const layer of PHYSICAL_BASEMAP_STYLE.layers) {
      expect(layer.id).not.toMatch(forbiddenLayerTerms)
    }
  })

  it('does not configure glyphs, sprites, raster tiles, or remote style URLs', () => {
    expect(PHYSICAL_BASEMAP_STYLE).not.toHaveProperty('glyphs')
    expect(PHYSICAL_BASEMAP_STYLE).not.toHaveProperty('sprite')
    expect(JSON.stringify(PHYSICAL_BASEMAP_STYLE)).not.toContain('tiles')
    for (const source of Object.values(PHYSICAL_BASEMAP_STYLE.sources)) {
      if (source.type === 'geojson') expect(source.data).not.toMatch(/^https?:/)
    }
  })
})
