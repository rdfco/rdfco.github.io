import { readFile } from 'node:fs/promises'

const registry = await readFile('src/three/scenes/scene-registry.ts', 'utf8')
const native = await readFile('src/native/NativeApp.tsx', 'utf8')
const violations = []
if (!registry.includes("id: 'fara'") || !registry.includes("import('./fara/FaraScene')")) {
  violations.push('FARA scene is not registered')
}
if (!native.includes('lazy(sceneRegistry.fara.load)')) violations.push('NativeApp bypasses scene registry')
for (const [file, target] of [
  ['src/native/FaraScene.tsx', '../three/scenes/fara/FaraScene'],
  ['src/scenes/fara/FaraLegacyScene.tsx', '../../three/scenes/fara/FaraWorld'],
  ['src/scenes/backgroundColors.ts', '../three/scenes/fara/background-colors'],
]) {
  if (!(await readFile(file, 'utf8')).includes(target)) violations.push(`${file} is not a compatibility adapter`)
}
if (violations.length) throw new Error(`Scene boundary validation failed:\n- ${violations.join('\n- ')}`)
console.log('Scene boundaries valid: registry, colocated FARA ownership, and compatibility adapters passed.')
