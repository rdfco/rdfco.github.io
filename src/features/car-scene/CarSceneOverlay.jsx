import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { CameraPosition } from './camera/CameraPosition'
import { carSceneConfig } from './config'
import { SceneDebug } from './debug/SceneDebug'
import { SceneLights } from './lights/SceneLights'
import { preloadWhiteCar, WhiteCar } from './models/WhiteCar'
import { useFrameScrollProgress } from './scroll/useFrameScrollProgress'

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
    const deltaX = (event.clientX - previousMouseX.current) * carSceneConfig.model.dragSensitivity
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

preloadWhiteCar(carSceneConfig)

export function CarSceneOverlay({ frameRef, enabled }) {
  const progress = useFrameScrollProgress({
    enabled,
    frameRef,
    scrollConfig: carSceneConfig.scroll,
  })
  const [carPositionX, setCarPositionX] = useState(0)

  const handleCarDrag = useCallback(delta => {
    const [minimum, maximum] = carSceneConfig.model.dragBounds
    setCarPositionX(current => Math.min(maximum, Math.max(minimum, current + delta)))
  }, [])
  const visible = progress > carSceneConfig.scroll.revealThreshold && progress < 1

  return (
    <div className="fara-car-scene" data-visible={visible ? 'true' : 'false'} aria-hidden="true">
      <Canvas
        frameloop={visible ? carSceneConfig.performance.frameloop.visible : carSceneConfig.performance.frameloop.hidden}
        camera={{
          fov: carSceneConfig.camera.fov,
          near: carSceneConfig.camera.near,
          far: carSceneConfig.camera.far,
        }}
        gl={carSceneConfig.performance.gl}
        dpr={carSceneConfig.performance.dpr}
      >
        <SceneLights config={carSceneConfig.lights} />
        <CameraPosition progress={progress} config={carSceneConfig.camera} />
        <Suspense fallback={null}>
          <WhiteCar config={carSceneConfig} positionX={carPositionX} />
        </Suspense>
        <CarDragControls onDrag={handleCarDrag} />
        <SceneDebug config={carSceneConfig.debug} />
      </Canvas>
    </div>
  )
}
