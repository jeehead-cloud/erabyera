import type { MapLayerId, SelectedEntityType } from '../../url'
import {
  formatHistoricalYearRange,
  isActiveAtYear,
  nearestYearInTemporalRange,
  parseHistoricalYear,
  type HistoricalYear,
  type TemporalRange,
} from '../time'
import { MIN_SEARCH_QUERY_LENGTH, normalizeSearchText } from './searchNormalization'
import type {
  SearchIndex,
  SearchIndexEntry,
  SearchMapPeriod,
  SearchNameKind,
  SearchNameVariant,
} from './searchSchemas'

export const SEARCH_RESULT_LIMIT = 20
export const SEARCH_GROUP_ORDER = Object.freeze([
  'place', 'polity', 'person', 'event', 'journey',
] as const)

export type SearchMatchCategory =
  | 'exact-primary'
  | 'exact-variant'
  | 'primary-prefix'
  | 'variant-prefix'
  | 'token-prefix'
  | 'substring'

const MATCH_ORDER: readonly SearchMatchCategory[] = [
  'exact-primary', 'exact-variant', 'primary-prefix',
  'variant-prefix', 'token-prefix', 'substring',
]

export interface SearchResult {
  entityType: SelectedEntityType
  entityId: string
  primaryName: string
  matchedName: string
  matchKind: SearchNameKind
  matchCategory: SearchMatchCategory
  period: TemporalRange
  context: string
  subtype: string
  requiredLayer: MapLayerId
  mapped: boolean
  activeAtSelectedYear: boolean
  targetYear: HistoricalYear
  focusCoordinates: readonly [number, number] | null
}

export interface SearchGroup {
  entityType: SelectedEntityType
  label: string
  results: readonly SearchResult[]
}

export interface SearchResponse {
  state: 'below-minimum' | 'no-results' | 'results'
  normalizedQuery: string
  total: number
  results: readonly SearchResult[]
  groups: readonly SearchGroup[]
}

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0
}

function tokensMatchPrefix(name: string, query: string): boolean {
  const nameTokens = name.split(' ')
  const queryTokens = query.split(' ')
  let position = 0
  return queryTokens.every((queryToken) => {
    const found = nameTokens.slice(position).findIndex((token) => token.startsWith(queryToken))
    if (found < 0) return false
    position += found + 1
    return true
  })
}

function classifyMatch(
  variant: SearchNameVariant,
  primaryNormalized: string,
  query: string,
): SearchMatchCategory | null {
  const primary = variant.kind === 'default' && variant.normalizedValue === primaryNormalized
  if (variant.normalizedValue === query) return primary ? 'exact-primary' : 'exact-variant'
  if (variant.normalizedValue.startsWith(query)) return primary ? 'primary-prefix' : 'variant-prefix'
  if (tokensMatchPrefix(variant.normalizedValue, query)) return 'token-prefix'
  if (variant.normalizedValue.includes(query)) return 'substring'
  return null
}

function historicalOrdinal(year: HistoricalYear): number {
  return year < 0 ? year : year - 1
}

function nearestMapPeriod(
  periods: readonly SearchMapPeriod[],
  year: HistoricalYear,
): SearchMapPeriod | null {
  return periods
    .map((period) => ({ period, year: nearestYearInTemporalRange(period.period, year) }))
    .filter((candidate): candidate is { period: SearchMapPeriod; year: HistoricalYear } => candidate.year !== null)
    .sort((first, second) =>
      Math.abs(historicalOrdinal(first.year) - historicalOrdinal(year)) -
        Math.abs(historicalOrdinal(second.year) - historicalOrdinal(year)) ||
      first.year - second.year,
    )[0]?.period ?? null
}

function targetYear(
  entry: SearchIndexEntry,
  variant: SearchNameVariant,
  selectedYear: HistoricalYear,
): HistoricalYear {
  if (variant.kind === 'historical' || variant.kind === 'transliteration' || variant.kind === 'alias') {
    if (variant.relevantYear !== undefined) return variant.relevantYear
    if (variant.period !== undefined) return variant.period.yearFrom
  }
  if (entry.entityType === 'person') {
    const activeMapped = entry.mapPeriods.find((period) =>
      period.coordinates !== undefined && isActiveAtYear(period.period, selectedYear),
    )
    if (isActiveAtYear(entry.period, selectedYear) && activeMapped !== undefined) return selectedYear
    const nearestMapped = nearestMapPeriod(
      entry.mapPeriods.filter((period) => period.coordinates !== undefined),
      selectedYear,
    )
    if (nearestMapped !== null) {
      return nearestYearInTemporalRange(nearestMapped.period, selectedYear) ?? nearestMapped.period.yearFrom
    }
  }
  return nearestYearInTemporalRange(entry.period, selectedYear) ?? entry.period.yearFrom
}

