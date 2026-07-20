import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { STABLE_ROUTE_PATTERNS } from '../../app/routes'
import { ExternalSourceLink } from '../../components/ExternalSourceLink'
import { loadBundledRuntimeData, loadBundledSearchIndex } from '../../data'
import {
  COLLECTION_NAVIGATION_HISTORY_MODE,
  collectionRecommendedMapState,
  getCollectionById,
} from '../collections'
import {
  createCollectionMemberEntityPageHref,
  createEntityMapHref,
} from '../entityPages'
import { SEARCH_SELECTION_HISTORY_MODE } from '../search'
import {
  HISTORICAL_INTERACTION_PRIORITY,
  HISTORICAL_LAYER_GROUP_ORDER,
} from '../../map/layers'
import {
  MAP_CANONICALIZATION_HISTORY_MODE,
  MAP_MOVEMENT_HISTORY_MODE,
  parseMapUrlState,
} from '../../url'

describe('F18 release-readiness contracts', () => {
  it('keeps all stable product routes registered', () => {
    expect(STABLE_ROUTE_PATTERNS).toHaveLength(15)
    expect(STABLE_ROUTE_PATTERNS).toContain('/map')
    expect(STABLE_ROUTE_PATTERNS).toContain('/collections/:collectionId')
    expect(STABLE_ROUTE_PATTERNS).toContain('/journey/:entityId')
  })

  it('keeps passive state replacement separate from deliberate navigation', () => {
    expect([MAP_CANONICALIZATION_HISTORY_MODE, MAP_MOVEMENT_HISTORY_MODE]).toEqual(['replace', 'replace'])
    expect([SEARCH_SELECTION_HISTORY_MODE, COLLECTION_NAVIGATION_HISTORY_MODE]).toEqual(['push', 'push'])
  })

  it('preserves the authored layer and click priorities', () => {
    expect(HISTORICAL_LAYER_GROUP_ORDER).toEqual(['territories', 'journeys', 'events', 'people', 'places'])
    expect(HISTORICAL_INTERACTION_PRIORITY).toEqual(['places', 'people', 'events', 'journeys', 'territories'])
  })

  it('retains collection context across member page and Map navigation', () => {
    const dataset = loadBundledRuntimeData()
    const collection = getCollectionById(dataset, 'alexanders-world')!
    expect(createCollectionMemberEntityPageHref(collection, 'place', 'pella')).toContain('collection=alexanders-world')

    const href = createEntityMapHref(
      loadBundledSearchIndex(),
      'place',
      'pella',
      collection.recommendedStartYear,
      collectionRecommendedMapState(collection),
    )
    expect(parseMapUrlState(href?.split('?')[1] ?? '')).toMatchObject({
      collectionId: collection.id,
      selectedEntity: { type: 'place', id: 'pella' },
    })
  })

  it('discloses and safely opens external source links', () => {
    const markup = renderToStaticMarkup(createElement(
      ExternalSourceLink,
      { href: 'https://example.com' },
      'Example source',
    ))
    expect(markup).toContain('target="_blank"')
    expect(markup).toContain('rel="noopener noreferrer"')
    expect(markup).toContain('opens in a new tab')
  })
})
