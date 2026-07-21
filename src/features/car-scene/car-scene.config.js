// Edit this file to art-direct the GLB scene. Changes appear after saving in `npm run dev`.
export const carSceneConfig = {
  model: {
    // Put GLB files under public/assets/models and select one here.
    url: '/assets/models/car/mclaren.glb',

    // Final size after the model is automatically centered and normalized.
    autoFitSize: 3.35,

    // [x, y, z]: negative x = left, positive x = right.
    position: [0, -1.1, 0],

    // Rotation in radians: [x, y, z].
    rotation: [0, -0.5, 0],

    shadows: {
      cast: true,
      receive: true,
    },
  },

  material: {
    color: '#f7f7f2',
    roughness: 0.43,
    metalness: 0.18,
  },

  camera: {
    fov: 33,
    near: 0.1,
    far: 100,

    // Camera moves from farPosition.z to nearPosition.z while the scene is visible.
    farPosition: [0, 0.15, 9.4],
    nearPosition: [0, 0.15, 4.9],
    lookAt: [0, -0.45, 0],
  },

  lights: {
    ambientIntensity: 2.2,
    key: {
      position: [4, 6, 5],
      intensity: 3.4,
    },
    fill: {
      position: [-5, 1, 2],
      intensity: 1.2,
    },
  },

  scroll: {
    // 0 = page top, 1 = page bottom.
    startAtPageProgress: 0.82,
    endAtPageProgress: 0.98,
  },

  renderer: {
    alpha: true,
    antialias: true,
    dpr: [1, 1.5],
  },
}
