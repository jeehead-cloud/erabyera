import { resolve, join } from 'node:path'
import { buildGeneratedFiles, formatIssues, loadSourceWorkspace, validateSourceWorkspace, writeGeneratedFiles } from './pipeline'

const root = resolve(process.cwd())
const result = validateSourceWorkspace(await loadSourceWorkspace(root))
if (!result.ok) { console.error(formatIssues(result.issues)); process.exitCode = 1 }
else { const files = buildGeneratedFiles(result.data); await writeGeneratedFiles(files, join(root, 'data', 'generated')); console.log(`Generated ${files.size} deterministic runtime files for ${result.data.datasetVersion}.`) }
