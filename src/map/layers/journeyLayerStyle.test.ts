import { describe, expect, it } from 'vitest'
import type { LayerProps } from 'react-map-gl/maplibre'
import {
  HISTORICAL_INTERACTION_PRIORITY,
  HISTORICAL_LAYER_GROUP_ORDER,
  JOURNEY_CERTAIN_LAYER,
  JOURNEY_INTERACTIVE_LAYER_IDS,
  JOURNEY_LAYER_ORDER,
  JOURNEY_SELECTED_INACTIVE_LAYER,
  JOURNEY_SELECTED_LAYER,
  JOURNEY_SOURCE_ID,
  JOURNEY_UNCERTAIN_LAYER,
  getHistoricalInteractiveLayerIds,
  pickHistoricalMapInteraction,
} from '.'

const paint = (layer: LayerProps): Record<string, unknown> | undefined =>
  'paint' in layer ? layer.paint as Record<string, unknown> : undefined

describe('journey MapLibre configuration', () => {
  it('uses stable source and layer IDs', () => {
    expect(JOURNEY_SOURCE_ID).toBe('historical-journeys')
    expect(new Set(JOURNEY_LAYER_ORDER).size).toBe(JOURNEY_LAYER_ORDER.length)
  })
  it('uses only native line layers', () => {
    expect([JOURNEY_CERTAIN_LAYER, JOURNEY_UNCERTAIN_LAYER, JOURNEY_SELECTED_LAYER, JOURNEY_SELECTED_INACTIVE_LAYER].every((layer) => layer.type === 'line')).toBe(true)
  })
  it('distinguishes uncertain routes without color alone', () => expect(paint(JOURNEY_UNCERTAIN_LAYER)?.['line-dasharray']).toEqual([2, 1.5]))
  it('keeps route lines translucent over territories', () => expect(paint(JOURNEY_CERTAIN_LAYER)?.['line-opacity'] as number).toBeLessThan(1))
  it('uses distinct active and inactive selected styles', () => {
    expect(paint(JOURNEY_SELECTED_LAYER)).not.toEqual(paint(JOURNEY_SELECTED_INACTIVE_LAYER))
    expect(paint(JOURNEY_SELECTED_INACTIVE_LAYER)?.['line-dasharray']).toBeDefined()
  })
  it('puts selected route layers above normal route layers', () => expect(JOURNEY_LAYER_ORDER.slice(-2)).toEqual(['historical-journeys-selected', 'historical-journeys-selected-inactive']))
  it('requires no remote sprites, glyphs, or assets', () => expect(JSON.stringify([JOURNEY_CERTAIN_LAYER, JOURNEY_UNCERTAIN_LAYER])).not.toMatch(/https?:|sprite|glyph|symbol/))
  it('orders historical groups territory through place', () => expect(HISTORICAL_LAYER_GROUP_ORDER).toEqual(['territories', 'journeys', 'events', 'people', 'places']))
  it('centralizes click priority above territory', () => expect(HISTORICAL_INTERACTION_PRIORITY).toEqual(['places', 'people', 'events', 'journeys', 'territories']))
  it('returns interactive IDs in click-priority group order', () => {
    const ids = getHistoricalInteractiveLayerIds({ places: true, people: true, events: true, journeys: true, territories: true })
    expect(ids.indexOf(JOURNEY_INTERACTIVE_LAYER_IDS[0])).toBeGreaterThan(ids.findIndex((id) => id.startsWith('historical-events')))
    expect(ids.indexOf(JOURNEY_INTERACTIVE_LAYER_IDS[0])).toBeLessThan(ids.findIndex((id) => id.startsWith('historical-territories')))
  })
  it('picks place before person, event, journey, and polity regardless of feature order', () => {
    const features = [
      { properties: { entityType: 'journey', journeyId: 'journey' } },
      { properties: { polityId: 'polity' } },
      { properties: { entityType: 'event', eventId: 'event' } },
      { properties: { entityType: 'person-location', personId: 'person', placeId: 'person-place' } },
      { properties: { entityType: 'place', placeId: 'place' } },
    ]
    expect(pickHistoricalMapInteraction(features)).toEqual({ type: 'place', id: 'place' })
    expect(pickHistoricalMapInteraction(features.slice(0, 4))).toEqual({ type: 'person', id: 'person', placeId: 'person-place' })
    expect(pickHistoricalMapInteraction(features.slice(0, 3))).toEqual({ type: 'event', id: 'event' })
    expect(pickHistoricalMapInteraction(features.slice(0, 2))).toEqual({ type: 'journey', id: 'journey' })
    expect(pickHistoricalMapInteraction(features.slice(1, 2))).toEqual({ type: 'polity', id: 'polity' })
  })
  it('fails safely when no interactive feature exists', () => expect(pickHistoricalMapInteraction([])).toBeNull())
})
