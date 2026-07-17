import { describe, expect, it } from 'vitest'
import { PHYSICAL_BASEMAP_STYLE } from '../basemap'
import {
  PLACE_IMPORTANCE_LAYER_IDS,
  PLACE_INTERACTIVE_LAYER_IDS,
  PLACE_SELECTED_LAYER,
  PLACE_SELECTED_LAYER_ID,
  PLACE_SOURCE_ID,
  createPlaceImportanceLayer,
} from './placeLayerStyle'

describe('MapLibre place-layer configuration', () => {
  it('uses stable source and selected-layer IDs', () => {
    expect(PLACE_SOURCE_ID).toBe('historical-places')
    expect(PLACE_SELECTED_LAYER_ID).toBe('historical-places-selected')
  })

  it.each([1, 2, 3, 4, 5] as const)('creates stable native circle layer for importance %i', (importance) => {
    const layer = createPlaceImportanceLayer(importance)
    expect(layer).toMatchObject({ id: PLACE_IMPORTANCE_LAYER_IDS[importance], type: 'circle', source: PLACE_SOURCE_ID })
  })

  it('places selected highlight after all normal interactive IDs', () => {
    expect(PLACE_INTERACTIVE_LAYER_IDS.at(-1)).toBe(PLACE_SELECTED_LAYER_ID)
    expect(PLACE_SELECTED_LAYER.id).toBe(PLACE_SELECTED_LAYER_ID)
  })

  it('uses a stronger non-color-only selected outline', () => {
    const selectedCircleLayer = PLACE_SELECTED_LAYER.type === 'circle'
      ? PLACE_SELECTED_LAYER
      : null
    expect(selectedCircleLayer?.paint?.['circle-stroke-width']).toBe(4)
  })

  it('adds no remote map source', () => {
    expect(PLACE_SOURCE_ID).not.toMatch(/^https?:/)
    expect(Object.values(PHYSICAL_BASEMAP_STYLE.sources).every((source) => !('url' in source))).toBe(true)
  })

  it('adds no text, symbol, glyph, or font dependency', () => {
    expect(PLACE_SELECTED_LAYER.type).toBe('circle')
    expect(PHYSICAL_BASEMAP_STYLE.glyphs).toBeUndefined()
    expect(PHYSICAL_BASEMAP_STYLE.sprite).toBeUndefined()
  })

  it('centralizes every interactive place layer ID', () => {
    expect(PLACE_INTERACTIVE_LAYER_IDS).toHaveLength(6)
    expect(new Set(PLACE_INTERACTIVE_LAYER_IDS).size).toBe(6)
  })
})
