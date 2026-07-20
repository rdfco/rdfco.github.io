import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

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

const nativeOwnedRoots = ['src/native', 'src/sections', 'src/components']
const files = []
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (/\.[jt]sx?$/.test(entry.name)) files.push(path)
  }
}
for (const root of nativeOwnedRoots) await walk(root)

for (const file of files) {
  const source = await readFile(file, 'utf8')
  if (/\/data\/(?:content|footer|schema|siteData)/.test(source)) {
    violations.push(`${relative('.', file)} bypasses the public content boundary`)
  }
}

const expectedAdapters = new Map([
  ['src/data/siteData.js', '../content/site-data.js'],
  ['src/data/validateSiteData.js', '../content/validate-site-content.js'],
  ['src/data/content.ts', '../content/site-content'],
  ['src/data/footer.ts', '../content/footer-content'],
  ['src/data/schema.ts', '../content/site-content.schema'],
])
for (const [file, target] of expectedAdapters) {
  const source = await readFile(file, 'utf8')
  if (!source.includes(target)) violations.push(`${file} is not a compatibility adapter for ${target}`)
}

if (violations.length) throw new Error(`Content boundary validation failed:\n- ${violations.join('\n- ')}`)
console.log(
  `Content boundaries valid: ${registry.sources.length} owned sources, ${files.length} native-owned consumers, ${expectedAdapters.size} compatibility adapters.`,
)
