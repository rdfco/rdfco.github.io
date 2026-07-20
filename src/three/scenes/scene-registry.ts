export const sceneRegistry = {
  fara: {
    id: 'fara',
    owner: 'three/scenes/fara',
    load: () => import('./fara/FaraScene'),
  },
} as const

export type SceneId = keyof typeof sceneRegistry
