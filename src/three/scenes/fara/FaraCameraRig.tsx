/* eslint-disable react-hooks/immutability -- R3F frame callbacks intentionally mutate Three.js objects. */
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { Object3D } from 'three'
import {
  curveFromMesh,
  curveFromNamedPoints,
  normalizedScrollProgress,
} from '../../camera'
import { readBrowserScrollMetrics } from './browser-scroll-adapter'
import { faraCameraConfig as config } from './camera-config'

interface FaraCameraRigProps {
  hero: Object3D
  chapter: Object3D
  mountains: Object3D
}

export function FaraCameraRig({
  hero,
  chapter,
  mountains,
}: FaraCameraRigProps) {
  const { camera } = useThree()
  const curves = useMemo(() => {
    mountains.updateWorldMatrix(true, true)
    chapter.updateWorldMatrix(true, true)
    return {
      mountainCamera: curveFromMesh(
        mountains,
        config.paths.mountainCameraMesh,
      ),
      mountainTarget: curveFromMesh(
        mountains,
        config.paths.mountainTargetMesh,
      ),
      chapterCamera: curveFromNamedPoints(
        chapter,
        config.paths.chapterCameraPrefix,
      ),
      chapterTarget: curveFromNamedPoints(
        chapter,
        config.paths.chapterTargetPrefix,
      ),
    }
  }, [chapter, mountains])

  useFrame(() => {
    const scroll = readBrowserScrollMetrics()
    const progress = normalizedScrollProgress(
      scroll.scrollTop,
      scroll.scrollHeight,
      scroll.viewportHeight,
    )
    const chapterProgress = Math.min(
      1,
      Math.max(
        0,
        (progress - config.progress.chapterOffset) /
          config.progress.chapterRange,
      ),
    )
    hero.visible = progress < config.visibility.heroEnd
    chapter.visible =
      progress >= config.visibility.chapterStart &&
      progress < config.visibility.chapterEnd

    const inChapter = chapterProgress > 0
    const cameraCurve = inChapter
      ? curves.chapterCamera
      : curves.mountainCamera
    const targetCurve = inChapter
      ? curves.chapterTarget
      : curves.mountainTarget
    const pathProgress = inChapter
      ? chapterProgress
      : Math.min(1, progress / config.progress.mountainRange)

    if (cameraCurve) camera.position.copy(cameraCurve.getPointAt(pathProgress))
    if (targetCurve) camera.lookAt(targetCurve.getPointAt(pathProgress))
    camera.updateProjectionMatrix()
  })

  return null
}
