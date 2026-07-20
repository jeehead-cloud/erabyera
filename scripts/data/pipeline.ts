import { createHash } from 'node:crypto'
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { z } from 'zod'
import {
  battleSchema,
  contentCollectionSchema,
  datasetVersionSchema,
  eventSchema,
  findTemporalOverlaps,
  journeySchema,
  personSchema,
  placeSchema,
  politySchema,
  schemaVersionSchema,
  sourceSchema,
  territoryPeriodSchema,
  type ContentCollection,
  type HistoricalEvent,
  type Journey,
  type Person,
  type Place,
  type Polity,
  type Source,
  type TerritoryPeriod,
} from '../../src/domain/entities'
import {
  journeyFeatureCollectionSchema,
  territoryFeatureCollectionSchema,
  type JourneyFeatureCollection,
  type TerritoryFeatureCollection,
} from '../../src/domain/geometry'
import { runtimeDatasetSchema, type RuntimeDataset } from '../../src/data/runtime'
import { buildSearchIndex } from './search/buildSearchIndex'

export const DATA_KINDS = ['sources', 'places', 'polities', 'territories', 'people', 'events', 'journeys', 'collections'] as const
export type DataKind = (typeof DATA_KINDS)[number]

const descriptorSchema = z.object({
  schemaVersion: schemaVersionSchema,
  datasetVersion: datasetVersionSchema,
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  fixturePolicy: z.enum(['synthetic-only', 'mixed-reviewed-and-synthetic']),
  files: z.object({
    sources: z.string().regex(/^[a-z0-9-]+\.json$/), places: z.string().regex(/^[a-z0-9-]+\.json$/), polities: z.string().regex(/^[a-z0-9-]+\.json$/), territories: z.string().regex(/^[a-z0-9-]+\.json$/),
    people: z.string().regex(/^[a-z0-9-]+\.json$/), events: z.string().regex(/^[a-z0-9-]+\.json$/), journeys: z.string().regex(/^[a-z0-9-]+\.json$/), collections: z.string().regex(/^[a-z0-9-]+\.json$/),
    territoryGeometry: z.string().regex(/^[a-z0-9-]+\.geojson$/), journeyGeometry: z.string().regex(/^[a-z0-9-]+\.geojson$/),
  }).strict(),
}).strict()

const recordSchemas: Record<DataKind, z.ZodType> = {
  sources: sourceSchema,
  places: placeSchema,
  polities: politySchema,
  territories: territoryPeriodSchema,
  people: personSchema,
  events: z.union([eventSchema, battleSchema]),
  journeys: journeySchema,
  collections: contentCollectionSchema,
}

const wrapperSchema = (recordSchema: z.ZodType) => z.object({
  schemaVersion: schemaVersionSchema,
  datasetVersion: datasetVersionSchema,
  records: z.array(recordSchema),
}).strict()

export interface PipelineIssue { file: string; record?: string; path: string; message: string }
export interface RawWorkspace {
  root: string
  descriptorPath: string
  descriptor: unknown
  records: Record<DataKind, { path: string; value: unknown }>
  territoryGeometry: { path: string; value: unknown }
  journeyGeometry: { path: string; value: unknown }
}
export interface ValidatedDataset {
  schemaVersion: 1
  datasetVersion: string
  name: string
  description: string
  sources: Source[]
  places: Place[]
  polities: Polity[]
  territories: TerritoryPeriod[]
  people: Person[]
  events: HistoricalEvent[]
  journeys: Journey[]
  collections: ContentCollection[]
  territoryGeometry: TerritoryFeatureCollection
  journeyGeometry: JourneyFeatureCollection
}
export type ValidationResult = { ok: true; data: ValidatedDataset } | { ok: false; issues: PipelineIssue[] }

async function readJson(path: string): Promise<unknown> {
  try { return JSON.parse(await readFile(path, 'utf8')) as unknown }
  catch (error) { throw new Error(`${path}: ${error instanceof Error ? error.message : String(error)}`, { cause: error }) }
}

