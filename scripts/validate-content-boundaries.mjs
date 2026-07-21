import { readFile, stat } from 'node:fs/promises'

const violations = []
const registry = JSON.parse(await readFile('src/content/content-sources.json', 'utf8'))

for (const source of registry.sources) {
  if (!source.path || !source.ownership || !Array.isArray(source.consumers) || source.consumers.length === 0) {
    violations.push(`invalid content source record: ${JSON.stringify(source)}`)
    continue
  }
  try {
    await stat(source.path)
  } catch {
    violations.push(`registered content source is missing: ${source.path}`)
  }
}

const paths = registry.sources.map(source => source.path)
if (new Set(paths).size !== paths.length) violations.push('content source registry contains duplicate paths')

if (violations.length) throw new Error(`Content boundary validation failed:\n- ${violations.join('\n- ')}`)
console.log(`Content boundaries valid: ${registry.sources.length} owned production sources.`)
