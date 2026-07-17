import { describe, expect, it } from 'vitest'
import {
  SCHEMA_VERSION,
  battleSchema,
  confidenceSchema,
  contentCollectionSchema,
  editorialStatusSchema,
  entityIdSchema,
  eventSchema,
  findMissingReferences,
  findTemporalOverlaps,
  historicalEventSchema,
  journeySchema,
  locationAccuracySchema,
  longitudeLatitudeSchema,
  personPlacePeriodSchema,
  personSchema,
  placeImportancePeriodSchema,
  placeNamePeriodSchema,
  placeSchema,
  politySchema,
  sampleBattle,
  sampleCollection,
  sampleEvent,
  sampleJourney,
  samplePerson,
  samplePlace,
  samplePolity,
  sampleSource,
  sampleTerritoryPeriod,
  schemaVersionSchema,
  sourceReferenceSchema,
  sourceSchema,
  territoryControlSchema,
  territoryPeriodSchema,
  validatePublishedSources,
  type TemporalOverlap,
} from '.'

describe('shared schema conventions', () => {
  it.each(['sample-place', 'alexander-iii', 'entity2'])('accepts ID %s', (id) => {
    expect(entityIdSchema.parse(id)).toBe(id)
  })

  it.each([
    'Sample Place',
    'sample place',
    'sample/place',
    'sample_place',
    '-sample',
    'sample-',
    'sample--place',
    '',
  ])('rejects malformed ID %s', (id) => {
    expect(entityIdSchema.safeParse(id).success).toBe(false)
  })

  it('validates coordinates as [longitude, latitude]', () => {
    expect(longitudeLatitudeSchema.parse([170, 45])).toEqual([170, 45])
    expect(longitudeLatitudeSchema.safeParse([45, 120]).success).toBe(false)
    expect(longitudeLatitudeSchema.safeParse([181, 45]).success).toBe(false)
    expect(longitudeLatitudeSchema.safeParse([45, -91]).success).toBe(false)
  })

  it.each(['draft', 'reviewed', 'published', 'deprecated'])(
    'accepts editorial status %s',
    (status) => expect(editorialStatusSchema.parse(status)).toBe(status),
  )

  it.each(['high', 'medium', 'low', 'disputed', 'unknown'])(
    'accepts confidence %s',
    (confidence) => expect(confidenceSchema.parse(confidence)).toBe(confidence),
  )

  it.each([
    'exact',
    'approximate',
    'settlement-area',
    'regional',
    'disputed',
    'unknown',
  ])('accepts location accuracy %s', (accuracy) => {
    expect(locationAccuracySchema.parse(accuracy)).toBe(accuracy)
  })

  it.each([
    'core',
    'direct',
    'claimed',
    'tributary',
    'dependent',
    'sphere-of-influence',
    'disputed',
    'approximate',
  ])('accepts territory control %s', (control) => {
    expect(territoryControlSchema.parse(control)).toBe(control)
  })

  it('validates only schema version 1', () => {
    expect(schemaVersionSchema.parse(SCHEMA_VERSION)).toBe(1)
    expect(schemaVersionSchema.safeParse(2).success).toBe(false)
  })
})

describe('sources and publication rules', () => {
  it('accepts a valid source and rejects an invalid URL', () => {
    expect(sourceSchema.parse(sampleSource)).toEqual(sampleSource)
    expect(
      sourceSchema.safeParse({ ...sampleSource, url: 'not a url' }).success,
    ).toBe(false)
  })

  it('accepts a valid source reference', () => {
    expect(
      sourceReferenceSchema.parse({
        sourceId: sampleSource.id,
        locator: 'Fixture section',
        reviewedOn: '2026-07-17',
      }),
    ).toMatchObject({ sourceId: sampleSource.id })
  })

  it('rejects a published entity without source references', () => {
    expect(placeSchema.safeParse({ ...samplePlace, sourceRefs: [] }).success).toBe(
      false,
    )
    expect(
      validatePublishedSources({ editorialStatus: 'published', sourceRefs: [] }),
    ).toBe(false)
  })

  it('accepts published sources and source-free drafts', () => {
    expect(placeSchema.safeParse(samplePlace).success).toBe(true)
    expect(
      placeSchema.safeParse({
        ...samplePlace,
        editorialStatus: 'draft',
        sourceRefs: [],
      }).success,
    ).toBe(true)
  })
})

