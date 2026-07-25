export const carSceneDebug = {
  enabled: import.meta.env.DEV && import.meta.env.VITE_FARA_DEBUG_SCENE === 'true',
  helpers: {
    cameraPath: true,
    lookAtPath: true,
    chapterBounds: true,
    boundingBoxes: true,
    grid: true,
    scrollRanges: true,
    sceneNodes: true,
    fps: true,
  },
}