export async function loadSourceWorkspace(root: string): Promise<RawWorkspace> {
  const descriptorPath = join(root, 'data', 'source', 'dataset.json')
  const descriptor = await readJson(descriptorPath)
  const parsedDescriptor = descriptorSchema.safeParse(descriptor)
  if (!parsedDescriptor.success) {
    return {
      root, descriptorPath, descriptor,
      records: Object.fromEntries(DATA_KINDS.map((kind) => [kind, { path: join(root, 'data', 'source', `${kind}.json`), value: null }])) as RawWorkspace['records'],
      territoryGeometry: { path: join(root, 'data', 'geometry', 'territories.geojson'), value: null },
      journeyGeometry: { path: join(root, 'data', 'geometry', 'journeys.geojson'), value: null },
    }
  }
  const files = parsedDescriptor.data.files
  const recordEntries = await Promise.all(DATA_KINDS.map(async (kind) => [kind, {
    path: join(root, 'data', 'source', files[kind]),
    value: await readJson(join(root, 'data', 'source', files[kind])),
  }] as const))
  const territoryPath = join(root, 'data', 'geometry', files.territoryGeometry)
  const journeyPath = join(root, 'data', 'geometry', files.journeyGeometry)
  return {
    root, descriptorPath, descriptor, records: Object.fromEntries(recordEntries) as RawWorkspace['records'],
    territoryGeometry: { path: territoryPath, value: await readJson(territoryPath) },
    journeyGeometry: { path: journeyPath, value: await readJson(journeyPath) },
  }
}

function zodIssues(file: string, error: z.ZodError): PipelineIssue[] {
  return error.issues.map((issue) => ({ file, path: issue.path.join('.') || '(root)', message: issue.message }))
}

function addMissing(issues: PipelineIssue[], file: string, record: string, path: string, id: string, type: string, known: ReadonlySet<string>) {
  if (!known.has(id)) issues.push({ file, record, path, message: `Missing ${type} reference '${id}'.` })
}

