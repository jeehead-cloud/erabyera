import type { RuntimeDataset } from '../../data'
import { buildEntityPageModel, type EntityPageModel } from '../entityPages'
import { searchEntities, type SearchIndex, type SearchResult } from '../search'
import { parseHistoricalYear, type HistoricalYear } from '../time'
import type { SelectedEntityType } from '../../url'

export type ExploreCatalogType = SelectedEntityType
export type CatalogPeriodFilter = 'current' | 'all'
export type CatalogSort = 'name' | 'period' | 'importance' | 'type'

export const EXPLORE_CATALOGS = Object.freeze([
  { type: 'place', slug: 'places', label: 'Places', description: 'Settlements, ports, capitals, and other recorded places.' },
  { type: 'polity', slug: 'polities', label: 'Polities', description: 'Political entities, with or without reviewed territory geometry.' },
  { type: 'person', slug: 'people', label: 'People', description: 'Historical people, including alive records without a mapped location.' },
  { type: 'event', slug: 'events', label: 'Events', description: 'Historical events and specialized battles.' },
  { type: 'journey', slug: 'journeys', label: 'Journeys', description: 'Journeys, expeditions, migrations, and campaigns.' },
] satisfies readonly { type: ExploreCatalogType; slug: string; label: string; description: string }[])

export const DEFAULT_CATALOG_YEAR = -334 as HistoricalYear

const SORTS: Record<ExploreCatalogType, readonly CatalogSort[]> = {
  place: ['name', 'period', 'importance'],
  polity: ['name', 'period'],
  person: ['name', 'period', 'importance'],
  event: ['name', 'period', 'type'],
  journey: ['name', 'period', 'type'],
}

export interface CatalogQueryState {
  period: CatalogPeriodFilter
  year: HistoricalYear
  query: string
  sort: CatalogSort
}

export interface CatalogItem {
  model: EntityPageModel
  active: boolean
  mapped: boolean
  importance: number | null
  match: SearchResult | null
}

export interface ExploreCatalogModel {
  type: ExploreCatalogType
  state: CatalogQueryState
  items: readonly CatalogItem[]
  publishedCount: number
  activeCount: number
  searchUnavailable: boolean
  allowedSorts: readonly CatalogSort[]
}

export function catalogDefinition(type: ExploreCatalogType) {
  return EXPLORE_CATALOGS.find((catalog) => catalog.type === type)!
}

export function catalogTypeFromSlug(slug: string): ExploreCatalogType | null {
  return EXPLORE_CATALOGS.find((catalog) => catalog.slug === slug)?.type ?? null
}

export function parseCatalogQuery(
  search: string | URLSearchParams,
  type: ExploreCatalogType,
): CatalogQueryState {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search
  const yearValue = params.get('year')
  let year = DEFAULT_CATALOG_YEAR
  if (yearValue !== null && /^[+-]?\d+$/.test(yearValue)) {
    try { year = parseHistoricalYear(Number(yearValue)) } catch { year = DEFAULT_CATALOG_YEAR }
  }
  const period = params.get('period') === 'all' ? 'all' : 'current'
  const requestedSort = params.get('sort') as CatalogSort | null
  const sort = requestedSort !== null && SORTS[type].includes(requestedSort) ? requestedSort : 'name'
  return { period, year, query: (params.get('q') ?? '').slice(0, 200), sort }
}

export function serializeCatalogQuery(
  state: CatalogQueryState,
  type: ExploreCatalogType,
  currentSearch: string | URLSearchParams = '',
): URLSearchParams {
  const normalized = parseCatalogQuery(new URLSearchParams({
    period: state.period,
    year: String(state.year),
    q: state.query,
    sort: state.sort,
  }), type)
  const params = new URLSearchParams()
  params.set('period', normalized.period)
  if (normalized.period === 'current' || normalized.year !== DEFAULT_CATALOG_YEAR) params.set('year', String(normalized.year))
  if (normalized.query.trim() !== '') params.set('q', normalized.query.trim())
  if (normalized.sort !== 'name') params.set('sort', normalized.sort)
  const known = new Set(['period', 'year', 'q', 'sort'])
  const original = typeof currentSearch === 'string' ? new URLSearchParams(currentSearch) : currentSearch
  for (const [key, value] of [...original.entries()].filter(([key]) => !known.has(key)).sort()) {
    params.append(key, value)
  }
  return params
}

