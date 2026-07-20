import manifest from './shader-manifest.json'

export type FaraShaderStatus = 'active' | 'archived' | 'unused'

export interface FaraShaderDefinition {
  name: string
  status: FaraShaderStatus
  vertex: string
  fragment: string
  owner: string
  provenance: string
}

export const faraShaderManifest =
  manifest as readonly FaraShaderDefinition[]

const activeShaderSources = import.meta.glob<string>(
  '../shaders/**/*.{vert,frag}',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
)

function loadActiveShader(definition: FaraShaderDefinition) {
  const vertex = activeShaderSources[definition.vertex]
  const fragment = activeShaderSources[definition.fragment]
  if (!vertex || !fragment) {
    throw new Error(
      `Registered FARA shader sources are unavailable: ${definition.name}`,
    )
  }
  return { vertex, fragment }
}

export const faraShaders = Object.fromEntries(
  faraShaderManifest
    .filter((shader) => shader.status === 'active')
    .map((shader) => [shader.name, loadActiveShader(shader)]),
) as Record<string, { vertex: string; fragment: string }>