describe('place schemas', () => {
  it('accepts the representative Place fixture', () => {
    expect(placeSchema.parse(samplePlace)).toEqual(samplePlace)
  })

  it('accepts a historical place-name period', () => {
    expect(
      placeNamePeriodSchema.safeParse({
        name: 'Synthetic Historical Name',
        period: { yearFrom: -20, yearTo: -10 },
        language: 'Synthetic language',
        sourceRefs: [{ sourceId: sampleSource.id }],
      }).success,
    ).toBe(true)
  })

  it('rejects invalid existence and year zero through F2 schemas', () => {
    expect(
      placeSchema.safeParse({
        ...samplePlace,
        existence: { yearFrom: 5, yearTo: 1 },
      }).success,
    ).toBe(false)
    expect(
      placeSchema.safeParse({
        ...samplePlace,
        existence: { yearFrom: 0, yearTo: 1 },
      }).success,
    ).toBe(false)
  })

  it('rejects importance outside the 1–5 scale', () => {
    expect(
      placeImportancePeriodSchema.safeParse({
        period: { yearFrom: -10, yearTo: -1 },
        importance: 6,
        sourceRefs: [],
      }).success,
    ).toBe(false)
  })

  it('rejects unrelated subtype fields under strict schemas', () => {
    expect(placeSchema.safeParse({ ...samplePlace, battle: {} }).success).toBe(
      false,
    )
  })
})

describe('polity and territory schemas', () => {
  it('accepts the representative Polity fixture', () => {
    expect(politySchema.parse(samplePolity)).toEqual(samplePolity)
  })

  it('rejects a non-hex polity color', () => {
    expect(
      politySchema.safeParse({ ...samplePolity, color: 'brass' }).success,
    ).toBe(false)
  })

  it('accepts territory-period metadata without full geometry', () => {
    expect(territoryPeriodSchema.parse(sampleTerritoryPeriod)).toEqual(
      sampleTerritoryPeriod,
    )
  })
})

describe('person schemas', () => {
  it('accepts the representative Person fixture', () => {
    expect(personSchema.parse(samplePerson)).toEqual(samplePerson)
  })

  it('validates a bounded birth relationship rather than a permanent location', () => {
    const birth = samplePerson.places[0]
    expect(personPlacePeriodSchema.parse(birth).relationType).toBe('birth')
    expect(birth.period).toEqual({ yearFrom: -10, yearTo: -10 })
  })

  it('rejects invalid person importance and unknown fields', () => {
    expect(personSchema.safeParse({ ...samplePerson, importance: 0 }).success).toBe(
      false,
    )
    expect(personSchema.safeParse({ ...samplePerson, birthplace: 'x' }).success).toBe(
      false,
    )
  })
})

describe('event and battle schemas', () => {
  it('accepts an event with an unknown location and no coordinates', () => {
    expect(eventSchema.parse(sampleEvent)).toEqual(sampleEvent)
    expect(sampleEvent.coordinates).toBeUndefined()
  })

  it('accepts a located event', () => {
    expect(
      eventSchema.safeParse({
        ...sampleEvent,
        coordinates: [30, 45],
        locationAccuracy: 'exact',
      }).success,
    ).toBe(true)
  })

  it('accepts Battle as a specialized HistoricalEvent', () => {
    expect(battleSchema.parse(sampleBattle)).toEqual(sampleBattle)
    expect(historicalEventSchema.safeParse(sampleBattle).success).toBe(true)
  })

  it('rejects battle type without required battle details', () => {
    expect(
      historicalEventSchema.safeParse({ ...sampleBattle, battle: undefined })
        .success,
    ).toBe(false)
  })

  it('does not accept battle-only details on an ordinary event', () => {
    expect(eventSchema.safeParse({ ...sampleEvent, battle: {} }).success).toBe(
      false,
    )
  })
})

