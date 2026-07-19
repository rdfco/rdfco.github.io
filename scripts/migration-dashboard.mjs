import { readFile } from 'node:fs/promises'

const status = JSON.parse(await readFile('migration-status.json', 'utf8'))
const rows = Object.entries(status.sections).map(([name, value]) => `| ${name} | ${value} |`).join('\n')
console.log(`# FARA migration: ${status.overall}%\n\n| Section | Status |\n|---|---|\n${rows}\n\nRemaining: ${status.remainingLegacyDependencies.length}`)
