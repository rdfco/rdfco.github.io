import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const sharedCameraRoot = resolve('src/three/camera')
const sharedCameraFiles = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (/\.[jt]sx?$/.test(entry.name)) sharedCameraFiles.push(path)
  }
}

await walk(sharedCameraRoot)

const world = await readFile('src/three/scenes/fara/FaraWorld.tsx', 'utf8')
const rig = await readFile('src/three/scenes/fara/FaraCameraRig.tsx', 'utf8')
const adapter = await readFile(
  'src/three/scenes/fara/browser-scroll-adapter.ts',
  'utf8',
)
const violations = []

if (/CatmullRomCurve3|useFrame|useThree|camera\.lookAt/.test(world)) {
  violations.push('FaraWorld still owns camera runtime or path extraction')
}
if (!rig.includes("from '../../camera'")) {
  violations.push('FaraCameraRig must consume the public camera boundary')
}
if (!rig.includes("from './browser-scroll-adapter'")) {
  violations.push('FaraCameraRig does not consume the browser scroll adapter')
}
if (!adapter.includes('window.scrollY') || !adapter.includes('document.')) {
  violations.push('Browser scroll state is not isolated in the scene adapter')
}
for (const file of sharedCameraFiles) {
  const source = await readFile(file, 'utf8')
  if (/\b(?:window|document|scrollY|matchMedia)\b/.test(source)) {
    violations.push(`${file} reads browser or DOM state`)
  }
}

if (violations.length) {
  throw new Error(`Camera boundary validation failed:\n- ${violations.join('\n- ')}`)
}
console.log(
  `Camera boundaries valid: ${sharedCameraFiles.length} shared files are DOM-free; browser scroll state is scene-adapted.`,
)
