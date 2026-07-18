import type { RuntimeDataset } from '../../../src/data/runtime'
import type {
  SearchIndex,
  SearchIndexEntry,
  SearchMapPeriod,
  SearchNameVariant,
} from '../../../src/domain/search/searchSchemas'
import { SEARCH_INDEX_VERSION, searchIndexSchema } from '../../../src/domain/search/searchSchemas'
import { normalizeSearchText } from '../../../src/domain/search/searchNormalization'

function compareText(first: string, second: string): number {
  return first < second ? -1 : first > second ? 1 : 0
}

function variantKey(variant: SearchNameVariant): string {
  return [
    variant.kind,
    variant.normalizedValue,
    variant.period?.yearFrom ?? '',
    variant.period?.yearTo ?? '',
  ].join('\u0000')
}

function variants(values: readonly Omit<SearchNameVariant, 'normalizedValue'>[]): SearchNameVariant[] {
  const unique = new Map<string, SearchNameVariant>()
  for (const value of values) {
    const variant = { ...value, normalizedValue: normalizeSearchText(value.value) }
    if (variant.normalizedValue === '') continue
    const key = variantKey(variant)
    if (!unique.has(key)) unique.set(key, variant)
  }
  return [...unique.values()].sort((first, second) =>
    compareText(first.normalizedValue, second.normalizedValue) ||
    compareText(first.kind, second.kind) ||
    (first.period?.yearFrom ?? 0) - (second.period?.yearFrom ?? 0) ||
    (first.period?.yearTo ?? 0) - (second.period?.yearTo ?? 0),
  )
}

function context(parts: readonly (string | null | undefined)[]): string {
  return parts.filter((part): part is string => Boolean(part)).join(' · ')
}

function sortedMapPeriods(periods: readonly SearchMapPeriod[]): SearchMapPeriod[] {
  const unique = new Map<string, SearchMapPeriod>()
  for (const period of periods) {
    const key = `${period.period.yearFrom}:${period.period.yearTo ?? ''}:${period.coordinates?.join(',') ?? ''}`
    if (!unique.has(key)) unique.set(key, period)
  }
  return [...unique.values()].sort((first, second) =>
    first.period.yearFrom - second.period.yearFrom ||
    (first.period.yearTo ?? 0) - (second.period.yearTo ?? 0) ||
    (first.coordinates?.[0] ?? 0) - (second.coordinates?.[0] ?? 0) ||
    (first.coordinates?.[1] ?? 0) - (second.coordinates?.[1] ?? 0),
  )
}

export function buildSearchIndex(runtime: Readonly<RuntimeDataset>): SearchIndex {
  const polityNames = new Map(runtime.polities.map((polity) => [polity.id, polity.defaultName]))
  const placeById = new Map(runtime.places.map((place) => [place.id, place]))
  const territoryGeometry = new Set(runtime.geometry.territories.features.map((feature) => feature.id))
  const journeyGeometry = new Set(runtime.geometry.journeys.features.map((feature) => feature.id))

  const entries: SearchIndexEntry[] = [
    ...runtime.places.map((place): SearchIndexEntry => ({
      entityType: 'place',
      entityId: place.id,
      primaryName: place.defaultName,
      names: variants([
        { value: place.defaultName, kind: 'default' },
        ...place.names.filter((name) => name.name !== place.defaultName).map((name) => ({
          value: name.name,
          kind: 'historical' as const,
          period: name.period,
          relevantYear: name.period.yearFrom,
        })),
        ...place.names.flatMap((name) => name.transliteration === undefined ? [] : [{
          value: name.transliteration,
          kind: 'transliteration' as const,
          period: name.period,
          relevantYear: name.period.yearFrom,
        }]),
      ]),
      period: place.existence,
      context: context([
        place.placeType.replaceAll('-', ' '),
        ...new Set(place.ownership.map((ownership) => polityNames.get(ownership.polityId)).filter(Boolean)),
      ]),
      requiredLayer: 'places',
      subtype: place.placeType,
      mapped: place.coordinates !== undefined,
      mapPeriods: place.coordinates === undefined ? [] : [{ period: place.existence, coordinates: place.coordinates }],
    })),
    ...runtime.polities.map((polity): SearchIndexEntry => ({
      entityType: 'polity', entityId: polity.id, primaryName: polity.defaultName,
      names: variants([{ value: polity.defaultName, kind: 'default' }]),
      period: polity.existence,
      context: context([
        polity.polityType.replaceAll('-', ' '),
        ...polity.capitals.map((capital) => placeById.get(capital.placeId)?.defaultName),
      ]),
      requiredLayer: 'territories', subtype: polity.polityType,
      mapped: runtime.territories.some((territory) => territory.polityId === polity.id && territoryGeometry.has(territory.geometryFeatureId)),
      mapPeriods: sortedMapPeriods(runtime.territories
        .filter((territory) => territory.polityId === polity.id && territoryGeometry.has(territory.geometryFeatureId))
        .map((territory) => ({ period: territory.period }))),
    })),
    ...runtime.people.map((person): SearchIndexEntry => {
      const mapPeriods = sortedMapPeriods(person.places.flatMap((relationship) => {
        const coordinates = placeById.get(relationship.placeId)?.coordinates
        return coordinates === undefined ? [] : [{ period: relationship.period, coordinates }]
      }))
      return {
        entityType: 'person', entityId: person.id, primaryName: person.defaultName,
        names: variants([{ value: person.defaultName, kind: 'default' }]),
        period: person.life,
        context: context([
          person.roles.join(', '),
          ...new Set(person.places.map((relationship) => placeById.get(relationship.placeId)?.defaultName).filter(Boolean)),
        ]),
        requiredLayer: 'people',
        subtype: 'person', mapped: mapPeriods.length > 0, mapPeriods,
      }
    }),
    ...runtime.events.map((event): SearchIndexEntry => ({
      entityType: 'event', entityId: event.id, primaryName: event.defaultName,
      names: variants([{ value: event.defaultName, kind: 'default' }]),
      period: event.period,
      context: context([
        event.type === 'battle' ? 'battle' : `${event.type.replaceAll('-', ' ')} event`,
        ...event.relatedPlaceIds.map((id) => placeById.get(id)?.defaultName),
      ]),
      requiredLayer: 'events', subtype: event.type,
      mapped: event.coordinates !== undefined,
      mapPeriods: event.coordinates === undefined ? [] : [{ period: event.period, coordinates: event.coordinates }],
    })),
    ...runtime.journeys.map((journey): SearchIndexEntry => {
      const mapped = journey.geometryFeatureId !== undefined && journeyGeometry.has(journey.geometryFeatureId)
      return {
        entityType: 'journey', entityId: journey.id, primaryName: journey.defaultName,
        names: variants([{ value: journey.defaultName, kind: 'default' }]),
        period: journey.period,
        context: context([
          journey.journeyType.replaceAll('-', ' '),
          `${journey.routeCertainty} route`,
          ...new Set(journey.stages.map((stage) => stage.placeId === undefined ? undefined : placeById.get(stage.placeId)?.defaultName).filter(Boolean)),
        ]),
        requiredLayer: 'journeys', subtype: journey.journeyType,
        mapped, mapPeriods: mapped ? [{ period: journey.period }] : [],
      }
    }),
  ].sort((first, second) =>
    compareText(first.entityType, second.entityType) || compareText(first.entityId, second.entityId),
  )

  return searchIndexSchema.parse({
    schemaVersion: 1,
    searchIndexVersion: SEARCH_INDEX_VERSION,
    datasetVersion: runtime.datasetVersion,
    entries,
  })
}
