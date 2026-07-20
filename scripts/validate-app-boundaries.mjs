import { readFile } from 'node:fs/promises'

const violations = []
const rootApp = await readFile('src/App.tsx', 'utf8')
const main = await readFile('src/main.tsx', 'utf8')
const app = await readFile('src/app/App.tsx', 'utf8')
const routes = await readFile('src/routes/AppRoutes.tsx', 'utf8')

if (!rootApp.includes("from './app/index'")) violations.push('src/App.tsx is not a compatibility entry')
if (!main.includes("from './app/index'")) violations.push('main.tsx bypasses the public app boundary')
if (!app.includes('<BrowserRouter>') || !app.includes('<AppRoutes')) {
  violations.push('src/app/App.tsx does not own providers and route composition')
}
if (!routes.includes('<Routes>') || !routes.includes('appConfig.routes.legacy')) {
  violations.push('src/routes/AppRoutes.tsx does not own route declarations')
}
if (/LegacySite|NativeApp/.test(routes)) violations.push('route declarations bypass page boundaries')

if (violations.length) throw new Error(`Application boundary validation failed:\n- ${violations.join('\n- ')}`)
console.log('Application boundaries valid: bootstrap, providers, routes, and pages have explicit owners.')
