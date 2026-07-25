import { carSceneAssets } from './assets'
import { carSceneCamera } from './camera'
import { carSceneDebug } from './debug'
import { carScenePerformance } from './performance'
import { carSceneScroll } from './scroll'

export const carSceneConfig = {
  assets: carSceneAssets,
  camera: carSceneCamera,
  debug: carSceneDebug,
  performance: carScenePerformance,
  scroll: carSceneScroll,
  model: {
    scale: 3.35,
    basePosition: [0, -1.1, 0],
    rotation: [0, -0.5, 0],
    dragBounds: [-5, 5],
    dragSensitivity: 0.012,
  },
  material: {
    color: '#f7f7f2',
    roughness: 0.43,
    metalness: 0.18,
  },
  lights: {
    ambient: { intensity: 2.2 },
    key: { position: [4, 6, 5], intensity: 3.4 },
    fill: { position: [-5, 1, 2], intensity: 1.2 },
  },
}
