import { readFile } from 'node:fs/promises'

const nativeApp = await readFile('src/native/NativeApp.tsx', 'utf8')
const violations = []
if (!nativeApp.includes("from '../features/home'")) violations.push('NativeApp bypasses home feature API')
if (!nativeApp.includes("from '../features/navigation'")) violations.push('NativeApp bypasses navigation feature API')
if (/function Header|AboutSection|SolutionsSection|IndustriesSection|AiSection/.test(nativeApp)) {
  violations.push('NativeApp still owns feature implementation')
}
for (const file of ['AboutSection', 'AiSection', 'IndustriesSection', 'SolutionsSection']) {
  const adapter = await readFile(`src/sections/${file}.tsx`, 'utf8')
  if (!adapter.includes("from '../features/home'")) violations.push(`src/sections/${file}.tsx is not an adapter`)
}
if (violations.length) throw new Error(`Feature boundary validation failed:\n- ${violations.join('\n- ')}`)
console.log('Feature boundaries valid: Native composition uses home and navigation public APIs.')
