import { describe, expect, it } from 'vitest'
import runtimeInput from '../../data/generated/runtime.json'
import {
  BUNDLED_RUNTIME_DATASET_VERSION,
  loadBundledSearchIndex,
  loadBundledRuntimeData,
  loadRuntimeDataset,
} from '.'

describe('bundled runtime-data loading', () => {
  it('accepts the valid generated runtime place data', () => {
    const dataset = loadBundledRuntimeData()
    expect(dataset.datasetVersion).toBe(BUNDLED_RUNTIME_DATASET_VERSION)
    expect(dataset.places).toHaveLength(7)
  })

  it('rejects an incompatible schema version', () => {
    expect(() => loadRuntimeDataset({ ...runtimeInput, schemaVersion: 2 })).toThrow()
  })

  it('rejects an incompatible dataset version', () => {
    expect(() => loadRuntimeDataset(runtimeInput, 'other-fixture-9.9.9')).toThrow('version mismatch')
  })

  it('rejects malformed place runtime data', () => {
    const malformed = structuredClone(runtimeInput)
    malformed.places[0].coordinates = [999, 999]
    expect(() => loadRuntimeDataset(malformed)).toThrow()
  })

  it('deep-freezes the loaded aggregate and place records', () => {
    const dataset = loadBundledRuntimeData()
    expect(Object.isFrozen(dataset)).toBe(true)
    expect(Object.isFrozen(dataset.places)).toBe(true)
    expect(Object.isFrozen(dataset.places[0])).toBe(true)
  })

  it('validates and freezes each bundled artifact once per module lifetime', () => {
    expect(loadBundledRuntimeData()).toBe(loadBundledRuntimeData())
    expect(loadBundledSearchIndex()).toBe(loadBundledSearchIndex())
  })

  it('classifies reviewed places separately from retained synthetic fixtures', () => {
    const places = loadBundledRuntimeData().places
    expect(places.filter((place) => place.contentClassification === 'reviewed-historical')).toHaveLength(4)
    expect(places.filter((place) => place.contentClassification === 'synthetic-fixture').every((place) => place.id.startsWith('synthetic-'))).toBe(true)
  })
})
