/*
 * Renames name fields inside the JSON chunk of .glb files.
 *
 * glTF references scenes, nodes, materials and images by array index, never by
 * name, so a pure name rewrite cannot change what renders. The binary chunk is
 * copied through byte for byte - nothing is re-encoded and no quality is lost.
 *
 * Usage: node scripts/rename-glb-names.mjs [--write]
 *        (default is a dry run that only reports)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const JSON_CHUNK = 0x4e4f534a
const BIN_CHUNK = 0x004e4942

// Exact-match renames only. Anything not listed here is left untouched, which
// keeps the names other code looks up (EnergyCylinder, Reflected, Line.*,
// Hologram*, LookAt*, Grid) safe by construction.
const RENAMES = new Map([
  ['MONTFORT', 'FARA'],
  ['FortEnergy', 'Energy'],
  ['fort-energy-assets-HEAVY', 'energy-assets'],
])

const NAMED_COLLECTIONS = ['scenes', 'nodes', 'meshes', 'materials', 'images', 'textures', 'animations', 'skins', 'cameras', 'samplers']

const readGlb = buffer => {
  if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error('not a glb')
  let offset = 12
  const chunks = []
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset)
    const type = buffer.readUInt32LE(offset + 4)
    chunks.push({ type, data: buffer.subarray(offset + 8, offset + 8 + length) })
    offset += 8 + length
  }
  return chunks
}

const writeGlb = chunks => {
  const parts = []
  let total = 12
  for (const { type, data } of chunks) {
    const pad = (4 - (data.length % 4)) % 4
    const padded = pad ? Buffer.concat([data, Buffer.alloc(pad, type === JSON_CHUNK ? 0x20 : 0x00)]) : data
    const header = Buffer.alloc(8)
    header.writeUInt32LE(padded.length, 0)
    header.writeUInt32LE(type, 4)
    parts.push(header, padded)
    total += 8 + padded.length
  }
  const head = Buffer.alloc(12)
  head.writeUInt32LE(0x46546c67, 0)
  head.writeUInt32LE(2, 4)
  head.writeUInt32LE(total, 8)
  return Buffer.concat([head, ...parts])
}

const write = process.argv.includes('--write')
const modelsRoot = 'public/assets/models'
const files = readdirSync(modelsRoot, { recursive: true })
  .filter(entry => String(entry).endsWith('.glb'))
  .map(entry => join(modelsRoot, String(entry)))
let touched = 0

for (const file of files) {
  const chunks = readGlb(readFileSync(file))
  const jsonChunk = chunks.find(chunk => chunk.type === JSON_CHUNK)
  const gltf = JSON.parse(jsonChunk.data.toString('utf8'))
  const changes = []

  for (const collection of NAMED_COLLECTIONS) {
    for (const entry of gltf[collection] || []) {
      const next = RENAMES.get(entry.name)
      if (!next) continue
      changes.push(`${collection}: ${entry.name} -> ${next}`)
      entry.name = next
    }
  }
  if (!gltf.asset) gltf.asset = {}
  for (const field of ['generator', 'copyright']) {
    const value = gltf.asset[field]
    if (typeof value !== 'string') continue
    if (!/mont|fort/i.test(value)) continue
    changes.push(`asset.${field}: removed "${value}"`)
    delete gltf.asset[field]
  }

  if (!changes.length) continue
  touched += 1
  console.log(`${file}`)
  for (const change of changes) console.log(`   ${change}`)

  if (!write) continue
  const binChunk = chunks.find(chunk => chunk.type === BIN_CHUNK)
  const beforeBin = binChunk ? binChunk.data.length : 0
  const next = writeGlb([
    { type: JSON_CHUNK, data: Buffer.from(JSON.stringify(gltf), 'utf8') },
    ...(binChunk ? [{ type: BIN_CHUNK, data: binChunk.data }] : []),
  ])
  writeFileSync(file, next)
  const afterBin = readGlb(readFileSync(file)).find(chunk => chunk.type === BIN_CHUNK)
  if ((afterBin ? afterBin.data.length : 0) !== beforeBin) throw new Error(`binary chunk changed size in ${file}`)
}

console.log(write ? `\nRewrote ${touched} file(s).` : `\nDry run: ${touched} file(s) would change. Pass --write to apply.`)
