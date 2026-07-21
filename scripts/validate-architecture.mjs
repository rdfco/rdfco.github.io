import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'

const root = resolve(process.cwd(), 'src')
const extensions = ['.ts', '.tsx', '.js', '.jsx']
const ignoredRoots = new Set(['js', 'navbar', 'data', 'sections'])
const files = []

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const absolute = resolve(directory, entry)
    const rel = relative(root, absolute).split(sep).join('/')
    if (statSync(absolute).isDirectory()) {
      if (!ignoredRoots.has(rel.split('/')[0]) && rel !== 'test') walk(absolute)
    } else if (extensions.includes(extname(entry)) && !/\.(test|spec)\.[jt]sx?$/.test(entry)) files.push(absolute)
  }
}

function resolveImport(source, specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null
  const base = specifier.startsWith('@/') ? resolve(root, specifier.slice(2)) : resolve(dirname(source), specifier)
  for (const candidate of [base, ...extensions.map(ext => `${base}${ext}`), ...extensions.map(ext => resolve(base, `index${ext}`))]) {
    if (existsSync(candidate) && !statSync(candidate).isDirectory()) return candidate
  }
  return null
}

walk(root)
const fileSet = new Set(files)
const graph = new Map(files.map(file => [file, []]))
const violations = []
const rel = file => relative(root, file).split(sep).join('/')
const importPattern = /(?:import|export)\s+(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g

for (const file of files) {
  const from = rel(file)
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(importPattern)) {
    const target = resolveImport(file, match[1] || match[2])
    if (!target || !fileSet.has(target)) continue
    graph.get(file).push(target)
    const to = rel(target)
    if ((from.startsWith('native/') || from.startsWith('features/') || from.startsWith('three/')) && /^(js|navbar)\//.test(to)) violations.push(`${from} imports legacy runtime ${to}`)
    if (/^(content|config)\//.test(from) && /^(app|routes|pages|layouts|features|components|native|three)\//.test(to)) violations.push(`${from} imports higher-level ${to}`)
    if (from.startsWith('components/') && from !== 'components/LegacySite.jsx' && /^(routes|pages|content)\//.test(to)) violations.push(`${from} imports owned module ${to}; pass data/state through props`)
    if (from.startsWith('three/') && /^(pages|content|components|navbar|js)\//.test(to)) violations.push(`${from} imports non-scene concern ${to}`)
    if (from.startsWith('utils/') && /^(features|pages)\//.test(to)) violations.push(`${from} imports consumer ${to}`)
    const fromFeature = from.match(/^features\/([^/]+)\/(.+)/)
    const toFeature = to.match(/^features\/([^/]+)\/(.+)/)
    if (fromFeature && toFeature && fromFeature[1] !== toFeature[1] && !/^features\/[^/]+\/index\.[jt]s$/.test(to)) violations.push(`${from} bypasses feature public API ${to}`)
  }
  if (/^(native|features|three|components)\//.test(from) && /document\.querySelector|document\.querySelectorAll|\.innerHTML\s*=/.test(source)) violations.push(`${from} introduces global DOM mutation/query`)
}

const visiting = new Set()
const visited = new Set()
function visit(file, stack = []) {
  if (visiting.has(file)) {
    const start = stack.indexOf(file)
    violations.push(`circular dependency: ${stack.slice(start).concat(file).map(rel).join(' -> ')}`)
    return
  }
  if (visited.has(file)) return
  visiting.add(file)
  for (const dependency of graph.get(file) || []) visit(dependency, [...stack, file])
  visiting.delete(file)
  visited.add(file)
}
files.forEach(file => visit(file))

if (violations.length) {
  console.error(`Architecture validation failed (${violations.length}):\n- ${[...new Set(violations)].join('\n- ')}`)
  process.exit(1)
}
console.log(`Architecture validation passed (${files.length} runtime modules checked).`)
