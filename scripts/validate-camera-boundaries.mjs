import fs from 'node:fs'

const world = fs.readFileSync('src/three/scenes/fara/FaraWorld.tsx', 'utf8')
const rig = fs.readFileSync('src/three/scenes/fara/FaraCameraRig.tsx', 'utf8')

if (/CatmullRomCurve3|useFrame|useThree|camera\.lookAt/.test(world)) {
  throw new Error('FaraWorld still owns camera runtime or path extraction')
}
if (!rig.includes("from '../../camera'")) {
  throw new Error('FaraCameraRig must consume the public camera boundary')
}

console.log('Camera runtime and path boundaries validated.')
