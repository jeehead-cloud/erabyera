import { describe, expect, it } from 'vitest'
import { PLACE_INTERACTIVE_LAYER_IDS, PLACE_SELECTED_LAYER_ID } from './placeLayerStyle'
import {
  TERRITORY_FILL_LAYER,
  TERRITORY_INTERACTIVE_LAYER_IDS,
  TERRITORY_LAYER_ORDER,
  TERRITORY_SELECTED_BOUNDARY_LAYER,
  TERRITORY_SELECTED_BOUNDARY_LAYER_ID,
  TERRITORY_SELECTED_FILL_LAYER_ID,
  TERRITORY_SOURCE_ID,
  TERRITORY_UNCERTAIN_BOUNDARY_LAYER,
  territoryStyleGroup,
} from './territoryLayerStyle'

describe('MapLibre territory configuration', () => {
  it('uses stable local source and layer IDs', () => {
    expect(TERRITORY_SOURCE_ID).toBe('historical-territories')
    expect(TERRITORY_LAYER_ORDER).toEqual(['historical-territories-fill', 'historical-territories-boundary-solid', 'historical-territories-boundary-uncertain', 'historical-territories-selected-fill', 'historical-territories-selected-boundary'])
  })
  it.each([
    ['core', 'strong'], ['direct', 'strong'], ['tributary', 'reduced'], ['dependent', 'reduced'],
    ['claimed', 'claim'], ['sphere-of-influence', 'claim'], ['disputed', 'uncertain'], ['approximate', 'uncertain'],
  ] as const)('maps %s control to %s styling', (control, expected) => expect(territoryStyleGroup(control)).toBe(expected))
  it('distinguishes uncertainty with a dash pattern', () => expect(TERRITORY_UNCERTAIN_BOUNDARY_LAYER.type === 'line' && TERRITORY_UNCERTAIN_BOUNDARY_LAYER.paint?.['line-dasharray']).toEqual([2, 2]))
  it('gives selection a non-color-only wide outline', () => expect(TERRITORY_SELECTED_BOUNDARY_LAYER.type === 'line' && TERRITORY_SELECTED_BOUNDARY_LAYER.paint?.['line-width']).toBe(4))
  it('places selected territory layers above normal boundaries', () => expect(TERRITORY_LAYER_ORDER.indexOf(TERRITORY_SELECTED_FILL_LAYER_ID)).toBeGreaterThan(TERRITORY_LAYER_ORDER.indexOf('historical-territories-boundary-uncertain')))
  it('exposes only fill layers for interaction', () => expect(TERRITORY_INTERACTIVE_LAYER_IDS).toEqual([TERRITORY_SELECTED_FILL_LAYER_ID, 'historical-territories-fill']))
  it('keeps place interaction first when composed by MapView', () => expect([...PLACE_INTERACTIVE_LAYER_IDS, ...TERRITORY_INTERACTIVE_LAYER_IDS].indexOf(PLACE_SELECTED_LAYER_ID)).toBeLessThan(PLACE_INTERACTIVE_LAYER_IDS.length))
  it('uses native fill and line layers with no remote source', () => {
    expect(TERRITORY_FILL_LAYER.type).toBe('fill')
    expect(TERRITORY_SELECTED_BOUNDARY_LAYER.type).toBe('line')
    expect(TERRITORY_SOURCE_ID).not.toMatch(/^https?:/)
  })
  it('adds no text or glyph dependency', () => expect(TERRITORY_LAYER_ORDER.every((id) => !id.includes('label'))).toBe(true))
  it('keeps selected boundary as the top territory layer', () => expect(TERRITORY_LAYER_ORDER.at(-1)).toBe(TERRITORY_SELECTED_BOUNDARY_LAYER_ID))
})
