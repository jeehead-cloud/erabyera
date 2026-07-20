import runtimeInput from '../../data/generated/runtime.json'
import runtimeManifest from '../../data/generated/manifest.json'
import searchIndexInput from '../../data/generated/search-index.json'
import { loadRuntimeDataset, type RuntimeDataset } from './runtime'
import { loadSearchIndex, type SearchIndex } from '../domain/search/searchSchemas'

export const BUNDLED_RUNTIME_DATASET_VERSION = runtimeManifest.datasetVersion

let bundledRuntimeData: Readonly<RuntimeDataset> | undefined
let bundledSearchIndex: Readonly<SearchIndex> | undefined

export function loadBundledRuntimeData(): Readonly<RuntimeDataset> {
  bundledRuntimeData ??= loadRuntimeDataset(runtimeInput, BUNDLED_RUNTIME_DATASET_VERSION)
  return bundledRuntimeData
}

export function loadBundledSearchIndex(): Readonly<SearchIndex> {
  bundledSearchIndex ??= loadSearchIndex(searchIndexInput, BUNDLED_RUNTIME_DATASET_VERSION)
  return bundledSearchIndex
}
