import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, MeshStandardMaterial, Vector3 } from 'three'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { carSceneConfig } from './car-scene.config'

const clamp = value => Math.min(1, Math.max(0, value))
useGLTF.preload(carSceneConfig.model.url)

function WhiteCar({ onReady }) {
  const gltf = useGLTF(carSceneConfig.model.url)
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true)
    const bounds = new Box3().setFromObject(clone)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const fit = carSceneConfig.model.autoFitSize / Math.max(size.x, size.y, size.z, 1)
    const [offsetX, offsetY, offsetZ] = carSceneConfig.model.position
    clone.position.set(
      -center.x * fit + offsetX,
      -center.y * fit + offsetY,
      -center.z * fit + offsetZ,
    )
    clone.scale.setScalar(fit)
    clone.traverse(node => {
      if (!node.isMesh) return
      node.material = new MeshStandardMaterial(carSceneConfig.material)
      node.castShadow = carSceneConfig.model.shadows.cast
      node.receiveShadow = carSceneConfig.model.shadows.receive
    })
    return clone
  }, [gltf.scene])

  useEffect(() => onReady(), [onReady])

  return <primitive object={scene} rotation={carSceneConfig.model.rotation} />
}

function CameraPosition({ progress }) {
  const { camera, invalidate } = useThree()

  useLayoutEffect(() => {
    const far = carSceneConfig.camera.farPosition
    const near = carSceneConfig.camera.nearPosition
    camera.position.set(
      far[0] + (near[0] - far[0]) * progress,
      far[1] + (near[1] - far[1]) * progress,
      far[2] + (near[2] - far[2]) * progress,
    )
    camera.lookAt(...carSceneConfig.camera.lookAt)
    invalidate()
  }, [camera, invalidate, progress])

  return null
}

export function CarSceneOverlay({ frameRef, enabled }) {
  const [progress, setProgress] = useState(0)
  const [modelReady, setModelReady] = useState(false)
  const markModelReady = useCallback(() => setModelReady(true), [])

  useEffect(() => {
    if (!enabled) return undefined
    const frameWindow = frameRef.current?.contentWindow
    if (!frameWindow) return undefined
    let animationFrame = 0
    const readProgress = () => {
      animationFrame = 0
      const maximum = Math.max(1, frameWindow.document.documentElement.scrollHeight - frameWindow.innerHeight)
      const pageProgress = frameWindow.scrollY / maximum
      const sceneProgress = clamp(
        (pageProgress - carSceneConfig.scroll.startAtPageProgress)
        / (carSceneConfig.scroll.endAtPageProgress - carSceneConfig.scroll.startAtPageProgress),
      )
      setProgress(current => Math.abs(current - sceneProgress) < 0.001 ? current : sceneProgress)
    }
    const update = () => {
      if (!animationFrame) animationFrame = frameWindow.requestAnimationFrame(readProgress)
    }
    update()
    frameWindow.addEventListener('scroll', update, { passive: true })
    frameWindow.addEventListener('resize', update)
    return () => {
      if (animationFrame) frameWindow.cancelAnimationFrame(animationFrame)
      frameWindow.removeEventListener('scroll', update)
      frameWindow.removeEventListener('resize', update)
    }
  }, [enabled, frameRef])

  const fadeIn = clamp(progress / carSceneConfig.appearance.fadeInEndsAtProgress)
  const fadeOut = clamp(
    (1 - progress) / (1 - carSceneConfig.appearance.fadeOutStartsAtProgress),
  )
  const opacity = modelReady ? Math.min(fadeIn, fadeOut) : 0
  const initialCamera = carSceneConfig.camera.farPosition

  return (
    <div
      className="fara-car-scene"
      data-model-ready={modelReady ? 'true' : 'false'}
      style={{ opacity }}
      aria-hidden="true"
    >
      <Canvas
        frameloop="demand"
        camera={{
          fov: carSceneConfig.camera.fov,
          near: carSceneConfig.camera.near,
          far: carSceneConfig.camera.far,
          position: initialCamera,
        }}
        gl={{ alpha: carSceneConfig.renderer.alpha, antialias: carSceneConfig.renderer.antialias }}
        dpr={carSceneConfig.renderer.dpr}
        onCreated={({ camera }) => camera.lookAt(...carSceneConfig.camera.lookAt)}
      >
        <ambientLight intensity={carSceneConfig.lights.ambientIntensity} />
        <directionalLight {...carSceneConfig.lights.key} />
        <directionalLight {...carSceneConfig.lights.fill} />
        <CameraPosition progress={progress} />
        <WhiteCar onReady={markModelReady} />
      </Canvas>
    </div>
  )
}