function validateReferences(data: ValidatedDataset, paths: Record<DataKind, string>, issues: PipelineIssue[]) {
  const ids = {
    source: new Set(data.sources.map((x) => x.id)), place: new Set(data.places.map((x) => x.id)),
    polity: new Set(data.polities.map((x) => x.id)), person: new Set(data.people.map((x) => x.id)),
    event: new Set(data.events.map((x) => x.id)), journey: new Set(data.journeys.map((x) => x.id)),
    territory: new Set(data.territories.map((x) => x.id)),
  }
  const checkSourceTree = (kind: DataKind, record: { id: string }, value: unknown, path = '') => {
    if (Array.isArray(value)) value.forEach((child, index) => checkSourceTree(kind, record, child, `${path}.${index}`))
    else if (value && typeof value === 'object') Object.entries(value).forEach(([key, child]) => {
      const childPath = path ? `${path}.${key}` : key
      if (key === 'sourceId' && typeof child === 'string') addMissing(issues, paths[kind], record.id, childPath, child, 'source', ids.source)
      else checkSourceTree(kind, record, child, childPath)
    })
  }
  for (const kind of DATA_KINDS) for (const record of data[kind]) checkSourceTree(kind, record, record)
  for (const place of data.places) {
    place.names.forEach((x, i) => x.sourceRefs.forEach((r, j) => addMissing(issues, paths.places, place.id, `names.${i}.sourceRefs.${j}`, r.sourceId, 'source', ids.source)))
    place.ownership.forEach((x, i) => { addMissing(issues, paths.places, place.id, `ownership.${i}.polityId`, x.polityId, 'polity', ids.polity); x.sourceRefs.forEach((r, j) => addMissing(issues, paths.places, place.id, `ownership.${i}.sourceRefs.${j}`, r.sourceId, 'source', ids.source)) })
    place.importance.forEach((x, i) => x.sourceRefs.forEach((r, j) => addMissing(issues, paths.places, place.id, `importance.${i}.sourceRefs.${j}`, r.sourceId, 'source', ids.source)))
  }
  for (const polity of data.polities) {
    polity.capitals.forEach((x, i) => { addMissing(issues, paths.polities, polity.id, `capitals.${i}.placeId`, x.placeId, 'place', ids.place); x.sourceRefs.forEach((r, j) => addMissing(issues, paths.polities, polity.id, `capitals.${i}.sourceRefs.${j}`, r.sourceId, 'source', ids.source)) })
    polity.rulers.forEach((x, i) => { addMissing(issues, paths.polities, polity.id, `rulers.${i}.personId`, x.personId, 'person', ids.person); x.sourceRefs.forEach((r, j) => addMissing(issues, paths.polities, polity.id, `rulers.${i}.sourceRefs.${j}`, r.sourceId, 'source', ids.source)) })
  }
  for (const territory of data.territories) addMissing(issues, paths.territories, territory.id, 'polityId', territory.polityId, 'polity', ids.polity)
  for (const person of data.people) {
    person.associatedPolityIds.forEach((id, i) => addMissing(issues, paths.people, person.id, `associatedPolityIds.${i}`, id, 'polity', ids.polity))
    person.places.forEach((x, i) => { addMissing(issues, paths.people, person.id, `places.${i}.placeId`, x.placeId, 'place', ids.place); if (x.eventId) addMissing(issues, paths.people, person.id, `places.${i}.eventId`, x.eventId, 'event', ids.event); if (x.journeyId) addMissing(issues, paths.people, person.id, `places.${i}.journeyId`, x.journeyId, 'journey', ids.journey) })
  }
  for (const event of data.events) {
    event.participantPolityIds.forEach((id, i) => addMissing(issues, paths.events, event.id, `participantPolityIds.${i}`, id, 'polity', ids.polity))
    event.participantPersonIds.forEach((id, i) => addMissing(issues, paths.events, event.id, `participantPersonIds.${i}`, id, 'person', ids.person))
    event.relatedPlaceIds.forEach((id, i) => addMissing(issues, paths.events, event.id, `relatedPlaceIds.${i}`, id, 'place', ids.place))
    if (event.type === 'battle') {
      if (event.battle.relatedJourneyId) addMissing(issues, paths.events, event.id, 'battle.relatedJourneyId', event.battle.relatedJourneyId, 'journey', ids.journey)
      event.battle.sides.forEach((side, i) => { side.polityIds.forEach((id, j) => addMissing(issues, paths.events, event.id, `battle.sides.${i}.polityIds.${j}`, id, 'polity', ids.polity)); side.personIds.forEach((id, j) => addMissing(issues, paths.events, event.id, `battle.sides.${i}.personIds.${j}`, id, 'person', ids.person)); side.commanderIds.forEach((id, j) => addMissing(issues, paths.events, event.id, `battle.sides.${i}.commanderIds.${j}`, id, 'person', ids.person)) })
    }
  }
  for (const journey of data.journeys) {
    journey.participantPolityIds.forEach((id, i) => addMissing(issues, paths.journeys, journey.id, `participantPolityIds.${i}`, id, 'polity', ids.polity))
    journey.participantPersonIds.forEach((id, i) => addMissing(issues, paths.journeys, journey.id, `participantPersonIds.${i}`, id, 'person', ids.person))
    journey.stages.forEach((stage, i) => { if (stage.placeId) addMissing(issues, paths.journeys, journey.id, `stages.${i}.placeId`, stage.placeId, 'place', ids.place); if (stage.eventId) addMissing(issues, paths.journeys, journey.id, `stages.${i}.eventId`, stage.eventId, 'event', ids.event) })
  }
  for (const collection of data.collections) {
    const groups = [['placeIds', ids.place], ['polityIds', ids.polity], ['personIds', ids.person], ['eventIds', ids.event], ['journeyIds', ids.journey]] as const
    for (const [key, known] of groups) collection.linkedEntities[key].forEach((id, i) => addMissing(issues, paths.collections, collection.id, `linkedEntities.${key}.${i}`, id, key.slice(0, -3), known))
  }
}

