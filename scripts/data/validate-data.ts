import { resolve } from 'node:path'
import { formatIssues, loadSourceWorkspace, validateSourceWorkspace } from './pipeline'

const root = resolve(process.cwd())
const result = validateSourceWorkspace(await loadSourceWorkspace(root))
if (!result.ok) { console.error(formatIssues(result.issues)); process.exitCode = 1 }
else console.log(`Validated ${result.data.datasetVersion}: ${Object.values(result.data).filter(Array.isArray).reduce((sum, records) => sum + records.length, 0)} records.`)
