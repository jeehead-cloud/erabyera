import type { PersonPresentation } from './personSelectors'

export interface PersonAggregateMember { id: string; name: string; roles: readonly string[]; importance: number; relationshipType: string }
export interface PersonLocationAggregate {
  placeId: string; placeName: string | null; coordinates: readonly [number, number]; members: readonly PersonAggregateMember[]
  visibleCount: number; highestImportance: number; aggregate: boolean; selectedPersonId: string | null; locationAccuracy: string | null
}
export function buildPersonLocationAggregates(presentations: readonly PersonPresentation[], zoom: number, peopleLayerActive: boolean, selectedPersonId: string | null): readonly PersonLocationAggregate[] {
  const groups = new Map<string, PersonPresentation[]>()
  for (const person of presentations) {
    const selected = person.id === selectedPersonId
    if (person.primaryLocation?.coordinates === null || person.primaryLocation === null || !person.mapped) continue
    if (!selected && !(peopleLayerActive && zoom >= person.minZoom)) continue
    const group = groups.get(person.primaryLocation.placeId) ?? []; if (!group.some((member) => member.id === person.id)) group.push(person); groups.set(person.primaryLocation.placeId, group)
  }
  return [...groups.entries()].map(([placeId, people]) => {
    people.sort((a, b) => b.importance - a.importance || a.displayName.localeCompare(b.displayName) || a.id.localeCompare(b.id))
    const primary = people[0].primaryLocation!
    const members = people.map((person) => ({ id: person.id, name: person.displayName, roles: person.roles, importance: person.importance, relationshipType: person.primaryLocation!.relationType }))
    return { placeId, placeName: primary.placeName, coordinates: primary.coordinates!, members, visibleCount: members.length,
      highestImportance: Math.max(...people.map((person) => person.importance)), aggregate: members.length > 1,
      selectedPersonId: people.find((person) => person.id === selectedPersonId)?.id ?? null,
      locationAccuracy: primary.placeUncertainty?.locationAccuracy ?? null }
  }).sort((a, b) => a.placeId.localeCompare(b.placeId))
}
