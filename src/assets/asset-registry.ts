import registryDocument from './asset-registry.json'
import type { AssetRecord, AssetRegistryDocument } from './asset.types'

export const assetRegistryDocument = registryDocument as AssetRegistryDocument
export const assets = assetRegistryDocument.assets
export const assetsById = Object.fromEntries(assets.map(asset => [asset.id, asset])) as Record<string, AssetRecord>
export const assetsByPath = Object.fromEntries(assets.map(asset => [asset.path, asset])) as Record<string, AssetRecord>

export function getAsset(id: string) {
  const asset = assetsById[id]
  if (!asset) throw new Error(`Unknown asset id: ${id}`)
  return asset
}
