import { access, readFile } from 'node:fs/promises'

const world = await readFile('src/three/scenes/fara/FaraWorld.tsx', 'utf8')
const material = await readFile(
  'src/three/scenes/fara/materials/useRecoveredMaterials.ts',
  'utf8',
)
const adapter = await readFile(
  'src/scenes/materials/useRecoveredMaterials.ts',
  'utf8',
)
const manifestSource = await readFile(
  'src/three/scenes/fara/materials/shader-manifest.ts',
  'utf8',
)
const shaderNames = [
  'EnergyBg',
  'EnergyCone',
  'Glow',
  'PowerLine',
  'Holograms',
  'Grid',
  'Line',
]

const violations = []
if (!world.includes("from './materials/useRecoveredMaterials'")) {
  violations.push('FaraWorld bypasses its scene-owned material boundary')
}
if (!material.includes("from '../../../materials'")) {
  violations.push('FARA materials bypass the shared material factory')
}
if (!adapter.includes('three/scenes/fara/materials/useRecoveredMaterials')) {
  violations.push('The previous material path is not a compatibility adapter')
}
for (const name of shaderNames) {
  if (!manifestSource.includes(`'${name}'`)) {
    violations.push(`Shader manifest omits ${name}`)
  }
  for (const extension of ['vert', 'frag']) {
    try {
      await access(`src/scenes/shaders/legacy/${name}/${name}.${extension}`)
    } catch {
      violations.push(`Missing recovered shader: ${name}.${extension}`)
    }
  }
}

if (violations.length) {
  throw new Error(`Material boundary validation failed:\n- ${violations.join('\n- ')}`)
}
console.log(
  `Material boundaries valid: ${shaderNames.length} shader pairs have explicit scene ownership.`,
)
