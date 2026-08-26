import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()

const read = path => readFileSync(resolve(root, path), 'utf8')

const checks = [
  ['custom CSS bundle', 'dist/custom.bundle.css', 'public/custom.bundle.css'],
  ['site customizer bundle', 'dist/site-customizer.bundle.js', 'public/site-customizer.bundle.js'],
]

const failures = []

checks.forEach(([label, distPath, publicPath]) => {
  const distContent = read(distPath)
  const publicContent = read(publicPath)
  if (distContent !== publicContent) {
    failures.push(`${label} is out of sync: ${publicPath} does not match ${distPath}`)
  }
})

const legacyHtml = read('public/legacy/main/index.html')
const requiredVersion = 'menu-perf-20260826-3'
const requiredReferences = [
  `/custom.bundle.css?v=${requiredVersion}`,
  `/site-customizer.bundle.js?v=${requiredVersion}`,
]

requiredReferences.forEach(reference => {
  if (!legacyHtml.includes(reference)) {
    failures.push(`legacy iframe HTML is missing current cache-busted reference: ${reference}`)
  }
})

if (/home-load-20260801-10/.test(legacyHtml)) {
  failures.push('legacy iframe HTML still contains old cache-bust version home-load-20260801-10')
}

if (failures.length) {
  console.error(`Public bundle verification failed:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}

console.log('Public bundle verification passed: dist and public legacy bundles are synchronized.')