function validateUniquenessAndOverlaps(data: ValidatedDataset, paths: Record<DataKind, string>, issues: PipelineIssue[]) {
  const global = new Map<string, string>()
  for (const kind of DATA_KINDS) for (const record of data[kind]) {
    const previous = global.get(record.id)
    if (previous) issues.push({ file: paths[kind], record: record.id, path: 'id', message: `Duplicate global entity ID '${record.id}' already used by ${previous}.` })
    else global.set(record.id, kind)
  }
  const report = (file: string, record: string, path: string, count: number) => { if (count) issues.push({ file, record, path, message: 'Overlapping periods are forbidden unless a future schema explicitly models competing interpretations.' }) }
  for (const place of data.places) {
    report(paths.places, place.id, 'names', findTemporalOverlaps(place.names, (x) => x.period).length)
    report(paths.places, place.id, 'ownership', findTemporalOverlaps(place.ownership, (x) => x.period).length)
    report(paths.places, place.id, 'importance', findTemporalOverlaps(place.importance, (x) => x.period).length)
  }
  for (const polity of data.polities) report(paths.polities, polity.id, 'capitals', findTemporalOverlaps(polity.capitals, (x) => x.period).length)
}

function validateGeometry(data: ValidatedDataset, territoryPath: string, journeyPath: string, issues: PipelineIssue[]) {
  const territoryFeatureIds = new Set<string>()
  const territoryIds = new Set(data.territories.map((x) => x.id))
  for (const feature of data.territoryGeometry.features) {
    if (territoryFeatureIds.has(feature.id)) issues.push({ file: territoryPath, record: feature.id, path: 'id', message: `Duplicate geometry feature ID '${feature.id}'.` })
    territoryFeatureIds.add(feature.id)
    addMissing(issues, territoryPath, feature.id, 'properties.territoryPeriodId', feature.properties.territoryPeriodId, 'territory', territoryIds)
  }
  for (const territory of data.territories) addMissing(issues, territoryPath, territory.id, 'geometryFeatureId', territory.geometryFeatureId, 'territory geometry feature', territoryFeatureIds)
  const journeyFeatureIds = new Set<string>()
  const journeyIdByFeatureId = new Map<string, string>()
  const journeyIds = new Set(data.journeys.map((x) => x.id))
  for (const feature of data.journeyGeometry.features) {
    if (territoryFeatureIds.has(feature.id)) issues.push({ file: journeyPath, record: feature.id, path: 'id', message: `Geometry feature ID '${feature.id}' is already used by territory geometry.` })
    if (journeyFeatureIds.has(feature.id)) issues.push({ file: journeyPath, record: feature.id, path: 'id', message: `Duplicate geometry feature ID '${feature.id}'.` })
    journeyFeatureIds.add(feature.id)
    journeyIdByFeatureId.set(feature.id, feature.properties.journeyId)
    addMissing(issues, journeyPath, feature.id, 'properties.journeyId', feature.properties.journeyId, 'journey', journeyIds)
  }
  for (const journey of data.journeys) if (journey.geometryFeatureId) {
    addMissing(issues, journeyPath, journey.id, 'geometryFeatureId', journey.geometryFeatureId, 'journey geometry feature', journeyFeatureIds)
    const linkedJourneyId = journeyIdByFeatureId.get(journey.geometryFeatureId)
    if (linkedJourneyId !== undefined && linkedJourneyId !== journey.id) {
      issues.push({ file: journeyPath, record: journey.id, path: 'geometryFeatureId', message: `Journey geometry feature '${journey.geometryFeatureId}' points to '${linkedJourneyId}' instead.` })
    }
  }
}

