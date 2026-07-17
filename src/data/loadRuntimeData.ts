import runtimeInput from '../../data/generated/runtime.json'
import runtimeManifest from '../../data/generated/manifest.json'
import { loadRuntimeDataset, type RuntimeDataset } from './runtime'

export const BUNDLED_RUNTIME_DATASET_VERSION = runtimeManifest.datasetVersion

export function loadBundledRuntimeData(): Readonly<RuntimeDataset> {
  return loadRuntimeDataset(runtimeInput, BUNDLED_RUNTIME_DATASET_VERSION)
}
