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
    },
  }
}

export default defineConfig({
  plugins: [react(), copyLegacyRuntime()],
  server: { port: 5173, open: true },
})