export function validateSourceWorkspace(workspace: RawWorkspace): ValidationResult {
  const issues: PipelineIssue[] = []
  const descriptorResult = descriptorSchema.safeParse(workspace.descriptor)
  if (!descriptorResult.success) return { ok: false, issues: zodIssues(relative(workspace.root, workspace.descriptorPath), descriptorResult.error) }
  const descriptor = descriptorResult.data
  const parsed: Partial<Record<DataKind, unknown[]>> = {}
  const paths = {} as Record<DataKind, string>
  for (const kind of DATA_KINDS) {
    const entry = workspace.records[kind]
    paths[kind] = relative(workspace.root, entry.path)
    const result = wrapperSchema(recordSchemas[kind]).safeParse(entry.value)
    if (!result.success) issues.push(...zodIssues(paths[kind], result.error))
    else {
      if (result.data.schemaVersion !== descriptor.schemaVersion) issues.push({ file: paths[kind], path: 'schemaVersion', message: 'Schema version does not match dataset descriptor.' })
      if (result.data.datasetVersion !== descriptor.datasetVersion) issues.push({ file: paths[kind], path: 'datasetVersion', message: 'Dataset version does not match dataset descriptor.' })
      parsed[kind] = result.data.records
    }
  }
  const territoryResult = territoryFeatureCollectionSchema.safeParse(workspace.territoryGeometry.value)
  const journeyResult = journeyFeatureCollectionSchema.safeParse(workspace.journeyGeometry.value)
  if (!territoryResult.success) issues.push(...zodIssues(relative(workspace.root, workspace.territoryGeometry.path), territoryResult.error))
  if (!journeyResult.success) issues.push(...zodIssues(relative(workspace.root, workspace.journeyGeometry.path), journeyResult.error))
  if (issues.length || !territoryResult.success || !journeyResult.success) return { ok: false, issues }
  for (const [path, collection] of [[workspace.territoryGeometry.path, territoryResult.data], [workspace.journeyGeometry.path, journeyResult.data]] as const) {
    if (collection.datasetVersion !== descriptor.datasetVersion) issues.push({ file: relative(workspace.root, path), path: 'datasetVersion', message: 'Dataset version does not match dataset descriptor.' })
  }
  const data: ValidatedDataset = {
    schemaVersion: 1, datasetVersion: descriptor.datasetVersion, name: descriptor.name, description: descriptor.description,
    sources: parsed.sources as Source[], places: parsed.places as Place[], polities: parsed.polities as Polity[],
    territories: parsed.territories as TerritoryPeriod[], people: parsed.people as Person[], events: parsed.events as HistoricalEvent[],
    journeys: parsed.journeys as Journey[], collections: parsed.collections as ContentCollection[],
    territoryGeometry: territoryResult.data, journeyGeometry: journeyResult.data,
  }
  validateUniquenessAndOverlaps(data, paths, issues)
  validateReferences(data, paths, issues)
  validateGeometry(data, relative(workspace.root, workspace.territoryGeometry.path), relative(workspace.root, workspace.journeyGeometry.path), issues)
  return issues.length ? { ok: false, issues } : { ok: true, data }
}

function normalize(value: unknown, key = ''): unknown {
  if (Array.isArray(value)) {
    const normalized = value.map((item) => normalize(item))
    if (key === 'sourceRefs') return normalized.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
    if (key.endsWith('Ids')) return normalized.sort((a, b) => String(a).localeCompare(String(b)))
    return normalized
  }
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([childKey, child]) => [childKey, normalize(child, childKey)]))
  return value
}
const serialize = (value: unknown) => `${JSON.stringify(normalize(value), null, 2)}\n`
const published = <T extends { editorialStatus: string }>(records: readonly T[]) => records.filter((x) => x.editorialStatus === 'published').sort((a, b) => ('id' in a && 'id' in b ? String(a.id).localeCompare(String(b.id)) : 0))

function relatedIds(record: unknown, known: ReadonlySet<string>): string[] {
  const found = new Set<string>()
  const visit = (value: unknown, key = '') => {
    if (Array.isArray(value)) value.forEach((x) => visit(x, key))
    else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => visit(v, k))
    else if (typeof value === 'string' && (key.endsWith('Id') || key.endsWith('Ids')) && key !== 'id' && key !== 'sourceId' && key !== 'geometryFeatureId' && known.has(value)) found.add(value)
  }
  visit(record)
  return [...found].sort()
}

