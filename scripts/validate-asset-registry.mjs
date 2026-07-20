import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative, sep } from 'node:path'

const registry = JSON.parse(await readFile('src/assets/asset-registry.json', 'utf8'))
const publicAssetRoot = 'public/assets'
const physicalPaths = new Set(['/Fara-Logo0Small.png'])
const violations = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (entry.name !== 'README.md') {
      physicalPaths.add(`/${relative('public', path).split(sep).join('/')}`)
    }
  }
}
await walk(publicAssetRoot)

const ids = new Set()
const paths = new Set()
const extensionsByKind = {
  model: new Set(['.glb']),
  texture: new Set(['.webp']),
  environment: new Set(['.exr']),
  font: new Set(['.woff2', '.otf']),
  audio: new Set(['.mp3']),
  image: new Set(['.png']),
}

for (const asset of registry.assets) {
  if (ids.has(asset.id)) violations.push(`duplicate id: ${asset.id}`)
  if (paths.has(asset.path)) violations.push(`duplicate path: ${asset.path}`)
  ids.add(asset.id)
  paths.add(asset.path)

  for (const field of ['id', 'path', 'kind', 'scope', 'lifecycle', 'owner', 'provenance', 'approval']) {
    if (!asset[field]) violations.push(`${asset.id || asset.path}: missing ${field}`)
  }
  if (!Array.isArray(asset.consumers) || asset.consumers.length === 0) {
    violations.push(`${asset.id}: consumers must name at least one owner or boundary`)
  }
  if (typeof asset.preload !== 'boolean') violations.push(`${asset.id}: preload must be boolean`)
  if (!extensionsByKind[asset.kind]?.has(extname(asset.path).toLowerCase())) {
    violations.push(`${asset.id}: extension does not match kind ${asset.kind}`)
  }
}

for (const path of physicalPaths) {
  if (!paths.has(path)) violations.push(`unregistered physical asset: ${path}`)
}
for (const path of paths) {
  if (!physicalPaths.has(path)) violations.push(`registered asset is missing: ${path}`)
}

const sourceFiles = ['index.html']
async function collectSource(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await collectSource(path)
    else if (/\.(?:[cm]?[jt]sx?|css|html)$/.test(entry.name)) sourceFiles.push(path)
  }
}
await collectSource('src')

const referencedPaths = new Set()
for (const file of sourceFiles) {
  const source = (await readFile(file, 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
  for (const match of source.matchAll(/\/assets\/[^'"`)\s]+|\/Fara-Logo0Small\.png(?:\?[^'"`)\s]+)?/g)) {
    referencedPaths.add(match[0].split('?')[0])
  }
}
for (const path of referencedPaths) {
  if (!paths.has(path)) violations.push(`source reference is not registered: ${path}`)
}

if (violations.length) throw new Error(`Asset registry validation failed:\n- ${violations.join('\n- ')}`)
console.log(
  `Asset registry valid: ${registry.assets.length} records, ${physicalPaths.size} physical files, ${referencedPaths.size} source references.`,
)
