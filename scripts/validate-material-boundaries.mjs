import { access, readFile, readdir } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = resolve(
  root,
  'src/three/scenes/fara/materials/shader-manifest.json',
)
const manifestDirectory = dirname(manifestPath)
const sceneShaderRoot = resolve(root, 'src/three/scenes/fara/shaders')
const recoveredShaderRoot = resolve(root, 'src/scenes/shaders/legacy')
const validStatuses = new Set(['active', 'archived', 'unused'])
const violations = []

async function shaderFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...await shaderFiles(path))
    else if (/\.(?:vert|frag)$/.test(entry.name)) files.push(path)
  }
  return files
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const world = await readFile(
  resolve(root, 'src/three/scenes/fara/FaraWorld.tsx'),
  'utf8',
)
const material = await readFile(
  resolve(root, 'src/three/scenes/fara/materials/useRecoveredMaterials.ts'),
  'utf8',
)
const library = await readFile(
  resolve(root, 'src/three/scenes/fara/materials/shader-library.ts'),
  'utf8',
)
const adapter = await readFile(
  resolve(root, 'src/scenes/materials/useRecoveredMaterials.ts'),
  'utf8',
)

if (!Array.isArray(manifest) || manifest.length === 0) {
  violations.push('Shader manifest must be a non-empty array')
}
if (!world.includes("from './materials/useRecoveredMaterials'")) {
  violations.push('FaraWorld bypasses its scene-owned material boundary')
}
if (!material.includes("from '../../../materials'")) {
  violations.push('FARA materials bypass the shared material factory')
}
if (/scenes\/shaders\/legacy/.test(material)) {
  violations.push('An active FARA material still imports a Legacy shader path')
}
if (!library.includes("from './shader-manifest.json'")) {
  violations.push('Shader library does not consume the canonical manifest')
}
if (!adapter.includes('three/scenes/fara/materials/useRecoveredMaterials')) {
  violations.push('The previous material path is not a compatibility adapter')
}

const names = new Set()
const registeredFiles = new Set()
for (const shader of manifest) {
  if (!shader.name || names.has(shader.name)) {
    violations.push(`Shader name is missing or duplicated: ${shader.name}`)
  }
  names.add(shader.name)
  if (!validStatuses.has(shader.status)) {
    violations.push(`${shader.name} has invalid status: ${shader.status}`)
  }
  if (!shader.owner || !shader.provenance) {
    violations.push(`${shader.name} lacks owner or provenance`)
  }

  for (const sourceKey of ['vertex', 'fragment']) {
    const sourcePath = resolve(manifestDirectory, shader[sourceKey])
    registeredFiles.add(sourcePath.toLowerCase())
    try {
      await access(sourcePath)
    } catch {
      violations.push(`${shader.name} has missing ${sourceKey} source`)
    }
    const sceneRelativePath = relative(sceneShaderRoot, sourcePath)
    if (
      shader.status === 'active' &&
      (sceneRelativePath.startsWith('..') || isAbsolute(sceneRelativePath))
    ) {
      violations.push(`${shader.name} is active but is not colocated with FARA`)
    }
  }
}

const physicalFiles = [
  ...await shaderFiles(sceneShaderRoot),
  ...await shaderFiles(recoveredShaderRoot),
]
for (const file of physicalFiles) {
  if (!registeredFiles.has(file.toLowerCase())) {
    violations.push(
      `Recovered shader source is absent from manifest: ${relative(root, file)}`,
    )
  }
}
for (const file of registeredFiles) {
  if (!physicalFiles.some((physical) => physical.toLowerCase() === file)) {
    violations.push(`Manifest source is outside managed shader roots: ${file}`)
  }
}

if (violations.length) {
  throw new Error(
    `Material boundary validation failed:\n- ${violations.join('\n- ')}`,
  )
}

const statusCounts = Object.groupBy(manifest, (shader) => shader.status)
console.log(
  `Material boundaries valid: ${manifest.length} recovered shaders; ` +
  `${statusCounts.active?.length ?? 0} active, ` +
  `${statusCounts.archived?.length ?? 0} archived, ` +
  `${statusCounts.unused?.length ?? 0} unused.`,
)
