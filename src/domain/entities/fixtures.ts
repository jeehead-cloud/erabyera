import { contentCollectionSchema } from './collection'
import { battleSchema, eventSchema } from './event'
import { journeySchema } from './journey'
import { personSchema } from './person'
import { placeSchema } from './place'
import { politySchema, territoryPeriodSchema } from './polity'
import { sourceSchema } from './source'

export const sampleSource = sourceSchema.parse({
  id: 'sample-source',
  title: 'Synthetic source fixture',
  sourceType: 'reference',
  organization: 'Fixture Organization',
  url: 'https://example.com/sample-source',
  editorialStatus: 'reviewed',
})

const sampleSourceRefs = [{ sourceId: sampleSource.id, locator: 'Fixture section' }]
const samplePeriod = { yearFrom: -10, yearTo: 10, datePrecision: 'range' as const }

export const samplePlace = placeSchema.parse({
  id: 'sample-place',
  defaultName: 'Sample Place',
  placeType: 'city',
  coordinates: [30, 45],
  existence: samplePeriod,
  names: [
    { name: 'Sample Place', period: samplePeriod, sourceRefs: sampleSourceRefs },
  ],
  ownership: [
    {
      polityId: 'sample-polity',
      period: samplePeriod,
      controlType: 'direct',
      sourceRefs: sampleSourceRefs,
    },
  ],
  importance: [
    { period: samplePeriod, importance: 3, sourceRefs: sampleSourceRefs },
  ],
  editorialStatus: 'published',
  sourceRefs: sampleSourceRefs,
})

export const samplePolity = politySchema.parse({
  id: 'sample-polity',
  defaultName: 'Sample Polity',
  polityType: 'kingdom',
  existence: samplePeriod,
  color: '#8f6620',
  capitals: [
    { placeId: samplePlace.id, period: samplePeriod, sourceRefs: sampleSourceRefs },
  ],
  rulers: [
    { personId: 'sample-person', period: samplePeriod, sourceRefs: sampleSourceRefs },
  ],
  editorialStatus: 'published',
  sourceRefs: sampleSourceRefs,
})

export const sampleTerritoryPeriod = territoryPeriodSchema.parse({
  id: 'sample-territory-period',
  polityId: samplePolity.id,
  period: samplePeriod,
  controlCategory: 'approximate',
  geometryFeatureId: 'sample-territory-feature',
  uncertainty: { confidence: 'low', note: 'Synthetic uncertainty fixture.' },
  editorialStatus: 'published',
  sourceRefs: sampleSourceRefs,
})

export const samplePerson = personSchema.parse({
  id: 'sample-person',
  defaultName: 'Sample Person',
  life: samplePeriod,
  roles: ['fixture role'],
  places: [
    {
      placeId: samplePlace.id,
      period: { yearFrom: -10, yearTo: -10 },
      relationType: 'birth',
      sourceRefs: sampleSourceRefs,
    },
  ],
  associatedPolityIds: [samplePolity.id],
  importance: 3,
  editorialStatus: 'published',
  sourceRefs: sampleSourceRefs,
})

export const sampleEvent = eventSchema.parse({
  id: 'sample-event',
  defaultName: 'Sample Event',
  type: 'political',
  period: { yearFrom: -2, yearTo: -1 },
  participantPolityIds: [samplePolity.id],
  participantPersonIds: [samplePerson.id],
  relatedPlaceIds: [],
  locationAccuracy: 'unknown',
  editorialStatus: 'published',
  sourceRefs: sampleSourceRefs,
})

export const sampleBattle = battleSchema.parse({
  id: 'sample-battle',
  defaultName: 'Sample Battle',
  type: 'battle',
  period: { yearFrom: -1, yearTo: -1 },
  coordinates: [30, 45],
  locationAccuracy: 'approximate',
  participantPolityIds: [samplePolity.id, 'sample-opponent'],
  participantPersonIds: [samplePerson.id],
  relatedPlaceIds: [samplePlace.id],
  battle: {
    sides: [
      {
        id: 'sample-side-one',
        label: 'Sample Side One',
        polityIds: [samplePolity.id],
        personIds: [samplePerson.id],
        commanderIds: [samplePerson.id],
      },
      {
        id: 'sample-side-two',
        label: 'Sample Side Two',
        polityIds: ['sample-opponent'],
        personIds: [],
        commanderIds: [],
      },
    ],
    result: 'Synthetic fixture result',
    disputedNotes: [],
  },
  editorialStatus: 'published',
  sourceRefs: sampleSourceRefs,
})

export const sampleJourney = journeySchema.parse({
  id: 'sample-journey',
  defaultName: 'Sample Journey',
  journeyType: 'campaign',
  period: samplePeriod,
  participantPersonIds: [samplePerson.id],
  participantPolityIds: [samplePolity.id],
  stages: [
    { order: 1, placeId: samplePlace.id, year: -2, sourceRefs: sampleSourceRefs },
    { order: 2, eventId: sampleEvent.id, year: -1, sourceRefs: sampleSourceRefs },
  ],
  geometryFeatureId: 'sample-route-feature',
  directionKnown: true,
  routeCertainty: 'schematic',
  editorialStatus: 'published',
  sourceRefs: sampleSourceRefs,
})

export const sampleCollection = contentCollectionSchema.parse({
  id: 'sample-collection',
  defaultName: 'Sample Collection',
  description: 'Synthetic collection fixture.',
  timeRange: samplePeriod,
  recommendedStartYear: -1,
  recommendedViewport: { longitude: 30, latitude: 45, zoom: 5 },
  coverage: {
    detailedRegions: ['Synthetic detailed region'],
    partialRegions: ['Synthetic partial region'],
    timeRange: samplePeriod,
    note: 'Coverage is intentionally synthetic and incomplete.',
  },
  linkedEntities: {
    placeIds: [samplePlace.id],
    polityIds: [samplePolity.id],
    personIds: [samplePerson.id],
    eventIds: [sampleEvent.id, sampleBattle.id],
    journeyIds: [sampleJourney.id],
  },
  coverageStatus: 'partial',
  datasetVersion: 'sample-0.1.0',
  editorialStatus: 'published',
  sourceRefs: sampleSourceRefs,
})
