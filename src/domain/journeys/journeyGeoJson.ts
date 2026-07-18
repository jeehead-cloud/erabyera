import type { JourneyFeatureCollection } from '../geometry'
import type { JourneyPresentation } from './journeySelectors'

export interface JourneyFeatureProperties {
  entityType: 'journey'
  journeyId: string
  journeyType: JourneyPresentation['journeyType']
  displayName: string
  certaintyGroup: JourneyPresentation['routeCertainty']
  directionKnown: boolean
  selected: boolean
  active: boolean
}

export interface JourneyMapFeature {
  type: 'Feature'
  id: string
  properties: JourneyFeatureProperties
  geometry: JourneyFeatureCollection['features'][number]['geometry']
}

export interface JourneyMapFeatureCollection {
  type: 'FeatureCollection'
  features: JourneyMapFeature[]
}

export function buildJourneyFeatureCollection(
  presentations: readonly JourneyPresentation[],
  geometry: JourneyFeatureCollection,
  journeysLayerActive: boolean,
  selectedJourneyId: string | null,
): JourneyMapFeatureCollection {
  const geometryById = new Map(geometry.features.map((feature) => [feature.id, feature]))
  const features = presentations.flatMap((journey): JourneyMapFeature[] => {
    const selected = journey.id === selectedJourneyId
    if ((!journeysLayerActive || !journey.active) && !selected) return []
    if (!journey.geometryAvailable || journey.geometryFeatureId === null) return []
    const canonical = geometryById.get(journey.geometryFeatureId)
    if (canonical === undefined || canonical.properties.journeyId !== journey.id) return []
    return [{
      type: 'Feature',
      id: canonical.id,
      properties: {
        entityType: 'journey',
        journeyId: journey.id,
        journeyType: journey.journeyType,
        displayName: journey.displayName,
        certaintyGroup: journey.routeCertainty,
        directionKnown: journey.directionKnown,
        selected,
        active: journey.active,
      },
      geometry: canonical.geometry,
    }]
  })
  return {
    type: 'FeatureCollection',
    features: features.sort((first, second) => first.id.localeCompare(second.id)),
  }
}