export function buildGeneratedFiles(data: ValidatedDataset): Map<string, string> {
  const geometryTerritoryIds = new Set(published(data.territories).map((x) => x.geometryFeatureId))
  const publishedJourneys = published(data.journeys)
  const geometryJourneyIds = new Set(publishedJourneys.flatMap((x) => x.geometryFeatureId ? [x.geometryFeatureId] : []))
  const runtime: RuntimeDataset = {
    schemaVersion: 1, datasetVersion: data.datasetVersion, datasetName: data.name, editorialPolicy: 'published-only',
    sources: published(data.sources), places: published(data.places), polities: published(data.polities), territories: published(data.territories),
    people: published(data.people), events: published(data.events), journeys: publishedJourneys, collections: published(data.collections),
    geometry: {
      territories: { ...data.territoryGeometry, features: data.territoryGeometry.features.filter((x) => geometryTerritoryIds.has(x.id)).sort((a, b) => a.id.localeCompare(b.id)) },
      journeys: { ...data.journeyGeometry, features: data.journeyGeometry.features.filter((x) => geometryJourneyIds.has(x.id)).sort((a, b) => a.id.localeCompare(b.id)) },
    },
  }
  runtimeDatasetSchema.parse(runtime)
  const allGroups = DATA_KINDS.map((kind) => [kind, runtime[kind]] as const)
  const known = new Set(allGroups.flatMap(([, records]) => records.map((x) => x.id)))
  const index = allGroups.flatMap(([kind, records]) => records.map((record) => ({
    type: kind, id: record.id,
    name: 'defaultName' in record ? record.defaultName : 'title' in record ? record.title : record.id,
    status: record.editorialStatus, sourceCount: 'sourceRefs' in record ? record.sourceRefs.length : 0,
    relatedIds: relatedIds(record, known), geometryFeatureId: 'geometryFeatureId' in record ? record.geometryFeatureId : undefined,
  }))).sort((a, b) => a.id.localeCompare(b.id))
  const searchIndex = buildSearchIndex(runtime)
  const files = new Map<string, string>([
    ['runtime.json', serialize(runtime)],
    ['index.json', serialize({ schemaVersion: 1, datasetVersion: data.datasetVersion, records: index })],
    ['search-index.json', serialize(searchIndex)],
  ])
  const fingerprint = createHash('sha256').update([...files.entries()].map(([name, content]) => `${name}\n${content}`).join('')).digest('hex')
  const counts = Object.fromEntries(allGroups.map(([kind, records]) => [kind, records.length]))
  files.set('manifest.json', serialize({
    schemaVersion: 1, datasetVersion: data.datasetVersion, datasetName: data.name,
    compatibility: { minimumRuntimeSchemaVersion: 1 }, editorialPolicy: 'published-only', timestampPolicy: 'none',
    files: ['index.json', 'manifest.json', 'runtime.json', 'search-index.json'], counts,
    search: { indexVersion: searchIndex.searchIndexVersion, entries: searchIndex.entries.length },
    geometryCounts: { territories: runtime.geometry.territories.features.length, journeys: runtime.geometry.journeys.features.length },
    fingerprint: { algorithm: 'sha256', value: fingerprint },
  }))
  return files
}

export async function writeGeneratedFiles(files: ReadonlyMap<string, string>, generatedDir: string): Promise<void> {
  await mkdir(generatedDir, { recursive: true })
  for (const [name, content] of files) await writeFile(join(generatedDir, name), content, 'utf8')
}

export async function compareGeneratedFiles(files: ReadonlyMap<string, string>, generatedDir: string): Promise<string[]> {
  const problems: string[] = []
  const actualNames = await readdir(generatedDir)
    .then((names) => names.filter((name) => name.endsWith('.json')).sort())
    .catch(() => null)
  if (!actualNames) return ['Generated directory is missing.']
  const expectedNames = [...files.keys()].sort()
  for (const name of expectedNames) {
    try { if (await readFile(join(generatedDir, name), 'utf8') !== files.get(name)) problems.push(`${name} is stale.`) }
    catch { problems.push(`${name} is missing.`) }
  }
  for (const name of actualNames.filter((name) => !files.has(name))) problems.push(`${name} is unexpected.`)
  return problems
}

export function formatIssues(issues: readonly PipelineIssue[]): string {
  return issues.map((issue) => `${issue.file}${issue.record ? ` [${issue.record}]` : ''} ${issue.path}: ${issue.message}`).join('\n')
}