function focusCoordinates(
  entry: SearchIndexEntry,
  year: HistoricalYear,
): readonly [number, number] | null {
  if (entry.entityType !== 'place' && entry.entityType !== 'event' && entry.entityType !== 'person') return null
  const active = entry.mapPeriods.find((period) =>
    period.coordinates !== undefined && isActiveAtYear(period.period, year),
  )
  return active?.coordinates ?? null
}

function mappedAtYear(entry: SearchIndexEntry, year: HistoricalYear): boolean {
  return entry.mapped && entry.mapPeriods.some((period) => isActiveAtYear(period.period, year))
}

function bestMatch(entry: SearchIndexEntry, query: string): {
  variant: SearchNameVariant
  category: SearchMatchCategory
} | null {
  const primaryNormalized = normalizeSearchText(entry.primaryName)
  const matches = entry.names.flatMap((variant) => {
    const category = classifyMatch(variant, primaryNormalized, query)
    return category === null ? [] : [{ variant, category }]
  })
  matches.sort((first, second) =>
    MATCH_ORDER.indexOf(first.category) - MATCH_ORDER.indexOf(second.category) ||
    compareText(first.variant.normalizedValue, second.variant.normalizedValue) ||
    compareText(first.variant.kind, second.variant.kind),
  )
  return matches[0] ?? null
}

function groupLabel(type: SelectedEntityType): string {
  if (type === 'place') return 'Places'
  if (type === 'polity') return 'Polities'
  if (type === 'person') return 'People'
  if (type === 'event') return 'Events'
  return 'Journeys'
}

export function searchEntities(
  index: Readonly<SearchIndex>,
  query: string,
  selectedYear: number,
): SearchResponse {
  const normalizedQuery = normalizeSearchText(query)
  if (normalizedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    return { state: 'below-minimum', normalizedQuery, total: 0, results: [], groups: [] }
  }
  const currentYear = parseHistoricalYear(selectedYear)
  const results = index.entries.flatMap((entry): SearchResult[] => {
    const match = bestMatch(entry, normalizedQuery)
    if (match === null) return []
    const year = targetYear(entry, match.variant, currentYear)
    return [{
      entityType: entry.entityType,
      entityId: entry.entityId,
      primaryName: entry.primaryName,
      matchedName: match.variant.value,
      matchKind: match.variant.kind,
      matchCategory: match.category,
      period: match.variant.period ?? entry.period,
      context: entry.context,
      subtype: entry.subtype,
      requiredLayer: entry.requiredLayer,
      mapped: mappedAtYear(entry, year),
      activeAtSelectedYear: isActiveAtYear(entry.period, currentYear),
      targetYear: year,
      focusCoordinates: focusCoordinates(entry, year),
    }]
  }).sort((first, second) =>
    MATCH_ORDER.indexOf(first.matchCategory) - MATCH_ORDER.indexOf(second.matchCategory) ||
    Number(second.activeAtSelectedYear) - Number(first.activeAtSelectedYear) ||
    SEARCH_GROUP_ORDER.indexOf(first.entityType) - SEARCH_GROUP_ORDER.indexOf(second.entityType) ||
    compareText(normalizeSearchText(first.matchedName), normalizeSearchText(second.matchedName)) ||
    compareText(first.entityId, second.entityId),
  ).slice(0, SEARCH_RESULT_LIMIT)

  const groups = SEARCH_GROUP_ORDER.flatMap((entityType): SearchGroup[] => {
    const grouped = results.filter((result) => result.entityType === entityType)
    return grouped.length === 0 ? [] : [{ entityType, label: groupLabel(entityType), results: grouped }]
  })
  return {
    state: results.length === 0 ? 'no-results' : 'results',
    normalizedQuery,
    total: results.length,
    results,
    groups,
  }
}

export function searchResultPeriodLabel(result: SearchResult): string {
  return formatHistoricalYearRange(result.period)
}

export function searchResultMapLabel(result: SearchResult): string {
  return result.mapped ? 'Map context available' : 'No reviewed map location'
}
