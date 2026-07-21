import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, MeshStandardMaterial, Vector3 } from 'three'
import { useEffect, useMemo, useState } from 'react'
import { carSceneConfig } from './car-scene.config'

const clamp = value => Math.min(1, Math.max(0, value))

function WhiteCar() {
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

  return <primitive object={scene} rotation={carSceneConfig.model.rotation} />
}

function CameraPosition({ progress }) {
  const { camera, invalidate } = useThree()

  useEffect(() => {
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

  useEffect(() => {
    if (!enabled) return undefined
    const frameWindow = frameRef.current?.contentWindow
    if (!frameWindow) return undefined
    const update = () => {
      const maximum = Math.max(1, frameWindow.document.documentElement.scrollHeight - frameWindow.innerHeight)
      const pageProgress = frameWindow.scrollY / maximum
      const sceneProgress = clamp(
        (pageProgress - carSceneConfig.scroll.startAtPageProgress)
        / (carSceneConfig.scroll.endAtPageProgress - carSceneConfig.scroll.startAtPageProgress),
      )
      setProgress(sceneProgress)
    }
    update()
    frameWindow.addEventListener('scroll', update, { passive: true })
    frameWindow.addEventListener('resize', update)
    return () => {
      frameWindow.removeEventListener('scroll', update)
      frameWindow.removeEventListener('resize', update)
    }
  }, [enabled, frameRef])

  const visible = progress > 0 && progress < 1

  if (!visible) return null

  return (
    <div className="fara-car-scene" aria-hidden="true">
      <Canvas
        frameloop="demand"
        camera={{ fov: carSceneConfig.camera.fov, near: carSceneConfig.camera.near, far: carSceneConfig.camera.far }}
        gl={{ alpha: carSceneConfig.renderer.alpha, antialias: carSceneConfig.renderer.antialias }}
        dpr={carSceneConfig.renderer.dpr}
      >
        <ambientLight intensity={carSceneConfig.lights.ambientIntensity} />
        <directionalLight {...carSceneConfig.lights.key} />
        <directionalLight {...carSceneConfig.lights.fill} />
        <CameraPosition progress={progress} />
        <WhiteCar />
      </Canvas>
    </div>
  )
}
