import type { AssetDefinition } from '../types/content'
import { getAsset } from '../assets'

function legacyDefinition(id: string): AssetDefinition {
  const asset = getAsset(id)
  if (!['model', 'texture', 'environment', 'font', 'audio'].includes(asset.kind)) {
    throw new Error(`Asset ${id} is not compatible with the legacy definition`)
  }
  return {
    path: asset.path,
    kind: asset.kind as AssetDefinition['kind'],
    preload: asset.preload,
    ownership: asset.approval === 'approved' ? 'approved' : 'legacy-audit-required',
    fallback: asset.fallback,
  }
}

export const assetRegistry = {
  heroModel: legacyDefinition('model-fara-hero'),
  energyChapter: legacyDefinition('model-fara-energy-chapter'),
  mountains: legacyDefinition('model-mountains'),
  environment: legacyDefinition('environment-main'),
} satisfies Record<string,AssetDefinition>
