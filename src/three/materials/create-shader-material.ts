import {
  AdditiveBlending,
  DoubleSide,
  ShaderMaterial,
  type IUniform,
} from 'three'

export function createShaderMaterial(
  vertexShader: string,
  fragmentShader: string,
  uniforms: Record<string, IUniform>,
  additive = true,
) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: DoubleSide,
    blending: additive ? AdditiveBlending : undefined,
  })
}
