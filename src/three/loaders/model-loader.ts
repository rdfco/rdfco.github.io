import { useGLTF } from '@react-three/drei'
import { getModelDefinition } from '../models/model-registry'

export function useRegisteredGLTF(modelId: string) {
  return useGLTF(getModelDefinition(modelId).path)
}

export function preloadRegisteredGLTF(modelId: string) {
  useGLTF.preload(getModelDefinition(modelId).path)
}
