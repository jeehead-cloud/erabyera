import type { RuntimeDataset } from '../data'

/** Preserves the pre-F17 fixture-only corpus for legacy selector regression tests. */
export function syntheticRuntime(dataset: Readonly<RuntimeDataset>): RuntimeDataset {
  const territories = dataset.territories.filter((record) => record.contentClassification === 'synthetic-fixture')
  const journeys = dataset.journeys.filter((record) => record.contentClassification === 'synthetic-fixture')
  const territoryFeatures = new Set(territories.map((record) => record.geometryFeatureId))
  const journeyFeatures = new Set(journeys.flatMap((record) => record.geometryFeatureId === undefined ? [] : [record.geometryFeatureId]))
  return Object.freeze({
    ...dataset,
    datasetVersion: 'foundation-fixture-0.1.0',
    datasetName: 'Synthetic Foundation Fixture Dataset',
    sources: dataset.sources.filter((record) => record.contentClassification === 'synthetic-fixture'),
    places: dataset.places.filter((record) => record.contentClassification === 'synthetic-fixture'),
    polities: dataset.polities.filter((record) => record.contentClassification === 'synthetic-fixture'),
    territories,
    people: dataset.people.filter((record) => record.contentClassification === 'synthetic-fixture'),
    events: dataset.events.filter((record) => record.contentClassification === 'synthetic-fixture'),
    journeys,
    collections: dataset.collections.filter((record) => record.contentClassification === 'synthetic-fixture'),
    geometry: {
      territories: { ...dataset.geometry.territories, features: dataset.geometry.territories.features.filter((feature) => territoryFeatures.has(feature.id)) },
      journeys: { ...dataset.geometry.journeys, features: dataset.geometry.journeys.features.filter((feature) => journeyFeatures.has(feature.id)) },
    },
  }) as RuntimeDataset
}
