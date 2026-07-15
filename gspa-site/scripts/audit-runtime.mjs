import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const roots = ['src/native', 'src/scenes', 'src/sections', 'src/data', 'src/store', 'index.html']
const files = []
async function walk(path) {
  if ((await stat(path)).isDirectory()) {
    for (const entry of await readdir(path)) await walk(join(path, entry))
  } else if (/\.(?:[cm]?[jt]sx?|css|html)$/.test(path)) files.push(path)
}
for (const root of roots) await walk(root)

const ownership = JSON.parse(await readFile('asset-ownership.json', 'utf8'))
const violations = []
const assetPaths = new Set()
for (const file of files) {
  const source = (await readFile(file, 'utf8')).replace(/\/\/.*$/gm, '')
  for (const match of source.matchAll(/https?:\/\/[^\s'"`)]+/g)) violations.push(`${relative('.', file)}: external URL ${match[0]}`)
  for (const match of source.matchAll(/['"](\/assets\/[^'"]+)['"]/g)) assetPaths.add(match[1])
}
for (const path of assetPaths) {
  const record = ownership.assets[path]
  if (!record?.approved || !record.provenance) violations.push(`${path}: missing approved provenance`)
  try { await stat(`public${path}`) } catch { violations.push(`${path}: file is missing`) }
}
if (violations.length) throw new Error(`Runtime audit failed:\n- ${violations.join('\n- ')}`)
console.log(`Runtime audit passed: ${files.length} source files, ${assetPaths.size} local assets, zero external URLs.`)
