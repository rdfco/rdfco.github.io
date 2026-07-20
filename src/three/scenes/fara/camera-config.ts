export const faraCameraConfig = {
  paths: {
    mountainCameraMesh: 'CameraPath',
    mountainTargetMesh: 'TargetPath',
    chapterCameraPrefix: 'Camera.',
    chapterTargetPrefix: 'LookAt.',
  },
  visibility: {
    heroEnd: 0.13,
    chapterStart: 0.085,
    chapterEnd: 0.9,
  },
  progress: {
    mountainRange: 0.1,
    chapterOffset: 0.1,
    chapterRange: 0.78,
  },
} as const