describe('journey and route-stage schemas', () => {
  it('accepts a journey with deterministic ordered stages', () => {
    expect(journeySchema.parse(sampleJourney)).toEqual(sampleJourney)
    expect(sampleJourney.stages.map((stage) => stage.order)).toEqual([1, 2])
  })

  it('rejects duplicate and non-sequential stage orders', () => {
    const duplicateStages = sampleJourney.stages.map((stage) => ({
      ...stage,
      order: 1,
    }))
    expect(
      journeySchema.safeParse({ ...sampleJourney, stages: duplicateStages })
        .success,
    ).toBe(false)

    const gapStages = sampleJourney.stages.map((stage, index) => ({
      ...stage,
      order: index === 0 ? 1 : 3,
    }))
    expect(
      journeySchema.safeParse({ ...sampleJourney, stages: gapStages }).success,
    ).toBe(false)

    expect(
      journeySchema.safeParse({
        ...sampleJourney,
        stages: [...sampleJourney.stages].reverse(),
      }).success,
    ).toBe(false)
  })

  it('rejects a stage without a place, event, or coordinates', () => {
    expect(
      journeySchema.safeParse({
        ...sampleJourney,
        stages: [{ order: 1, year: -1, sourceRefs: [] }],
      }).success,
    ).toBe(false)
  })
})

describe('content collection schema', () => {
  it('accepts the representative collection fixture', () => {
    expect(contentCollectionSchema.parse(sampleCollection)).toEqual(
      sampleCollection,
    )
  })

  it('rejects a recommended year outside the collection range', () => {
    expect(
      contentCollectionSchema.safeParse({
        ...sampleCollection,
        recommendedStartYear: 20,
      }).success,
    ).toBe(false)
  })

  it('rejects an unknown collection end and malformed viewport', () => {
    expect(
      contentCollectionSchema.safeParse({
        ...sampleCollection,
        timeRange: { yearFrom: -10, yearTo: null },
      }).success,
    ).toBe(false)
    expect(
      contentCollectionSchema.safeParse({
        ...sampleCollection,
        recommendedViewport: { longitude: 30, latitude: 95, zoom: 5 },
      }).success,
    ).toBe(false)
  })
})

describe('validation helpers', () => {
  it('detects inclusive temporal overlaps', () => {
    const records = [
      { period: { yearFrom: -500, yearTo: -400 } },
      { period: { yearFrom: -400, yearTo: -300 } },
      { period: { yearFrom: -200, yearTo: -100 } },
    ]
    const expected: TemporalOverlap[] = [{ firstIndex: 0, secondIndex: 1 }]

    expect(findTemporalOverlaps(records, (record) => record.period)).toEqual(
      expected,
    )
  })

  it('supports overlap checks for place period arrays', () => {
    expect(
      findTemporalOverlaps(samplePlace.names, (record) => record.period),
    ).toEqual([])
    expect(
      findTemporalOverlaps(samplePlace.ownership, (record) => record.period),
    ).toEqual([])
    expect(
      findTemporalOverlaps(samplePlace.importance, (record) => record.period),
    ).toEqual([])
  })

  it('detects two unknown-ended periods only under explicit semantics', () => {
    const records = [
      { period: { yearFrom: -10, yearTo: null } },
      { period: { yearFrom: 1, yearTo: null } },
    ]

    expect(findTemporalOverlaps(records, (record) => record.period)).toEqual([])
    expect(
      findTemporalOverlaps(records, (record) => record.period, {
        treatUnknownEndAsOpenEnded: true,
      }),
    ).toEqual([{ firstIndex: 0, secondIndex: 1 }])
  })

  it('finds unique sorted missing references', () => {
    expect(
      findMissingReferences(
        ['known-id', 'missing-two', 'missing-one', 'missing-two'],
        new Set(['known-id']),
      ),
    ).toEqual(['missing-one', 'missing-two'])
  })
})
