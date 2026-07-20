import { describe, expect, it } from 'vitest'
import { loadBundledRuntimeData, loadBundledSearchIndex } from '../../data'
import { getCollectionById, getCollectionMembers } from '../collections'
import { searchEntities } from '../search'

const data = loadBundledRuntimeData()
const reviewed = <T extends { contentClassification: string }>(records: readonly T[]) =>
  records.filter((record) => record.contentClassification === 'reviewed-historical')

describe('F17 Granicus vertical content slice', () => {
  it('publishes the intentionally small reviewed entity set beside explicit fixtures', () => {
    expect(reviewed(data.polities).map((record) => record.id)).toEqual(['achaemenid-empire', 'kingdom-of-macedon'])
    expect(reviewed(data.places).map((record) => record.id)).toEqual(['abydos', 'granicus-battlefield', 'pella', 'sestos'])
    expect(reviewed(data.people).map((record) => record.id)).toEqual(['alexander-iii', 'darius-iii'])
    expect(reviewed(data.events).map((record) => record.id)).toEqual(['battle-of-the-granicus'])
    expect(reviewed(data.journeys).map((record) => record.id)).toEqual(['alexander-crossing-into-asia'])
    expect(data.places.some((record) => record.contentClassification === 'synthetic-fixture')).toBe(true)
  })

  it('keeps the Granicus account conservative and does not place Darius at the battle', () => {
    const battle = data.events.find((record) => record.id === 'battle-of-the-granicus')!
    expect(battle.type).toBe('battle')
    if (battle.type !== 'battle') throw new Error('Expected battle record')
    expect(battle.participantPersonIds).toEqual(['alexander-iii'])
    expect(battle.participantPersonIds).not.toContain('darius-iii')
    expect(battle.battle).not.toHaveProperty('forces')
    expect(battle.battle).not.toHaveProperty('losses')
    expect(battle.locationAccuracy).toBe('disputed')
    expect(battle.battle.disputedNotes.join(' ')).toContain('Diodorus')
  })

  it('links reviewed territories and the schematic journey to valid geometry', () => {
    const territoryFeatures = new Set(data.geometry.territories.features.map((feature) => feature.id))
    expect(reviewed(data.territories)).toHaveLength(2)
    expect(reviewed(data.territories).every((record) => territoryFeatures.has(record.geometryFeatureId))).toBe(true)
    const journey = data.journeys.find((record) => record.id === 'alexander-crossing-into-asia')!
    expect(journey.routeCertainty).toBe('schematic')
    expect(journey.stages.map((stage) => stage.placeId)).toEqual(['sestos', 'abydos', 'granicus-battlefield'])
    expect(data.geometry.journeys.features.some((feature) => feature.id === journey.geometryFeatureId)).toBe(true)
  })

  it('keeps every public Alexander collection member reviewed and source-resolvable', () => {
    const collection = getCollectionById(data, 'alexanders-world')!
    const members = getCollectionMembers(data, collection)
    expect(collection.membershipKind).toBe('reviewed')
    expect(members).toHaveLength(10)
    expect(members.every((member) => member.syntheticDemonstration === false)).toBe(true)
    const sourceIds = new Set(data.sources.map((source) => source.id))
    const sourceBearingRecords: readonly { contentClassification: string; sourceRefs: readonly { sourceId: string }[] }[] = [
      ...data.places, ...data.polities, ...data.territories, ...data.people, ...data.events, ...data.journeys,
    ]
    for (const record of reviewed(sourceBearingRecords)) expect(record.sourceRefs.every((reference) => sourceIds.has(reference.sourceId))).toBe(true)
  })

  it('indexes authored aliases for direct search discovery', () => {
    const index = loadBundledSearchIndex()
    expect(searchEntities(index, 'Alexander the Great', -334).results[0]).toMatchObject({ entityId: 'alexander-iii', matchKind: 'alias', contentClassification: 'reviewed-historical' })
    expect(searchEntities(index, 'Persian Empire', -334).results[0]).toMatchObject({ entityId: 'achaemenid-empire', matchKind: 'alias' })
  })
})
