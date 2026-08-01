import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { build as buildWithEsbuild } from 'esbuild'
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const legacyRuntimeFiles = [
  'site-customizer.js',
  'custom.css',
  'data',
  'content',
  'js',
  'styles',
  'navbar',
]

const pageRoutes = [
  'knowing-fara',
  'solution',
  'consulting',
  'industries',
  'case-studies',
  'think-together',
  'privacy-policy',
  'terms-of-use',
  'news',
  ...Array.from({ length: 21 }, (_, index) => `news/fara-insight-${String(index + 1).padStart(2, '0')}`),
]

function copyLegacyRuntime() {
  return {
    name: 'copy-legacy-runtime',
    async closeBundle() {
      const sourceRoot = resolve(process.cwd(), 'src')
      const targetRoot = resolve(process.cwd(), 'dist', 'src')
      const legacyIndex = resolve(process.cwd(), 'dist', 'legacy', 'fort-energy', 'index.html')
      const bundledCustomizerPath = '/site-customizer.bundle.js?v=home-load-20260801-9'
      const bundledStylesPath = '/custom.bundle.css?v=home-load-20260801-9'
      mkdirSync(targetRoot, { recursive: true })
      legacyRuntimeFiles.forEach(file => {
        cpSync(resolve(sourceRoot, file), resolve(targetRoot, file), { recursive: true })
      })
      const customCss = readFileSync(resolve(sourceRoot, 'custom.css'), 'utf8')
      const bundledCss = customCss.replace(
        /@import\s+['"]\.\/styles\/([^'"]+)['"];\s*/g,
        (_, file) => `${readFileSync(resolve(sourceRoot, 'styles', file), 'utf8')}\n`,
      )
      writeFileSync(resolve(process.cwd(), 'dist', 'custom.bundle.css'), bundledCss)
      await buildWithEsbuild({
        entryPoints: [resolve(sourceRoot, 'site-customizer.js')],
        bundle: true,
        format: 'esm',
        target: 'es2020',
        minify: true,
        outfile: resolve(process.cwd(), 'dist', 'site-customizer.bundle.js'),
      })
      const legacyHtml = readFileSync(legacyIndex, 'utf8')
        .replace(
          /<script type="module" src="\/src\/site-customizer\.js[^"]*" data-astro-transition-persist="fara-customizer"><\/script>/,
          `<script type="module" src="${bundledCustomizerPath}" data-astro-transition-persist="fara-customizer"></script>`,
        )
        .replace(
          /<link rel="stylesheet" href="\/src\/custom\.css">/,
          `<link rel="stylesheet" href="${bundledStylesPath}">`,
        )
        .replace(
          /\/_astro\/WebGL\.astro_astro_type_script_index_0_lang\.ClLv70z8\.js\?v=[^"]+/,
          '/_astro/WebGL.astro_astro_type_script_index_0_lang.ClLv70z8.js?v=stage-scroll-20260801-2',
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
})
