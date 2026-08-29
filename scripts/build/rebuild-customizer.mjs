import { build } from 'esbuild'
import { cpSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
const root = process.cwd()
const distGeneratedRoot = resolve(root, 'dist/generated')
const publicGeneratedRoot = resolve(root, 'public/generated')
mkdirSync(distGeneratedRoot, { recursive: true })
mkdirSync(publicGeneratedRoot, { recursive: true })
await build({
  entryPoints: [resolve(root, 'src/legacy/runtime/site-customizer.js')],
  bundle: true, format: 'esm', target: 'es2020', minify: true,
  outfile: resolve(distGeneratedRoot, 'site-customizer.bundle.js'),
})
cpSync(resolve(distGeneratedRoot, 'site-customizer.bundle.js'), resolve(publicGeneratedRoot, 'site-customizer.bundle.js'))
console.log('bundle rebuilt')
