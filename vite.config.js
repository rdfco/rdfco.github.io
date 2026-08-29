import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { build as buildWithEsbuild } from 'esbuild'
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const legacyRuntimeFiles = [
  'legacy',
  'content',
]

const legacyCustomizerEntry = 'legacy/runtime/site-customizer.js'
const legacyStylesEntry = 'legacy/styles/index.css'

const pageRoutes = [
  'knowing-fara',
  'consulting',
  'industries',
  'think-together',
  'privacy-policy',
  'terms-of-use',
  'news',
  ...Array.from({ length: 21 }, (_, index) => `news/fara-insight-${String(index + 1).padStart(2, '0')}`),
]

// The protected iframe loads one stylesheet, so the source tree is flattened
// into it here. Each @import resolves relative to the file that wrote it, the
// same as a browser would, which lets a stylesheet be split into a folder of
// parts behind a barrel without the entry point knowing about them.
function inlineCssImports(filePath) {
  const directory = dirname(filePath)
  return readFileSync(filePath, 'utf8').replace(
    /@import\s+['"]([^'"]+)['"];\s*/g,
    (_, specifier) => `${inlineCssImports(resolve(directory, specifier))}\n`,
  )
}

function copyLegacyRuntime() {
  return {
    name: 'copy-legacy-runtime',
    async closeBundle() {
      const sourceRoot = resolve(process.cwd(), 'src')
      const targetRoot = resolve(process.cwd(), 'dist', 'src')
      const legacyIndex = resolve(process.cwd(), 'dist', 'legacy', 'main', 'index.html')
      const bundledCustomizerPath = '/site-customizer.bundle.js?v=loading-smooth-20260829-1'
      const bundledStylesPath = '/custom.bundle.css?v=loading-smooth-20260829-1'
      mkdirSync(targetRoot, { recursive: true })
      legacyRuntimeFiles.forEach(file => {
        cpSync(resolve(sourceRoot, file), resolve(targetRoot, file), { recursive: true })
      })
      const bundledCss = inlineCssImports(resolve(sourceRoot, legacyStylesEntry))
      writeFileSync(resolve(process.cwd(), 'dist', 'custom.bundle.css'), bundledCss)
      writeFileSync(resolve(process.cwd(), 'public', 'custom.bundle.css'), bundledCss)
      await buildWithEsbuild({
        entryPoints: [resolve(sourceRoot, legacyCustomizerEntry)],
        bundle: true,
        format: 'esm',
        target: 'es2020',
        minify: true,
        outfile: resolve(process.cwd(), 'dist', 'site-customizer.bundle.js'),
      })
      cpSync(
        resolve(process.cwd(), 'dist', 'site-customizer.bundle.js'),
        resolve(process.cwd(), 'public', 'site-customizer.bundle.js'),
      )
      const legacyHtml = readFileSync(legacyIndex, 'utf8')
        .replace(
          /<script type="module" src="\/(?:src\/site-customizer\.js|site-customizer\.bundle\.js\?v=)[^"]*" data-astro-transition-persist="fara-customizer"><\/script>/,
          `<script type="module" src="${bundledCustomizerPath}" data-astro-transition-persist="fara-customizer"></script>`,
        )
        .replace(
          /<link rel="stylesheet" href="\/(?:src\/custom\.css|custom\.bundle\.css\?v=[^"]+)">/,
          `<link rel="stylesheet" href="${bundledStylesPath}">`,
        )
        .replace(
          /\/_astro\/WebGL\.astro_astro_type_script_index_0_lang\.ClLv70z8\.js\?v=[^"]+/,
          '/_astro/WebGL.astro_astro_type_script_index_0_lang.ClLv70z8.js?v=webgl-ready-20260824-brand-1',
        )
      writeFileSync(legacyIndex, legacyHtml)
      const appShell = resolve(process.cwd(), 'dist', 'index.html')
      cpSync(appShell, resolve(process.cwd(), 'dist', '404.html'))
      pageRoutes.forEach(route => {
        const routeRoot = resolve(process.cwd(), 'dist', route)
        mkdirSync(routeRoot, { recursive: true })
        cpSync(appShell, resolve(routeRoot, 'index.html'))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), copyLegacyRuntime()],
  resolve: { alias: { '@': resolve(process.cwd(), 'src') } },
  server: { host: 'localhost', port: 5173, strictPort: true, open: true },
  // Stated explicitly rather than relied on: a source map would hand the
  // reader the original sources, which defeats the point of the naming work.
  build: { sourcemap: false },
})
