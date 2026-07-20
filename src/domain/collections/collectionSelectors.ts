import type { RuntimeDataset } from '../../data'
import type { ContentCollection } from '../entities'
import type { SelectedEntityType } from '../../url'
import { isPlaceActiveAtYear } from '../places'
import { getActiveTerritoriesAtYear, isPolityActiveAtYear } from '../polities'
import { getActivePersonPlaceRelationships, isPersonAliveAtYear } from '../people'
import { isEventActiveAtYear } from '../events'
import { isJourneyActiveAtYear } from '../journeys'

export interface CollectionMember {
  type: SelectedEntityType
  id: string
  name: string
  subtype: string
  active: boolean
  mapped: boolean
  mappedAtYear: boolean
  syntheticDemonstration: boolean
}

export interface CollectionCounts {
  total: number
  byType: Readonly<Record<SelectedEntityType, number>>
  active: number
  activeMapped: number
  activeUnmapped: number
  mapped: number
  unmapped: number
}

const linkedKeys: Readonly<Record<SelectedEntityType, keyof ContentCollection['linkedEntities']>> = {
  place: 'placeIds', polity: 'polityIds', person: 'personIds', event: 'eventIds', journey: 'journeyIds',
}

export function getCollectionById(dataset: Readonly<RuntimeDataset>, id: string): ContentCollection | null {
  return dataset.collections.find((collection) => collection.id === id) ?? null
}

export function getPublicCollections(dataset: Readonly<RuntimeDataset>): readonly ContentCollection[] {
  return dataset.collections
    .filter((collection) => collection.visibility === 'public')
    .sort((first, second) => first.defaultName.localeCompare(second.defaultName) || first.id.localeCompare(second.id))
}

function memberMapped(dataset: Readonly<RuntimeDataset>, type: SelectedEntityType, id: string): boolean {
  if (type === 'place') return dataset.places.find((item) => item.id === id)?.coordinates !== undefined
  if (type === 'polity') {
    const territoryIds = new Set(dataset.territories.filter((item) => item.polityId === id).map((item) => item.geometryFeatureId))
    return dataset.geometry.territories.features.some((feature) => territoryIds.has(feature.id))
  }
  if (type === 'person') {
    const person = dataset.people.find((item) => item.id === id)
    return person?.places.some((relation) => dataset.places.some((place) => place.id === relation.placeId && place.coordinates !== undefined)) ?? false
  }
  if (type === 'event') return dataset.events.find((item) => item.id === id)?.coordinates !== undefined
  const featureId = dataset.journeys.find((item) => item.id === id)?.geometryFeatureId
  return featureId !== undefined && dataset.geometry.journeys.features.some((feature) => feature.id === featureId)
}

function memberActive(dataset: Readonly<RuntimeDataset>, type: SelectedEntityType, id: string, year: number): boolean {
  if (type === 'place') {
    const item = dataset.places.find((record) => record.id === id)
    return item !== undefined && isPlaceActiveAtYear(item, year)
  }
  if (type === 'polity') {
    const item = dataset.polities.find((record) => record.id === id)
    return item !== undefined && isPolityActiveAtYear(item, year)
  }
  if (type === 'person') {
    const item = dataset.people.find((record) => record.id === id)
    return item !== undefined && isPersonAliveAtYear(item, year)
  }
  if (type === 'event') {
    const item = dataset.events.find((record) => record.id === id)
    return item !== undefined && isEventActiveAtYear(item, year)
  }
  const item = dataset.journeys.find((record) => record.id === id)
  return item !== undefined && isJourneyActiveAtYear(item, year)
}

