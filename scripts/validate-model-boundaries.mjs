import { readFile } from 'node:fs/promises'
import registry from '../src/assets/asset-registry.json' with { type: 'json' }

const models = registry.assets.filter(asset => asset.kind === 'model')
const world = await readFile('src/three/scenes/fara/FaraWorld.tsx', 'utf8')
const violations = []
if (models.length !== 15) violations.push(`expected 15 registered models, found ${models.length}`)
if (!world.includes('useRegisteredGLTF') || !world.includes('faraModelIds')) {
  violations.push('FaraWorld bypasses the model registry/loader boundary')
}
if (/useGLTF|assetRegistry/.test(world.replace(/useRegisteredGLTF/g, ''))) {
  violations.push('FaraWorld still owns raw model loading or asset paths')
}
if (violations.length) throw new Error(`Model boundary validation failed:\n- ${violations.join('\n- ')}`)
console.log(`Model boundaries valid: ${models.length} registered models and FARA loader consumer passed.`)
