const APP = '/_astro/GlobalApp.vK8XqYB9.js'
let config = window.FARA_BACKGROUND_COLORS || {}
try { config = window.parent.FARA_BACKGROUND_COLORS || config } catch { /* sandboxed cross-origin parent */ }
const valid = value => typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
const color = (key, fallback) => valid(config[key]) ? config[key] : fallback
const rgb = hex => {
  const value = hex.length === 4 ? hex.slice(1).split('').map(char => char + char).join('') : hex.slice(1)
  return [0, 2, 4].map(index => (parseInt(value.slice(index, index + 2), 16) / 255).toFixed(6)).join(',')
}
const replacements = [
  [/this\.background=new ce\(0\)/g, `this.background=new ce("${color('sceneBackground', '#000000')}")`],
  [/new ce\(4103095\)/g, `new ce("${color('skyLight', '#3e9bb7')}")`],
  [/new ce\(528921\)/g, `new ce("${color('skyDark', '#081219')}")`],
  [/vec3 color = mix\(uDarkColor, uLightColor \+ \.08 \* homepage, clamp\(value, 0\., 1\.\)\);/g, `vec3 color = mix(vec3(${rgb(color('skyDark', '#081219'))}), vec3(${rgb(color('skyLight', '#3e9bb7'))}), clamp(value, 0., 1.));`],
  [/#8fc1e5/gi, color('hologram', '#8fc1e5')], [/#6bfeff/gi, color('hologramGlow', '#6bfeff')],
  [/#84d5ff/gi, color('pathLines', '#84d5ff')], [/#1a697f/gi, color('gridBackground', '#1a697f')],
  [/#4e8399/gi, color('gridLines', '#4e8399')], [/#7a9fb6/gi, color('gridAccent', '#7a9fb6')],
  [/#519abc/gi, color('gridPoints', '#519abc')],
  [/color \+= stars \* \(\.4 \+ uLightColor\) \* fortEnergy;/g, `color += stars * vec3(${rgb(color('stars', '#ffffff'))}) * fortEnergy;`],
]
const patchShader = source => {
  if (source.includes('Fort energy stars')) source = source
    .replace(/vec3 color = mix\(uDarkColor, uLightColor \+ \.08 \* homepage, clamp\(value, 0\., 1\.\)\);/, `vec3 color = mix(vec3(${rgb(color('skyDark', '#081219'))}), vec3(${rgb(color('skyLight', '#3e9bb7'))}), clamp(value, 0., 1.));`)
    .replace(/color \+= stars \* \(\.4 \+ uLightColor\) \* fortEnergy;/, `color += stars * vec3(${rgb(color('stars', '#ffffff'))}) * fortEnergy;`)
  if (source.includes('float hills = smoothstep') && source.includes('uLightColor * height')) source = source
    .replace('vec3 color = uDarkColor;', `vec3 color = vec3(${rgb(color('horizonDark', '#081219'))});`)
    .replace('2. * uLightColor * height', `2. * vec3(${rgb(color('horizonGlow', '#3e9bb7'))}) * height`)
  // Vertical/rising energy ribbons in the center and their reflection.
  if (source.includes('clamp(factor, 0., 2.5)')) source = source
    .replace('color = uColor * clamp(factor, 0., 2.5);', `color = vec3(${rgb(color('risingLines', '#a1d7ff'))}) * clamp(factor, 0., 2.5);`)
  // Thin animated power beams.
  if (source.includes('clamp(brightness + intensity, 0., 1.5)')) source = source
    .replace('vec3 color = uLightColor * clamp(brightness + intensity, 0., 1.5);', `vec3 color = vec3(${rgb(color('powerLines', '#a1d7ff'))}) * clamp(brightness + intensity, 0., 1.5);`)
  // Large glow behind/under the mountain.
  if (source.includes('uLightColor * center * 30.')) source = source
    .replace('vec3 color = uLightColor * center * 30.;', `vec3 color = vec3(${rgb(color('mountainBackGlow', '#3e9bb7'))}) * center * 30.;`)
  // Long path lines and their soft glow on the ground.
  if (source.includes('vec3 color=uColor*(glow+lines)')) source = source
    .replace('vec3 color=uColor*(glow+lines)', `vec3 color=vec3(${rgb(color('pathLines', '#84d5ff'))})*(glow+lines)`)
  // Hologram body and halo.
  if (source.includes('intensity * mix(uColor, .5 * uGlowColor')) source = source
    .replace('mix(uColor, .5 * uGlowColor, smoothstep(1., 2., intensity))', `mix(vec3(${rgb(color('hologram', '#8fc1e5'))}), .5 * vec3(${rgb(color('hologramGlow', '#6bfeff'))}), smoothstep(1., 2., intensity))`)
  return source
}
const linearChannel = value => value <= .04045 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4)
const channels = hex => {
  const value = hex.slice(1)
  return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255)
}
const uniformColorMap = [
  ['#84d5ff', 'pathLines'], ['#a1d7ff', 'powerLines'], ['#8fc1e5', 'hologram'],
  ['#6bfeff', 'hologramGlow'], ['#1a697f', 'gridBackground'], ['#4e8399', 'gridLines'],
  ['#7a9fb6', 'gridAccent'], ['#519abc', 'gridPoints'],
].map(([original, key]) => ({ original: channels(original), target: channels(color(key, original)).map(linearChannel) }))
const remapUniformColor = values => {
  for (const entry of uniformColorMap) {
    const srgbMatch = values.every((value, index) => Math.abs(value - entry.original[index]) < .003)
    const linearMatch = values.every((value, index) => Math.abs(value - linearChannel(entry.original[index])) < .003)
    if (srgbMatch || linearMatch) return entry.target
  }
  return values
}
for (const Context of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
  if (!Context || Context.prototype.__faraColorsInstalled) continue
  const original = Context.prototype.shaderSource
  Context.prototype.shaderSource = function(shader, source) { return original.call(this, shader, patchShader(source)) }
  const originalUniform3f = Context.prototype.uniform3f
  Context.prototype.uniform3f = function(location, x, y, z) { const mapped = remapUniformColor([x, y, z]); return originalUniform3f.call(this, location, ...mapped) }
  const originalUniform3fv = Context.prototype.uniform3fv
  Context.prototype.uniform3fv = function(location, value, ...rest) { const mapped = value.length === 3 ? remapUniformColor(Array.from(value)) : value; return originalUniform3fv.call(this, location, mapped, ...rest) }
  Context.prototype.__faraColorsInstalled = true
}
let module
try {
  let source = await fetch(APP, { cache: 'no-store' }).then(response => { if (!response.ok) throw new Error(`WebGL app: ${response.status}`); return response.text() })
  const applied = []
  for (const [pattern, replacement] of replacements) {
    const before = source
    source = source.replace(pattern, replacement)
    applied.push(before === source ? 0 : 1)
  }
  window.__FARA_COLOR_DEBUG = { config, applied, skyLight: color('skyLight', '#3e9bb7'), skyDark: color('skyDark', '#081219'), stars: color('stars', '#ffffff') }
  source = source.replaceAll('from"./', 'from"/_astro/').replaceAll('import"./', 'import"/_astro/')
  module = await import(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })))
} catch (error) {
  console.warn('Custom WebGL colors failed; using the original background.', error)
  module = await import(APP)
}
window.__FARA_APP_EXPORTS = module
export const a = module.a
export const E = module.E
export const G = module.G