function idsForType(dataset: Readonly<RuntimeDataset>, type: ExploreCatalogType): readonly string[] {
  return (type === 'place' ? dataset.places
    : type === 'polity' ? dataset.polities
      : type === 'person' ? dataset.people
        : type === 'event' ? dataset.events
          : dataset.journeys).map((record) => record.id)
}

function activityAndMap(model: EntityPageModel): { active: boolean; mapped: boolean; importance: number | null } {
  if (model.entityType === 'place') return {
    active: model.presentation.active && model.presentation.importance !== null,
    mapped: model.presentation.coordinates !== undefined,
    importance: model.presentation.importance,
  }
  if (model.entityType === 'polity') return { active: model.presentation.active, mapped: model.presentation.hasActiveGeometry, importance: null }
  if (model.entityType === 'person') return { active: model.presentation.alive, mapped: model.presentation.mapped, importance: model.presentation.importance }
  if (model.entityType === 'event') return { active: model.presentation.active, mapped: model.presentation.locationAvailable, importance: null }
  return { active: model.presentation.active, mapped: model.presentation.geometryAvailable, importance: null }
}

function compareItems(sort: CatalogSort) {
  return (first: CatalogItem, second: CatalogItem): number => {
    const tie = first.model.id.localeCompare(second.model.id)
    if (sort === 'period') return first.model.period.yearFrom - second.model.period.yearFrom || first.model.name.localeCompare(second.model.name) || tie
    if (sort === 'importance') return (second.importance ?? 0) - (first.importance ?? 0) || first.model.name.localeCompare(second.model.name) || tie
    if (sort === 'type') return first.model.subtype.localeCompare(second.model.subtype) || first.model.name.localeCompare(second.model.name) || tie
    return first.model.name.localeCompare(second.model.name) || tie
  }
}

export function buildExploreCatalog(
  dataset: Readonly<RuntimeDataset>,
  index: Readonly<SearchIndex> | null,
  type: ExploreCatalogType,
  state: CatalogQueryState,
): ExploreCatalogModel {
  const ids = idsForType(dataset, type)
  const matches = state.query.trim() === '' || index === null
    ? null
    : searchEntities(index, state.query, state.year).results.filter((result) => result.entityType === type)
  const matchById = new Map(matches?.map((match) => [match.entityId, match]) ?? [])
  const items = ids.flatMap((id): CatalogItem[] => {
    if (matches !== null && !matchById.has(id)) return []
    const model = buildEntityPageModel(dataset, type, id, state.year)
    if (model === null) return []
    const status = activityAndMap(model)
    if (state.period === 'current' && !status.active) return []
    return [{
      model,
      ...status,
      mapped: state.period === 'all' ? model.mapped : status.mapped,
      match: matchById.get(id) ?? null,
    }]
  }).sort(compareItems(state.sort))
  const allModels = ids.flatMap((id) => {
    const model = buildEntityPageModel(dataset, type, id, state.year)
    return model === null ? [] : [activityAndMap(model)]
  })
  return {
    type,
    state,
    items,
    publishedCount: ids.length,
    activeCount: allModels.filter((item) => item.active).length,
    searchUnavailable: index === null && state.query.trim() !== '',
    allowedSorts: SORTS[type],
  }
}

export function buildExploreLandingCounts(dataset: Readonly<RuntimeDataset>, year: number) {
  const selectedYear = parseHistoricalYear(year)
  return EXPLORE_CATALOGS.map((catalog) => {
    const model = buildExploreCatalog(dataset, null, catalog.type, {
      period: 'current', year: selectedYear, query: '', sort: 'name',
    })
    return { ...catalog, publishedCount: model.publishedCount, activeCount: model.activeCount }
  })
}
