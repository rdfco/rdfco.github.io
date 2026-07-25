import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { interpolateVector } from '../utils/vector'

export function CameraPosition({ progress, config }) {
  const { camera, invalidate } = useThree()

  useEffect(() => {
    camera.position.fromArray(interpolateVector(config.positions.far, config.positions.near, progress))
    camera.lookAt(...config.lookAt)
    invalidate()
  }, [camera, config, invalidate, progress])

  return null
}
