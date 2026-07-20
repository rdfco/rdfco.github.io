import { readFile, readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

const violations = []
const files = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (/\.[jt]sx?$/.test(entry.name)) files.push(path)
  }
}
for (const root of ['src/three/core', 'src/three/performance', 'src/three/types']) await walk(root)

const forbiddenImports = [
  /from ['"].*(?:components|content|data|features|native|pages|routes|scenes|sections|store)\//,
  /from ['"]react-router-dom['"]/,
]

for (const file of files) {
  const source = await readFile(file, 'utf8')
  for (const pattern of forbiddenImports) {
    if (pattern.test(source)) violations.push(`${relative('.', file)} crosses a Three.js foundation boundary`)
  }
  if (/document\.|window\.|querySelector|scrollY/.test(source)) {
    violations.push(`${relative('.', file)} owns browser or DOM state`)
  }
}

const nativeScene = await readFile('src/three/scenes/fara/FaraScene.tsx', 'utf8')
if (!nativeScene.includes("from '../../core'") || !nativeScene.includes('<ThreeCanvas')) {
  violations.push('FARA scene does not consume the shared Three.js Canvas boundary')
}
if (/from ['"]@react-three\/fiber['"]/.test(nativeScene) || /<Canvas/.test(nativeScene)) {
  violations.push('FARA scene still owns the R3F Canvas lifecycle')
}

const deferredBoundaries = [
  'src/three/materials/index.ts',
]
for (const file of deferredBoundaries) {
  const source = await readFile(file, 'utf8')
  if (!source.includes('export {}')) violations.push(`${file} was implemented before its approved milestone`)
}

if (violations.length) throw new Error(`Three.js foundation validation failed:\n- ${violations.join('\n- ')}`)
console.log(
  `Three.js foundations valid: ${files.length} shared files, one active Canvas consumer, and the remaining deferred boundary preserved.`,
)
