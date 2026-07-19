export type AssetKind = 'model' | 'texture' | 'environment' | 'font' | 'audio' | 'image'
export type AssetScope = 'shared' | 'native' | 'legacy'
export type AssetLifecycle = 'active' | 'legacy-protected'
export type AssetApproval = 'approved' | 'review-required' | 'rejected'

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
  fallback?: string
}

export type AssetRegistryDocument = {
  version: number
  policy: string
  assets: AssetRecord[]
}
