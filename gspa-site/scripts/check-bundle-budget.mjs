import { readdir, stat } from 'node:fs/promises'

const directory = 'dist/assets'
const limits = { '.js': 1_100_000, '.css': 100_000 }
const violations = []
for (const name of await readdir(directory)) {
  const suffix = Object.keys(limits).find(extension => name.endsWith(extension))
  if (!suffix) continue
  const bytes = (await stat(`${directory}/${name}`)).size
  if (bytes > limits[suffix]) violations.push(`${name}: ${bytes} > ${limits[suffix]} bytes`)
}
if (violations.length) throw new Error(`Bundle budget exceeded:\n- ${violations.join('\n- ')}`)
console.log('Bundle budgets passed.')
