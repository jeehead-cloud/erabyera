import type { RuntimeDataset } from '../../data'
import { createEventSelection } from '../events'
import { createJourneySelection } from '../journeys'
import { createPersonSelection } from '../people'
import { createPlaceSelection } from '../places'
import { createPolitySelection } from '../polities'
import type { Confidence } from '../entities'
import type { HistoricalYear } from '../time'
import type { MapLayerId, MapUrlState, SelectedEntityReference, SelectedEntityType } from '../../url'

export const YEAR_OVERVIEW_SELECTION_HISTORY_MODE = 'push' as const

export type YearOverviewEmptyState = 'content' | 'no-active-records' | 'active-but-unmapped'
export type YearOverviewSelectionState = 'overview' | 'entity-selection' | 'unresolved-selection'

export interface YearOverviewItem {
  entityType: SelectedEntityType
  entityLabel: string
  id: string
  name: string
  subtype: string
  context: string
  mapped: boolean
  layerActive: boolean
  confidence: Confidence | null
}

export interface YearOverviewCount {
  published: number
  active: number
  mapped: number
  unmapped: number
}

export interface YearOverviewCoverage {
  totalPublishedRecords: number
  entities: {
    events: YearOverviewCount
    polities: YearOverviewCount
    places: YearOverviewCount
    people: YearOverviewCount
    journeys: YearOverviewCount
  }
  activeTerritories: number
  layerFiltersHideActiveContent: boolean
  sparseCoverage: true
  syntheticFixture: boolean
  message: string
  fixtureWarning: string | null
}

export interface YearOverviewCollection {
  state: 'none' | 'resolved' | 'unresolved'
  id: string | null
  name: string | null
  coverageStatus: RuntimeDataset['collections'][number]['coverageStatus'] | null
  coverageNote: string | null
  detailedRegions: readonly string[]
  partialRegions: readonly string[]
  inSelectedYear: boolean | null
}

export interface YearOverviewPresentation {
  selectedYear: HistoricalYear
  formattedYear: string
  datasetName: string
  datasetVersion: string
  events: readonly YearOverviewItem[]
  polities: readonly YearOverviewItem[]
  places: readonly YearOverviewItem[]
  people: readonly YearOverviewItem[]
  journeys: readonly YearOverviewItem[]
  coverage: YearOverviewCoverage
  collection: YearOverviewCollection
  emptyState: YearOverviewEmptyState
}

export function createYearOverviewSelection(type: SelectedEntityType, id: string): SelectedEntityReference {
  if (type === 'place') return createPlaceSelection(id)
  if (type === 'polity') return createPolitySelection(id)
  if (type === 'event') return createEventSelection(id)
  if (type === 'person') return createPersonSelection(id)
  return createJourneySelection(id)
}

export function withYearOverviewSelection(
  state: MapUrlState,
  type: SelectedEntityType,
  id: string,
): MapUrlState {
  return { ...state, selectedEntity: createYearOverviewSelection(type, id) }
}

function selectionExists(dataset: Readonly<RuntimeDataset>, selection: SelectedEntityReference): boolean {
  const records = selection.type === 'place' ? dataset.places
    : selection.type === 'polity' ? dataset.polities
      : selection.type === 'event' ? dataset.events
        : selection.type === 'person' ? dataset.people
          : dataset.journeys
  return records.some((record) => record.id === selection.id)
}

export function getYearOverviewSelectionState(
  dataset: Readonly<RuntimeDataset>,
  selection: SelectedEntityReference | null,
): YearOverviewSelectionState {
  if (selection === null) return 'overview'
  return selectionExists(dataset, selection) ? 'entity-selection' : 'unresolved-selection'
}

export function overviewLayerForEntity(type: SelectedEntityType): MapLayerId {
  if (type === 'polity') return 'territories'
  if (type === 'place') return 'places'
  if (type === 'person') return 'people'
  if (type === 'event') return 'events'
  return 'journeys'
}
