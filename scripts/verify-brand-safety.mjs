/*
 * Fails the build if the retired source brand reaches dist/, and if the FARA
 * entry point or its fail-closed guards go missing.
 *
 * dist/ is the thing visitors can actually reach, so it is what gets scanned -
 * a clean src/ proves nothing on its own. There is deliberately no allowlist:
 * anything this finds is either reachable by a visitor, in which case it has to
 * be renamed rather than excused, or it does not belong in the build.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const required = [
  ['dist/index.html', /src="\/assets\/index-[^"]+\.js"/],
  ['dist/src/legacy/runtime/site-customizer.js', /dataset\.faraReady = 'true'/],
  ['dist/src/legacy/styles/index.css', /html:not\(\[data-fara-ready='true'\]\) body/],
]

for (const [file, pattern] of required) {
  if (!existsSync(file)) throw new Error(`Unsafe build: ${file} is missing`)
  if (!pattern.test(readFileSync(file, 'utf8'))) throw new Error(`Unsafe build: required FARA guard is missing from ${file}`)
}

const app = readFileSync('dist/index.html', 'utf8')
if (!app.includes('<title>FARA</title>')) throw new Error('Unsafe build: the public entry point is not branded FARA')

/*
 * \b around the bare words so effort, comfort and month do not trip the gate.
 * fort.?energy catches fortenergy, fort-energy and "fort energy" alike.
 */
const BRAND = /montfort|mont-fort|fort.?energy|\bmont\b|\bfort\b/i

/*
 * Third-party identifiers carried over from the source site. An analytics
 * container id is as traceable back to the previous owner as the name itself,
 * so it is held to the same standard.
 */
const THIRD_PARTY = /GTM-[A-Z0-9]{4,}|\bUA-\d{4,}-\d+|\bG-[A-Z0-9]{8,}|gtag\(|googletagmanager|cookiebot|cybot|\bsentry\b/i

// Extensions that are not usefully searchable as text; scanned as raw bytes.
const BINARY = new Set(['.glb', '.gltf', '.woff', '.woff2', '.ttf', '.otf', '.eot', '.exr', '.ktx2', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.mp3', '.wav', '.ogg', '.mp4', '.webm', '.pdf', '.zip'])

const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const path = join(dir, entry.name)
  return entry.isDirectory() ? walk(path) : [path]
})

const findings = []
for (const file of walk('dist')) {
  const binary = BINARY.has(extname(file).toLowerCase())
  // latin1 keeps every byte a distinct character, so ASCII runs inside binaries
  // stay matchable without decoding the container.
  const content = readFileSync(file, binary ? 'latin1' : 'utf8')
  const matches = [
    ...(content.match(new RegExp(BRAND.source, 'gi')) || []),
    ...(content.match(new RegExp(THIRD_PARTY.source, 'gi')) || []),
  ]
  if (!matches.length) continue
  const unique = [...new Set(matches.map(match => match.toLowerCase()))]
  findings.push(`${file}${binary ? ' (binary)' : ''}: ${unique.join(', ')}`)
}

if (findings.length) {
  console.error('Unsafe build: retired source-brand or third-party identifiers reached dist/.')
  for (const finding of findings) console.error(`  ${finding}`)
  throw new Error(`Brand scan failed in ${findings.length} file(s). Rename the source, do not weaken this pattern.`)
}

console.log(`Brand-safety checks passed: FARA entry point and guards present, and ${walk('dist').length} files in dist/ are free of the retired brand and its third-party identifiers.`)
