import { resolve, join } from 'node:path'
import { buildGeneratedFiles, compareGeneratedFiles, formatIssues, loadSourceWorkspace, validateSourceWorkspace } from './pipeline'

const root = resolve(process.cwd())
const result = validateSourceWorkspace(await loadSourceWorkspace(root))
if (!result.ok) { console.error(formatIssues(result.issues)); process.exitCode = 1 }
else { const problems = await compareGeneratedFiles(buildGeneratedFiles(result.data), join(root, 'data', 'generated')); if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1 } else console.log(`Generated data is current for ${result.data.datasetVersion}.`) }
