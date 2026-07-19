import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'

const registry = JSON.parse(await readFile('src/assets/asset-registry.json', 'utf8'))
const records = await Promise.all(
  registry.assets.map(async asset => ({
    ...asset,
    bytes: (await stat(`public${asset.path}`)).size,
  })),
)
const byKind = Object.fromEntries(
  [...new Set(records.map(asset => asset.kind))]
    .sort()
    .map(kind => [
      kind,
      {
        files: records.filter(asset => asset.kind === kind).length,
        bytes: records.filter(asset => asset.kind === kind).reduce((total, asset) => total + asset.bytes, 0),
      },
    ]),
)
const inventory = {
  generatedFrom: 'src/assets/asset-registry.json',
  registryVersion: registry.version,
  totals: {
    files: records.length,
    bytes: records.reduce((total, asset) => total + asset.bytes, 0),
  },
  byKind,
  assets: records,
}

await mkdir('docs/generated', { recursive: true })
await writeFile('docs/generated/asset-inventory.json', `${JSON.stringify(inventory, null, 2)}\n`)
console.log(`Asset inventory generated: ${inventory.totals.files} files, ${inventory.totals.bytes} bytes.`)
