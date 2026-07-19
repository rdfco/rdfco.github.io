import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = 'src/native'
const files = []
async function walk(directory) {
  for (const name of await readdir(directory)) {
    const path = join(directory, name)
    if ((await stat(path)).isDirectory()) await walk(path)
    else files.push(path)
  }
}
await walk(root)

const forbidden = [
  [/<iframe/i, 'iframe'],
  [/public\/legacy|\/legacy\/|public\/_astro/i, 'legacy runtime'],
  [/site-customizer|LegacySite/i, 'runtime customization'],
  [/mont-?fort|fort\s*energy|fortenergy/i, 'retired brand'],
  [/https?:\/\//i, 'external domain'],
  [/innerHTML|document\.querySelector/i, 'imperative DOM replacement'],
]

for (const file of files) {
  const source = await readFile(file, 'utf8')
  for (const [pattern, label] of forbidden) {
    if (pattern.test(source)) throw new Error(`${relative('.', file)} contains forbidden ${label}`)
  }
}
console.log(`Native boundary passed for ${files.length} files.`)
