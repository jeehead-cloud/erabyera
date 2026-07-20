import type { RuntimeDataset } from '../../data'
import type { ContentCollection } from '../entities'
import { isActiveAtYear } from '../time'
import type { MapUrlViewport } from '../../url'
import { getCollectionCounts, getCollectionMembers, type CollectionCounts } from './collectionSelectors'

export type CollectionPeriodState = 'inside' | 'outside'
export type CollectionViewportState = 'recommended-focus' | 'outside-focus'

export interface CollectionCoveragePresentation {
  state: 'resolved'
  collection: ContentCollection
  periodState: CollectionPeriodState
  viewportState: CollectionViewportState
  counts: CollectionCounts
  messages: readonly string[]
}

export interface UnresolvedCollectionCoveragePresentation {
  state: 'unresolved'
  collectionId: string
  messages: readonly string[]
}

export type ActiveCollectionPresentation = CollectionCoveragePresentation | UnresolvedCollectionCoveragePresentation

export function classifyCollectionViewport(collection: ContentCollection, viewport: MapUrlViewport): CollectionViewportState {
  const bounds = collection.focusBounds
  return viewport.longitude >= bounds.west && viewport.longitude <= bounds.east && viewport.latitude >= bounds.south && viewport.latitude <= bounds.north
    ? 'recommended-focus'
    : 'outside-focus'
}

export function buildActiveCollectionPresentation(
  dataset: Readonly<RuntimeDataset>,
  collectionId: string,
  year: number,
  viewport: MapUrlViewport,
): ActiveCollectionPresentation {
  const collection = dataset.collections.find((candidate) => candidate.id === collectionId)
  if (collection === undefined) return {
    state: 'unresolved', collectionId,
    messages: ['This collection is unavailable in the current published dataset. The URL has been preserved so you can clear it explicitly.'],
  }
  const periodState = isActiveAtYear(collection.timeRange, year) ? 'inside' : 'outside'
  const viewportState = classifyCollectionViewport(collection, viewport)
  const counts = getCollectionCounts(getCollectionMembers(dataset, collection, year))
  const messages: string[] = []
  if (periodState === 'outside') messages.push("The selected year is outside this collection's documented time range.")
  if (viewportState === 'outside-focus') messages.push("This area is outside the collection's authored product focus. The focus bounds are not historical borders, and physical geography remains available.")
  if (periodState === 'inside' && viewportState === 'recommended-focus') messages.push('You are exploring the recommended time and region for this collection.')
  if (counts.active === 0) messages.push('No linked collection records are active at this year. That is a dataset-coverage gap, not evidence that no historical activity occurred.')
  else if (counts.activeUnmapped > 0) messages.push(`${counts.activeUnmapped} active linked ${counts.activeUnmapped === 1 ? 'record has' : 'records have'} no mapped context at this year.`)
  messages.push(collection.coverage.note)
  if (collection.completeness === 'foundation-preview') messages.push('The collection structure is active, but reviewed historical entity content will be added in the next content milestone.')
  messages.push('Collection context does not filter the other global Map data.')
  return {
    state: 'resolved', collection, periodState, viewportState,
    counts,
    messages,
  }
}
