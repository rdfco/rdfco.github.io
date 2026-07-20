import { assets, type AssetRecord } from '../../assets'

export type ModelDefinition = AssetRecord & { kind: 'model' }

const modelAssets = assets.filter((asset): asset is ModelDefinition => asset.kind === 'model')

export const modelRegistry = Object.fromEntries(
  modelAssets.map(model => [model.id, model]),
) as Record<string, ModelDefinition>

export function getModelDefinition(id: string): ModelDefinition {
  const model = modelRegistry[id]
  if (!model) throw new Error(`Unknown model id: ${id}`)
  return model
}

export const faraModelIds = {
  hero: 'model-fara-hero',
  energyChapter: 'model-fara-energy-chapter',
  mountains: 'model-mountains',
} as const
