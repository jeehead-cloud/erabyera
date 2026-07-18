import { describe, expect, it } from 'vitest'
import { PLACE_INTERACTIVE_LAYER_IDS } from './placeLayerStyle'
import { TERRITORY_INTERACTIVE_LAYER_IDS } from './territoryLayerStyle'
import { HISTORICAL_INTERACTION_PRIORITY, HISTORICAL_LAYER_GROUP_ORDER, getHistoricalInteractiveLayerIds } from './historicalLayerOrder'
import {
  EVENT_BATTLE_LAYER,
  EVENT_INTERACTIVE_LAYER_IDS,
  EVENT_LAYER_ORDER,
  EVENT_ORDINARY_LAYER,
  EVENT_SELECTED_LAYER,
  EVENT_SELECTED_LAYER_ID,
  EVENT_SOURCE_ID,
  EVENT_UNCERTAIN_LAYER,
} from './eventLayerStyle'

describe('MapLibre event-layer configuration', () => {
  it('uses stable local source and layer IDs', () => {
    expect(EVENT_SOURCE_ID).toBe('historical-events')
    expect(EVENT_LAYER_ORDER).toEqual(['historical-events-ordinary', 'historical-events-uncertain', 'historical-events-battle', 'historical-events-selected'])
  })
  it('uses native circle layers only', () => expect([EVENT_ORDINARY_LAYER, EVENT_UNCERTAIN_LAYER, EVENT_BATTLE_LAYER, EVENT_SELECTED_LAYER].every((layer) => layer.type === 'circle')).toBe(true))
  it('makes uncertain points larger and thicker than ordinary points', () => {
    expect(EVENT_UNCERTAIN_LAYER.type === 'circle' && EVENT_UNCERTAIN_LAYER.paint?.['circle-radius']).toBe(8)
    expect(EVENT_UNCERTAIN_LAYER.type === 'circle' && EVENT_UNCERTAIN_LAYER.paint?.['circle-stroke-width']).toBe(3)
  })
  it('gives battle a distinct native style', () => expect(EVENT_BATTLE_LAYER.type === 'circle' && EVENT_BATTLE_LAYER.paint?.['circle-radius']).toBe(9))
  it('puts selected event above normal event layers', () => expect(EVENT_LAYER_ORDER.at(-1)).toBe(EVENT_SELECTED_LAYER_ID))
  it('uses a non-color-only selected outline', () => expect(EVENT_SELECTED_LAYER.type === 'circle' && EVENT_SELECTED_LAYER.paint?.['circle-stroke-width']).toBe(5))
  it('centralizes interactive event layers', () => expect(EVENT_INTERACTIVE_LAYER_IDS).toEqual(['historical-events-selected', 'historical-events-battle', 'historical-events-uncertain', 'historical-events-ordinary']))
  it('composes click priority with people between place and event', () => {
    expect(HISTORICAL_INTERACTION_PRIORITY).toEqual(['places', 'people', 'events', 'journeys', 'territories'])
    expect(getHistoricalInteractiveLayerIds({ places: true, events: true, territories: true })).toEqual([
      ...PLACE_INTERACTIVE_LAYER_IDS, ...EVENT_INTERACTIVE_LAYER_IDS, ...TERRITORY_INTERACTIVE_LAYER_IDS,
    ])
  })
  it('orders rendered historical groups as territory, journey, event, people, place', () => expect(HISTORICAL_LAYER_GROUP_ORDER).toEqual(['territories', 'journeys', 'events', 'people', 'places']))
  it('adds no remote source, glyph, sprite, or text dependency', () => {
    expect(EVENT_SOURCE_ID).not.toMatch(/^https?:/)
    expect(EVENT_LAYER_ORDER.every((id) => !id.includes('label'))).toBe(true)
  })
})
