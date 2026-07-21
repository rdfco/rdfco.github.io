import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3, MeshStandardMaterial, Vector3 } from 'three'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { carSceneConfig } from './car-scene.config'

const clamp = value => Math.min(1, Math.max(0, value))
const revealThreshold = 0.01

function WhiteCar({ positionX }) {
  const gltf = useGLTF(carSceneConfig.modelUrl)
  const { invalidate } = useThree()

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true)
    const bounds = new Box3().setFromObject(clone)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const fit = carSceneConfig.modelScale / Math.max(size.x, size.y, size.z, 1)

    clone.position.set(-center.x * fit, -center.y * fit - 1.1, -center.z * fit)
    clone.scale.setScalar(fit)

    clone.traverse(node => {
      if (!node.isMesh) return
      node.material = new MeshStandardMaterial({ color: '#f7f7f2', roughness: 0.43, metalness: 0.18 })
      node.castShadow = true
      node.receiveShadow = true
    })

    return clone
  }, [gltf.scene])

  useEffect(() => {
    invalidate()
  }, [invalidate, scene, positionX])

  return <primitive object={scene} rotation={[0, -0.5, 0]} position={[positionX, 0, 0]} />
}

function CameraPosition({ progress }) {
  const { camera, invalidate } = useThree()

  useEffect(() => {
    camera.position.set(0, 0.15, carSceneConfig.farCameraZ + (carSceneConfig.nearCameraZ - carSceneConfig.farCameraZ) * progress)
    camera.lookAt(0, -0.45, 0)
    invalidate()
  }, [camera, invalidate, progress])

  return null
}

function CarDragControls({ onDrag }) {
  const { gl: renderer } = useThree()
  const isDragging = useRef(false)
  const previousMouseX = useRef(0)

  const handlePointerDown = useCallback(event => {
    isDragging.current = true
    previousMouseX.current = event.clientX
    event.stopPropagation()
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handlePointerMove = useCallback(event => {
    if (!isDragging.current) return
    const deltaX = (event.clientX - previousMouseX.current) * 0.012
    onDrag(deltaX)
    previousMouseX.current = event.clientX
  }, [onDrag])

  useEffect(() => {
    const canvas = renderer.domElement
    canvas.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointermove', handlePointerMove)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp, renderer])

  return null
}

useGLTF.preload(carSceneConfig.modelUrl)

export function CarSceneOverlay({ frameRef, enabled }) {
  const [progress, setProgress] = useState(0)
  const [carPositionX, setCarPositionX] = useState(0)

  const handleCarDrag = useCallback(delta => {
    setCarPositionX(current => Math.min(5, Math.max(-5, current + delta)))
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    const frameWindow = frameRef.current?.contentWindow
    if (!frameWindow) return undefined

    let animationFrame = 0

    const update = () => {
      const maximum = Math.max(1, frameWindow.document.documentElement.scrollHeight - frameWindow.innerHeight)
      const pageProgress = frameWindow.scrollY / maximum
      const sceneProgress = clamp((pageProgress - carSceneConfig.startAtPageProgress) / (carSceneConfig.endAtPageProgress - carSceneConfig.startAtPageProgress))
      setProgress(sceneProgress)
    }

    const scheduleUpdate = () => {
      if (animationFrame) return
      animationFrame = frameWindow.requestAnimationFrame(() => {
        animationFrame = 0
        update()
      })
    }

    scheduleUpdate()
    frameWindow.addEventListener('scroll', scheduleUpdate, { passive: true })
    frameWindow.addEventListener('resize', scheduleUpdate)

    return () => {
      if (animationFrame) frameWindow.cancelAnimationFrame(animationFrame)
      frameWindow.removeEventListener('scroll', scheduleUpdate)
      frameWindow.removeEventListener('resize', scheduleUpdate)
    }
  }, [enabled, frameRef])

  const visible = progress > revealThreshold && progress < 1

  return (
    <div className="fara-car-scene" data-visible={visible ? 'true' : 'false'} aria-hidden="true">
      <Canvas frameloop={visible ? 'always' : 'demand'} camera={{ fov: 33, near: 0.1, far: 100 }} gl={{ alpha: true, antialias: true }} dpr={[1, 1.5]}>
        <ambientLight intensity={2.2} />
        <directionalLight position={[4, 6, 5]} intensity={3.4} />
        <directionalLight position={[-5, 1, 2]} intensity={1.2} />
        <CameraPosition progress={progress} />
        <Suspense fallback={null}>
          <WhiteCar positionX={carPositionX} />
        </Suspense>
        <CarDragControls onDrag={handleCarDrag} />
      </Canvas>
    </div>
  )
}