function memberMappedAtYear(dataset: Readonly<RuntimeDataset>, type: SelectedEntityType, id: string, year: number): boolean {
  if (!memberActive(dataset, type, id, year)) return false
  if (type === 'place') return memberMapped(dataset, type, id)
  if (type === 'polity') {
    const polity = dataset.polities.find((item) => item.id === id)
    if (polity === undefined) return false
    const featureIds = new Set(dataset.geometry.territories.features.map((feature) => feature.id))
    return getActiveTerritoriesAtYear(polity, dataset.territories, year).some((territory) => featureIds.has(territory.geometryFeatureId))
  }
  if (type === 'person') {
    const person = dataset.people.find((item) => item.id === id)
    return person === undefined ? false : getActivePersonPlaceRelationships(person, year)
      .some((relation) => dataset.places.some((place) => place.id === relation.placeId && place.coordinates !== undefined))
  }
  return memberMapped(dataset, type, id)
}

function memberRecord(dataset: Readonly<RuntimeDataset>, type: SelectedEntityType, id: string) {
  if (type === 'place') return dataset.places.find((item) => item.id === id)
  if (type === 'polity') return dataset.polities.find((item) => item.id === id)
  if (type === 'person') return dataset.people.find((item) => item.id === id)
  if (type === 'event') return dataset.events.find((item) => item.id === id)
  return dataset.journeys.find((item) => item.id === id)
}

function memberSubtype(dataset: Readonly<RuntimeDataset>, type: SelectedEntityType, id: string): string {
  if (type === 'place') return dataset.places.find((item) => item.id === id)?.placeType ?? type
  if (type === 'polity') return dataset.polities.find((item) => item.id === id)?.polityType ?? type
  if (type === 'person') return dataset.people.find((item) => item.id === id)?.roles.join(', ') ?? type
  if (type === 'event') return dataset.events.find((item) => item.id === id)?.type ?? type
  return dataset.journeys.find((item) => item.id === id)?.journeyType ?? type
}

export function getCollectionMembers(
  dataset: Readonly<RuntimeDataset>,
  collection: ContentCollection,
  year = collection.recommendedStartYear,
): readonly CollectionMember[] {
  const members: CollectionMember[] = []
  for (const type of ['place', 'polity', 'person', 'event', 'journey'] as const) {
    for (const id of collection.linkedEntities[linkedKeys[type]]) {
      const record = memberRecord(dataset, type, id)
      if (record === undefined) continue
      members.push({
        type, id, name: record.defaultName, subtype: memberSubtype(dataset, type, id),
        active: memberActive(dataset, type, id, year),
        mapped: memberMapped(dataset, type, id),
        mappedAtYear: memberMappedAtYear(dataset, type, id, year),
        syntheticDemonstration: collection.membershipKind === 'synthetic-demonstration',
      })
    }
  }
  return members.sort((first, second) => first.type.localeCompare(second.type) || first.name.localeCompare(second.name) || first.id.localeCompare(second.id))
}

export function groupCollectionMembers(members: readonly CollectionMember[]): Readonly<Record<SelectedEntityType, readonly CollectionMember[]>> {
  return {
    place: members.filter((item) => item.type === 'place'),
    polity: members.filter((item) => item.type === 'polity'),
    person: members.filter((item) => item.type === 'person'),
    event: members.filter((item) => item.type === 'event'),
    journey: members.filter((item) => item.type === 'journey'),
  }
}

export function getCollectionCounts(members: readonly CollectionMember[]): CollectionCounts {
  const grouped = groupCollectionMembers(members)
  return {
    total: members.length,
    byType: { place: grouped.place.length, polity: grouped.polity.length, person: grouped.person.length, event: grouped.event.length, journey: grouped.journey.length },
    active: members.filter((item) => item.active).length,
    activeMapped: members.filter((item) => item.active && item.mappedAtYear).length,
    activeUnmapped: members.filter((item) => item.active && !item.mappedAtYear).length,
    mapped: members.filter((item) => item.mapped).length,
    unmapped: members.filter((item) => !item.mapped).length,
  }
}

export function getCollectionsForEntity(dataset: Readonly<RuntimeDataset>, type: SelectedEntityType, id: string): readonly ContentCollection[] {
  return dataset.collections
    .filter((collection) => collection.linkedEntities[linkedKeys[type]].includes(id))
    .sort((first, second) => first.defaultName.localeCompare(second.defaultName) || first.id.localeCompare(second.id))
}
