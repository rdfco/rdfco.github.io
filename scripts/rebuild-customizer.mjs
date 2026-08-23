import { build } from 'esbuild'
import { cpSync } from 'node:fs'
import { resolve } from 'node:path'
const root = process.cwd()
await build({
  entryPoints: [resolve(root, 'src/site-customizer.js')],
  bundle: true, format: 'esm', target: 'es2020', minify: true,
  outfile: resolve(root, 'dist/site-customizer.bundle.js'),
})
cpSync(resolve(root, 'dist/site-customizer.bundle.js'), resolve(root, 'public/site-customizer.bundle.js'))
console.log('bundle rebuilt')
