import { readFileSync } from 'node:fs'

const quality = readFileSync('src/three/performance/quality-tiers.ts', 'utf8')
const runtime = readFileSync('src/three/core/runtime-config.ts', 'utf8')
const store = readFileSync('src/store/experience.ts', 'utf8')
const violations = []
if (!quality.includes('selectPerformanceTier')) violations.push('capability selector is missing')
if (!quality.includes('initialPerformanceTier = detectPerformanceTier()')) violations.push('browser detection is not active')
if (!runtime.includes('createThreeRuntimeConfig(initialPerformanceTier)')) violations.push('Canvas runtime does not consume automatic selection')
if (!store.includes('performanceTier:initialPerformanceTier')) violations.push('experience state does not expose the selected tier')
if (violations.length) throw new Error(`Performance policy failed:\n- ${violations.join('\n- ')}`)
console.log('Performance policy passed: capability selection owns initial Canvas quality.')
