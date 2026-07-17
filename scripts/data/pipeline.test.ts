import { mkdtemp, rm, writeFile, mkdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { beforeAll, describe, expect, it } from 'vitest'
import { loadRuntimeDataset } from '../../src/data'
import {
  DATA_KINDS,
  buildGeneratedFiles,
  compareGeneratedFiles,
  loadSourceWorkspace,
  validateSourceWorkspace,
  writeGeneratedFiles,
  type DataKind,
  type RawWorkspace,
} from './pipeline'

let baseline: RawWorkspace
const root = resolve(process.cwd())

beforeAll(async () => { baseline = await loadSourceWorkspace(root) })

const copy = () => structuredClone(baseline)
const records = (workspace: RawWorkspace, kind: DataKind) =>
  (workspace.records[kind].value as { records: Record<string, unknown>[] }).records
const validData = () => {
  const result = validateSourceWorkspace(copy())
  if (!result.ok) throw new Error(JSON.stringify(result.issues))
  return result.data
}
const expectInvalid = (workspace: RawWorkspace, text: string) => {
  const result = validateSourceWorkspace(workspace)
  expect(result.ok).toBe(false)
  if (!result.ok) expect(result.issues.map((x) => `${x.path} ${x.message}`).join('\n')).toContain(text)
}

describe('source wrapper and schema validation', () => {
  it('accepts the canonical synthetic workspace', () => expect(validateSourceWorkspace(copy()).ok).toBe(true))
  it('rejects a descriptor unknown field', () => { const w = copy(); (w.descriptor as Record<string, unknown>).extra = true; expectInvalid(w, 'Unrecognized key') })
  it('rejects a descriptor schema version mismatch', () => { const w = copy(); (w.descriptor as Record<string, unknown>).schemaVersion = 2; expectInvalid(w, 'Invalid input') })
  it('rejects a wrapper dataset version mismatch', () => { const w = copy(); (w.records.places.value as Record<string, unknown>).datasetVersion = 'other-1.0.0'; expectInvalid(w, 'does not match') })
  it('rejects an invalid dataset version format', () => { const w = copy(); (w.records.places.value as Record<string, unknown>).datasetVersion = 'BAD'; expectInvalid(w, 'lowercase name') })
  it('aggregates independent schema failures', () => { const w = copy(); records(w, 'places')[0].defaultName = ''; records(w, 'people')[0].importance = 99; const r = validateSourceWorkspace(w); expect(r.ok).toBe(false); if (!r.ok) expect(r.issues.length).toBeGreaterThanOrEqual(2) })
  it.each(DATA_KINDS)('rejects unknown record fields in %s', (kind) => { const w = copy(); records(w, kind)[0].unexpected = true; expectInvalid(w, kind === 'events' ? 'Invalid input' : 'Unrecognized key') })
  it('rejects duplicate IDs globally across types', () => { const w = copy(); records(w, 'people')[0].id = 'synthetic-alpha-place'; expectInvalid(w, 'Duplicate global entity ID') })
  it('rejects duplicate IDs within one type', () => { const w = copy(); records(w, 'sources').push(structuredClone(records(w, 'sources')[0])); expectInvalid(w, 'Duplicate global entity ID') })
})

describe('cross-record references and overlap policy', () => {
  it('rejects a missing source reference', () => { const w = copy(); ((records(w, 'places')[0].sourceRefs as Record<string, unknown>[])[0]).sourceId = 'missing-source'; expectInvalid(w, 'Missing source reference') })
  it('rejects a missing nested stage source reference', () => { const w = copy(); const stage = (records(w, 'journeys')[0].stages as Record<string, unknown>[])[0]; ((stage.sourceRefs as Record<string, unknown>[])[0]).sourceId = 'missing-source'; expectInvalid(w, 'Missing source reference') })
  it('rejects a missing ownership polity', () => { const w = copy(); ((records(w, 'places')[0].ownership as Record<string, unknown>[])[0]).polityId = 'missing-polity'; expectInvalid(w, 'Missing polity reference') })
  it('rejects a missing capital place', () => { const w = copy(); ((records(w, 'polities')[0].capitals as Record<string, unknown>[])[0]).placeId = 'missing-place'; expectInvalid(w, 'Missing place reference') })
  it('rejects a missing ruler person', () => { const w = copy(); ((records(w, 'polities')[0].rulers as Record<string, unknown>[])[0]).personId = 'missing-person'; expectInvalid(w, 'Missing person reference') })
  it('rejects a missing territory polity', () => { const w = copy(); records(w, 'territories')[0].polityId = 'missing-polity'; expectInvalid(w, 'Missing polity reference') })
  it('rejects a missing person place', () => { const w = copy(); ((records(w, 'people')[0].places as Record<string, unknown>[])[0]).placeId = 'missing-place'; expectInvalid(w, 'Missing place reference') })
  it('rejects a missing person polity', () => { const w = copy(); records(w, 'people')[0].associatedPolityIds = ['missing-polity']; expectInvalid(w, 'Missing polity reference') })
  it('rejects missing event participants', () => { const w = copy(); records(w, 'events')[0].participantPersonIds = ['missing-person']; expectInvalid(w, 'Missing person reference') })
  it('rejects missing battle side links', () => { const w = copy(); const battle = records(w, 'events')[1]; const details = battle.battle as Record<string, unknown>; const side = (details.sides as Record<string, unknown>[])[0]; side.commanderIds = ['missing-person']; expectInvalid(w, 'Missing person reference') })
  it('rejects a missing journey stage event', () => { const w = copy(); ((records(w, 'journeys')[0].stages as Record<string, unknown>[])[1]).eventId = 'missing-event'; expectInvalid(w, 'Missing event reference') })
  it('rejects a missing collection link', () => { const w = copy(); const links = records(w, 'collections')[0].linkedEntities as Record<string, unknown>; links.journeyIds = ['missing-journey']; expectInvalid(w, 'Missing journey reference') })
  it.each(['names', 'ownership', 'importance'] as const)('rejects overlapping place %s', (field) => { const w = copy(); const list = records(w, 'places')[0][field] as Record<string, unknown>[]; list.push(structuredClone(list[0])); expectInvalid(w, 'Overlapping periods') })
  it('rejects overlapping polity capitals', () => { const w = copy(); const list = records(w, 'polities')[0].capitals as Record<string, unknown>[]; list.push(structuredClone(list[0])); expectInvalid(w, 'Overlapping periods') })
})

describe('GeoJSON integrity', () => {
  const territoryFeatures = (w: RawWorkspace) => (w.territoryGeometry.value as { features: Record<string, unknown>[] }).features
  const journeyFeatures = (w: RawWorkspace) => (w.journeyGeometry.value as { features: Record<string, unknown>[] }).features
  it('rejects an unclosed polygon ring', () => { const w = copy(); const geometry = territoryFeatures(w)[0].geometry as Record<string, unknown>; geometry.coordinates = [[[9, 9], [12, 9], [12, 12], [9, 12]]]; expectInvalid(w, 'closed') })
  it('rejects too-short polygon rings', () => { const w = copy(); const geometry = territoryFeatures(w)[0].geometry as Record<string, unknown>; geometry.coordinates = [[[9, 9], [12, 9], [9, 9]]]; expectInvalid(w, '>=4') })
  it('rejects out-of-bounds coordinates', () => { const w = copy(); const geometry = territoryFeatures(w)[0].geometry as Record<string, unknown>; geometry.coordinates = [[[999, 9], [12, 9], [12, 12], [999, 9]]]; expectInvalid(w, 'Too big') })
  it('rejects a too-short journey line', () => { const w = copy(); const geometry = journeyFeatures(w)[0].geometry as Record<string, unknown>; geometry.coordinates = [[10, 10]]; expectInvalid(w, '>=2') })
  it('rejects duplicate territory feature IDs', () => { const w = copy(); territoryFeatures(w).push(structuredClone(territoryFeatures(w)[0])); expectInvalid(w, 'Duplicate geometry feature ID') })
  it('rejects missing territory metadata links', () => { const w = copy(); records(w, 'territories')[0].geometryFeatureId = 'missing-feature'; expectInvalid(w, 'Missing territory geometry feature') })
  it('rejects missing journey metadata links', () => { const w = copy(); records(w, 'journeys')[0].geometryFeatureId = 'missing-feature'; expectInvalid(w, 'Missing journey geometry feature') })
  it('rejects a feature pointing to a missing record', () => { const w = copy(); const properties = territoryFeatures(w)[0].properties as Record<string, unknown>; properties.territoryPeriodId = 'missing-territory'; expectInvalid(w, 'Missing territory reference') })
})

describe('deterministic generation and browser-safe loading', () => {
  it('filters draft records from public runtime data', () => { const runtime = JSON.parse(buildGeneratedFiles(validData()).get('runtime.json') ?? '{}') as { places: { id: string }[] }; expect(runtime.places.map((x) => x.id)).not.toContain('synthetic-draft-place') })
  it('generates byte-identical files repeatedly', () => expect([...buildGeneratedFiles(validData())]).toEqual([...buildGeneratedFiles(validData())]))
  it('emits no timestamps', () => expect([...buildGeneratedFiles(validData()).values()].join('\n')).not.toMatch(/generatedAt|createdAt/))
  it('includes counts and a SHA-256 fingerprint in the manifest', () => { const manifest = JSON.parse(buildGeneratedFiles(validData()).get('manifest.json') ?? '{}') as { fingerprint: { value: string }; counts: Record<string, number> }; expect(manifest.fingerprint.value).toMatch(/^[a-f0-9]{64}$/); expect(manifest.counts.places).toBe(1) })
  it('builds a stable reference index', () => { const index = JSON.parse(buildGeneratedFiles(validData()).get('index.json') ?? '{}') as { records: { id: string }[] }; expect(index.records.map((x) => x.id)).toEqual([...index.records.map((x) => x.id)].sort()) })
  it('loads and freezes valid runtime data', () => { const raw = JSON.parse(buildGeneratedFiles(validData()).get('runtime.json') ?? '{}'); const loaded = loadRuntimeDataset(raw, 'foundation-fixture-0.1.0'); expect(Object.isFrozen(loaded)).toBe(true); expect(Object.isFrozen(loaded.places)).toBe(true) })
  it('rejects an unexpected runtime dataset version', () => { const raw = JSON.parse(buildGeneratedFiles(validData()).get('runtime.json') ?? '{}'); expect(() => loadRuntimeDataset(raw, 'other-1.0.0')).toThrow('version mismatch') })
  it('rejects malformed runtime data', () => expect(() => loadRuntimeDataset({ schemaVersion: 1 })).toThrow())
  it('detects missing, stale, and unexpected generated files without changing them', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'erabyera-data-test-'))
    try {
      const files = buildGeneratedFiles(validData())
      expect(await compareGeneratedFiles(files, dir)).toContain('runtime.json is missing.')
      await writeGeneratedFiles(files, dir)
      await writeFile(join(dir, 'runtime.json'), '{}\n', 'utf8')
      await writeFile(join(dir, 'extra.json'), '{}\n', 'utf8')
      const before = await readFile(join(dir, 'runtime.json'), 'utf8')
      const problems = await compareGeneratedFiles(files, dir)
      expect(problems).toContain('runtime.json is stale.')
      expect(problems).toContain('extra.json is unexpected.')
      expect(await readFile(join(dir, 'runtime.json'), 'utf8')).toBe(before)
    } finally { await rm(dir, { recursive: true, force: true }) }
  })
  it('creates the generated directory when building', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'erabyera-build-test-'))
    const nested = join(dir, 'generated')
    try { await mkdir(dir, { recursive: true }); await writeGeneratedFiles(buildGeneratedFiles(validData()), nested); expect(await readFile(join(nested, 'manifest.json'), 'utf8')).toContain('fingerprint') }
    finally { await rm(dir, { recursive: true, force: true }) }
  })
})
