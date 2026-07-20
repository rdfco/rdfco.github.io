export const faraShaderManifest = [
  'EnergyBg',
  'EnergyCone',
  'Glow',
  'PowerLine',
  'Holograms',
  'Grid',
  'Line',
] as const

export type FaraShaderName = (typeof faraShaderManifest)[number]
