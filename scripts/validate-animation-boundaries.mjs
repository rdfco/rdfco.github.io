import { readFile } from 'node:fs/promises'

const native = await readFile('src/native/NativeApp.tsx', 'utf8')
const runtime = await readFile('src/animations/runtime.ts', 'utf8')
const feature = await readFile(
  'src/features/home/useHomeRevealAnimations.ts',
  'utf8',
)
const reducedMotionHook = await readFile(
  'src/hooks/useReducedMotion.ts',
  'utf8',
)
const violations = []

if (/from ['"]gsap|ScrollTrigger|useLayoutEffect/.test(native)) {
  violations.push('NativeApp still owns GSAP or animation lifecycle')
}
if (!runtime.includes('gsap.registerPlugin(ScrollTrigger)')) {
  violations.push('Shared animation runtime does not register ScrollTrigger')
}
if (!feature.includes("from '../../animations'")) {
  violations.push('Home reveal animation bypasses the public animation boundary')
}
if (!feature.includes('useReducedMotion()')) {
  violations.push('Home reveal animation does not consume reduced-motion policy')
}
const reducedBranch = feature.indexOf('if (reducedMotion)')
const movingAnimation = feature.indexOf('gsap.from(')
if (
  reducedBranch < 0 ||
  movingAnimation < 0 ||
  reducedBranch > movingAnimation ||
  !feature.includes("clearProps: 'transform,opacity'")
) {
  violations.push(
    'Reduced-motion branch does not reveal elements before moving animations',
  )
}
if (!reducedMotionHook.includes('useState(currentPreference)')) {
  violations.push(
    'Reduced-motion preference is not available on the initial animation render',
  )
}
if (!native.includes('useHomeRevealAnimations(root)')) {
  violations.push('NativeApp does not activate the feature-owned reveal animation')
}

if (violations.length) {
  throw new Error(
    `Animation boundary validation failed:\n- ${violations.join('\n- ')}`,
  )
}
console.log(
  'Animation boundaries valid: shared GSAP runtime, feature lifecycle, and initial reduced-motion policy passed.',
)
