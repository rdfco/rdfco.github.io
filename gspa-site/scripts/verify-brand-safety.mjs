import { readFile } from 'node:fs/promises'

const required = [
  ['dist/index.html', /src="\/assets\/index-[^"]+\.js"/],
  ['dist/src/site-customizer.js', /dataset\.faraReady = 'true'/],
  ['dist/src/custom.css', /html:not\(\[data-fara-ready='true'\]\) body/],
]

for (const [file, pattern] of required) {
  const content = await readFile(file, 'utf8')
  if (!pattern.test(content)) throw new Error(`Unsafe build: required FARA guard is missing from ${file}`)
}

const app = await readFile('dist/index.html', 'utf8')
if (!app.includes('<title>FARA</title>')) throw new Error('Unsafe build: the public entry point is not branded FARA')

console.log('Brand-safety checks passed: the FARA entry point and fail-closed guards are present.')
