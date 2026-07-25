import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Box3, Vector3 } from 'three'
import { useEffect, useMemo } from 'react'
import { createCarMaterial } from '../materials/createCarMaterial'

export function WhiteCar({ config, positionX }) {
  const gltf = useGLTF(config.assets.model.path)
  const { invalidate } = useThree()

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true)
    const bounds = new Box3().setFromObject(clone)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const fit = config.model.scale / Math.max(size.x, size.y, size.z, 1)

    clone.position.set(
      -center.x * fit + config.model.basePosition[0],
      -center.y * fit + config.model.basePosition[1],
      -center.z * fit + config.model.basePosition[2],
    )
    clone.scale.setScalar(fit)

    clone.traverse(node => {
      if (!node.isMesh) return
      node.material = createCarMaterial(config.material)
      node.castShadow = true
      node.receiveShadow = true
    })

    return clone
  }, [config, gltf.scene])

  useEffect(() => {
    invalidate()
  }, [invalidate, scene, positionX])

  return <primitive object={scene} rotation={config.model.rotation} position={[positionX, 0, 0]} />
}

export const preloadWhiteCar = config => useGLTF.preload(config.assets.model.path)
