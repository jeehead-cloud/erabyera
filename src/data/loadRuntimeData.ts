import runtimeInput from '../../data/generated/runtime.json'
import runtimeManifest from '../../data/generated/manifest.json'
import searchIndexInput from '../../data/generated/search-index.json'
import { loadRuntimeDataset, type RuntimeDataset } from './runtime'
import { loadSearchIndex, type SearchIndex } from '../domain/search/searchSchemas'

export const BUNDLED_RUNTIME_DATASET_VERSION = runtimeManifest.datasetVersion

export function loadBundledRuntimeData(): Readonly<RuntimeDataset> {
  return loadRuntimeDataset(runtimeInput, BUNDLED_RUNTIME_DATASET_VERSION)
}

export function loadBundledSearchIndex(): Readonly<SearchIndex> {
  return loadSearchIndex(searchIndexInput, BUNDLED_RUNTIME_DATASET_VERSION)
}
