import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative, sep } from 'node:path'

const registry = JSON.parse(await readFile('src/assets/asset-registry.json', 'utf8'))
const publicAssetRoot = 'public/assets'
const physicalPaths = new Set()
const violations = []

async function walk(directory, test, found = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path, test, found)
    else if (test(entry.name)) found.push(path)
  }
  return found
}

for (const file of await walk(publicAssetRoot, name => name !== 'README.md')) {
  physicalPaths.add(`/${relative('public', file).split(sep).join('/')}`)
}

const ids = new Set()
const paths = new Set()
const extensionsByKind = {
  model: new Set(['.glb']),
  texture: new Set(['.webp']),
  environment: new Set(['.exr']),
  font: new Set(['.woff2', '.otf']),
  audio: new Set(['.mp3']),
  image: new Set(['.png', '.svg', '.webp']),
}
const placements = new Set(['pinned', 'movable'])

for (const asset of registry.assets) {
  if (ids.has(asset.id)) violations.push(`duplicate id: ${asset.id}`)
  if (paths.has(asset.path)) violations.push(`duplicate path: ${asset.path}`)
  ids.add(asset.id)
  paths.add(asset.path)

  for (const field of ['id', 'path', 'kind', 'scope', 'lifecycle', 'owner', 'provenance', 'approval', 'placement']) {
    if (!asset[field]) violations.push(`${asset.id || asset.path}: missing ${field}`)
  }
  if (asset.placement && !placements.has(asset.placement)) {
    violations.push(`${asset.id}: placement must be one of ${[...placements].join(', ')}`)
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

const readAll = async files => {
  let combined = ''
  for (const file of files) combined += `\n${await readFile(file, 'utf8')}`
  return combined
}

/*
 * `placement` is not a label anyone maintains by hand - it is recomputed here
 * from who actually names the asset. An asset addressed from a generated or
 * protected file is pinned: its URL is a contract we cannot rewrite, so the
 * file cannot be moved or renamed. Everything else is only named by our own
 * source, so it can be reorganised freely. If that ever stops matching the
 * registry - because the generated runtime changed, or someone moved a pinned
 * file - this fails rather than letting the map go quietly out of date.
 */
const pinnedConsumers = await readAll([
  ...(await walk('public/_astro', name => /\.(?:js|css)$/.test(name))),
  'public/legacy/main/index.html',
  'public/runtime/webgl-color-loader.js',
  'public/runtime/route-bridge.js',
])

for (const asset of registry.assets) {
  const expected = pinnedConsumers.includes(asset.path) ? 'pinned' : 'movable'
  if (asset.placement !== expected) {
    violations.push(`${asset.id}: placement is "${asset.placement}" but its consumers make it "${expected}"`)
  }
}

const sourceFiles = ['index.html', ...(await walk('src', name => /\.(?:[cm]?[jt]sx?|css|html)$/.test(name)))]
const referencedPaths = new Set()
for (const file of sourceFiles) {
  const source = (await readFile(file, 'utf8'))
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
  for (const match of source.matchAll(/\/assets\/[^'"`)\s]+/g)) {
    referencedPaths.add(match[0].split('?')[0])
  }
}
for (const path of referencedPaths) {
  if (!paths.has(path)) violations.push(`source reference is not registered: ${path}`)
}

if (violations.length) throw new Error(`Asset registry validation failed:\n- ${violations.join('\n- ')}`)

const pinned = registry.assets.filter(asset => asset.placement === 'pinned').length
console.log(
  `Asset registry valid: ${registry.assets.length} records, ${physicalPaths.size} physical files, ` +
  `${referencedPaths.size} source references, ${pinned} pinned by the generated runtime.`,
)
