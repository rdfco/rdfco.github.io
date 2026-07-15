export type NavigationItem = { label: string; href: string; enabled: boolean; showInMenu: boolean; active?: boolean }
export type ContentCard = { title: string; text: string }
export type AssetDefinition = { path: string; kind: 'model'|'texture'|'environment'|'font'|'audio'; preload: boolean; ownership: 'legacy-audit-required'|'approved'; fallback?: string }
