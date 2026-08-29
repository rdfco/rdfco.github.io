export type AssetKind = 'model' | 'texture' | 'environment' | 'font' | 'audio' | 'image'
export type AssetScope = 'shared' | 'legacy' | 'route-page'
export type AssetLifecycle = 'active' | 'legacy-protected'
export type AssetApproval = 'approved' | 'review-required' | 'rejected'
/**
 * Whether the file may be reorganised. `pinned` means a generated or protected
 * consumer addresses it by URL, so its path is a contract; `movable` means only
 * our own source names it. Recomputed and enforced by `assets:validate`.
 */
export type AssetPlacement = 'pinned' | 'movable'

export type AssetRecord = {
  id: string
  path: string
  kind: AssetKind
  scope: AssetScope
  lifecycle: AssetLifecycle
  preload: boolean
  owner: string
  consumers: string[]
  provenance: string
  approval: AssetApproval
  placement: AssetPlacement
  fallback?: string
}

export type AssetRegistryDocument = {
  version: number
  policy: string
  assets: AssetRecord[]
}
