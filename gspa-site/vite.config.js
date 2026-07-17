import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const legacyRuntimeFiles = [
  'site-customizer.js',
  'custom.css',
  'data',
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
    closeBundle() {
      const sourceRoot = resolve(process.cwd(), 'src')
      const targetRoot = resolve(process.cwd(), 'dist', 'src')
      mkdirSync(targetRoot, { recursive: true })
      legacyRuntimeFiles.forEach(file => {
        cpSync(resolve(sourceRoot, file), resolve(targetRoot, file), { recursive: true })
      })
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
  server: { port: 5173, open: true },
})
